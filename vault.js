/**
 * Sanctuary Vault — password gate and encrypted local storage (Web Crypto, on-device).
 * Session AES key is a non-extractable CryptoKey in IndexedDB; sessionStorage holds only a flag.
 */
(function () {
    'use strict';

    const META_KEY = 'sanctuary-vault-meta';
    const DATA_KEY = 'sanctuary-vault-data';
    const SESSION_FLAG = 'sanctuary-vault-session';
    const SESSION_KEY = 'sanctuary-vault-key';
    const IDB_NAME = 'sanctuary-vault';
    const IDB_STORE = 'session';
    const IDB_KEY = 'aes';
    const LEGACY_MODEL = 'sanctuary-client-model-v1';
    const LEGACY_EDITION = 'sanctuary-edition-choice';
    const VERIFIER_TEXT = 'SANCTUARY_VAULT_OK_v1';
    const EXPORT_FORMAT = 'sanctuary-export-v1';
    const PBKDF2_ITERATIONS = 250000;
    const MIN_EXPORT_PASSWORD = 14;

    let cache = null;
    let idbPromise = null;

    function b64(buf) {
        const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
        let s = '';
        bytes.forEach(b => { s += String.fromCharCode(b); });
        return btoa(s);
    }

    function ub64(str) {
        const bin = atob(str);
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
        return out;
    }

    function openIdb() {
        if (!idbPromise) {
            idbPromise = new Promise((resolve, reject) => {
                const req = indexedDB.open(IDB_NAME, 1);
                req.onupgradeneeded = () => {
                    req.result.createObjectStore(IDB_STORE);
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
        }
        return idbPromise;
    }

    async function storeSessionKey(key) {
        const db = await openIdb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.objectStore(IDB_STORE).put(key, IDB_KEY);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async function loadSessionKey() {
        const db = await openIdb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_STORE, 'readonly');
            const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    }

    async function clearSessionKey() {
        try {
            const db = await openIdb();
            await new Promise((resolve, reject) => {
                const tx = db.transaction(IDB_STORE, 'readwrite');
                tx.objectStore(IDB_STORE).delete(IDB_KEY);
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        } catch {}
    }

    function isInitialized() {
        try {
            return !!localStorage.getItem(META_KEY);
        } catch {
            return false;
        }
    }

    function isUnlocked() {
        try {
            return !!sessionStorage.getItem(SESSION_FLAG);
        } catch {
            return false;
        }
    }

    function lock() {
        try {
            sessionStorage.removeItem(SESSION_FLAG);
            sessionStorage.removeItem(SESSION_KEY);
        } catch {}
        clearSessionKey().catch(() => {});
        cache = null;
    }

    function requireUnlocked(redirect) {
        if (!isInitialized()) {
            window.location.replace(redirect || 'unlock.html');
            return false;
        }
        if (!isUnlocked()) {
            window.location.replace(redirect || 'unlock.html');
            return false;
        }
        return true;
    }

    async function deriveKey(password, salt) {
        const enc = new TextEncoder();
        const base = await crypto.subtle.importKey(
            'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
        );
        const bits = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
            base, 256
        );
        return crypto.subtle.importKey(
            'raw', bits, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
        );
    }

    async function toSessionKey(key) {
        if (!key.extractable) return key;
        const raw = await crypto.subtle.exportKey('raw', key);
        return crypto.subtle.importKey(
            'raw', raw, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
        );
    }

    async function encrypt(key, plaintext) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const enc = new TextEncoder();
        const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
        return { iv: b64(iv), ct: b64(ct) };
    }

    async function decrypt(key, payload) {
        const dec = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: ub64(payload.iv) },
            key, ub64(payload.ct)
        );
        return new TextDecoder().decode(dec);
    }

    async function migrateLegacySessionKey() {
        let legacy;
        try {
            legacy = sessionStorage.getItem(SESSION_KEY);
        } catch {
            return;
        }
        if (!legacy) return;
        try {
            const key = await crypto.subtle.importKey(
                'raw', ub64(legacy), { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
            );
            await storeSessionKey(key);
            sessionStorage.removeItem(SESSION_KEY);
        } catch {
            sessionStorage.removeItem(SESSION_KEY);
        }
    }

    async function establishSession(key) {
        await storeSessionKey(await toSessionKey(key));
        sessionStorage.setItem(SESSION_FLAG, String(Date.now()));
        sessionStorage.removeItem(SESSION_KEY);
    }

    async function getSessionKey() {
        if (!isUnlocked()) return null;
        await migrateLegacySessionKey();
        const key = await loadSessionKey();
        if (!key) {
            lock();
            return null;
        }
        return key;
    }

    function emptyCache() {
        return { model: null, edition: null };
    }

    async function readEncryptedData() {
        const key = await getSessionKey();
        if (!key) return emptyCache();
        const raw = localStorage.getItem(DATA_KEY);
        if (!raw) return emptyCache();
        try {
            const payload = JSON.parse(raw);
            const json = await decrypt(key, payload);
            const data = JSON.parse(json);
            return {
                model: data.model || null,
                edition: data.edition || null
            };
        } catch {
            return emptyCache();
        }
    }

    async function writeEncryptedData(data) {
        const key = await getSessionKey();
        if (!key) throw new Error('Vault is locked');
        const payload = await encrypt(key, JSON.stringify({
            model: data.model || null,
            edition: data.edition || null
        }));
        localStorage.setItem(DATA_KEY, JSON.stringify(payload));
        cache = { model: data.model || null, edition: data.edition || null };
    }

    function migratePlaintextIntoCache() {
        let model = null;
        let edition = null;
        try {
            const raw = localStorage.getItem(LEGACY_MODEL);
            if (raw) model = JSON.parse(raw);
            const ed = localStorage.getItem(LEGACY_EDITION);
            if (ed) edition = ed;
            localStorage.removeItem(LEGACY_MODEL);
            localStorage.removeItem(LEGACY_EDITION);
        } catch {}
        if (model || edition) {
            cache = { model, edition };
        }
    }

    async function ensureCache() {
        if (cache) return cache;
        if (!isUnlocked()) return emptyCache();
        cache = await readEncryptedData();
        return cache;
    }

    async function createVault(password) {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const key = await deriveKey(password, salt);
        const verifier = await encrypt(key, VERIFIER_TEXT);
        localStorage.setItem(META_KEY, JSON.stringify({
            v: 1,
            salt: b64(salt),
            verifier,
            iterations: PBKDF2_ITERATIONS,
            createdAt: new Date().toISOString()
        }));
        await establishSession(key);
        cache = emptyCache();
        migratePlaintextIntoCache();
        await writeEncryptedData(cache);
        return { ok: true };
    }

    async function unlock(password) {
        let meta;
        try {
            meta = JSON.parse(localStorage.getItem(META_KEY));
        } catch {
            return { ok: false, error: 'Vault not initialized' };
        }
        if (!meta || !meta.salt || !meta.verifier) {
            return { ok: false, error: 'Vault corrupted' };
        }
        const key = await deriveKey(password, ub64(meta.salt));
        try {
            const plain = await decrypt(key, meta.verifier);
            if (plain !== VERIFIER_TEXT) {
                return { ok: false, error: 'Incorrect password' };
            }
        } catch {
            return { ok: false, error: 'Incorrect password' };
        }
        await establishSession(key);
        cache = await readEncryptedData();
        return { ok: true };
    }

    function destroyVault() {
        lock();
        try {
            localStorage.removeItem(META_KEY);
            localStorage.removeItem(DATA_KEY);
            localStorage.removeItem(LEGACY_MODEL);
            localStorage.removeItem(LEGACY_EDITION);
        } catch {}
        cache = null;
    }

    function getModel() {
        return cache && cache.model ? cache.model : null;
    }

    function setModel(model) {
        if (!cache) cache = emptyCache();
        cache.model = model;
    }

    function getEdition() {
        const valid = ['standard', 'ai', 'connected'];
        const ed = cache && cache.edition;
        return valid.includes(ed) ? ed : null;
    }

    async function setEdition(edition) {
        const valid = ['standard', 'ai', 'connected'];
        if (!valid.includes(edition)) return false;
        if (!cache) cache = emptyCache();
        cache.edition = edition;
        await persist();
        return true;
    }

    async function persist() {
        if (!cache) cache = emptyCache();
        await writeEncryptedData(cache);
    }

    function nextRouteAfterUnlock() {
        if (window.TARGETPROOF_MODEL && window.TARGETPROOF_MODEL.standardOnly) {
            return 'index.html';
        }
        const ed = getEdition();
        return ed ? 'index.html' : 'setup.html';
    }

    function isEncryptedExport(text) {
        try {
            const data = JSON.parse(text);
            return !!(data && data.format === EXPORT_FORMAT && data.salt && data.iv && data.ct);
        } catch {
            return false;
        }
    }

    async function encryptExport(plaintext, password) {
        if (!password || password.length < MIN_EXPORT_PASSWORD) {
            throw new Error('Export password must be at least ' + MIN_EXPORT_PASSWORD + ' characters');
        }
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const key = await deriveKey(password, salt);
        const payload = await encrypt(key, plaintext);
        return JSON.stringify({
            format: EXPORT_FORMAT,
            v: 1,
            salt: b64(salt),
            iterations: PBKDF2_ITERATIONS,
            exportedAt: new Date().toISOString(),
            iv: payload.iv,
            ct: payload.ct
        }, null, 2);
    }

    async function decryptExport(text, password) {
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error('Invalid export file');
        }
        if (!isEncryptedExport(text)) throw new Error('Not an encrypted export');
        const key = await deriveKey(password, ub64(data.salt));
        return await decrypt(key, { iv: data.iv, ct: data.ct });
    }

    window.SanctuaryVault = {
        isInitialized,
        isUnlocked,
        requireUnlocked,
        createVault,
        unlock,
        lock,
        destroyVault,
        ensureCache,
        getModel,
        setModel,
        getEdition,
        setEdition,
        persist,
        nextRouteAfterUnlock,
        isEncryptedExport,
        encryptExport,
        decryptExport
    };
})();