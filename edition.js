/**
 * Edition selection — stored inside the encrypted vault when active.
 */
(function () {
    'use strict';

    const LEGACY_KEY = 'sanctuary-edition-choice';
    const VALID = ['standard'];

    const LABELS = {
        standard: 'Sanctuary Model · Standard Edition'
    };

    function isStandardOnly() {
        return !!(window.TARGETPROOF_MODEL && window.TARGETPROOF_MODEL.standardOnly);
    }

    function usesVault() {
        return window.SanctuaryVault && SanctuaryVault.isInitialized();
    }

    function getEdition() {
        if (isStandardOnly()) return 'standard';
        if (usesVault()) {
            return SanctuaryVault.getEdition();
        }
        try {
            const v = localStorage.getItem(LEGACY_KEY);
            return VALID.includes(v) ? v : null;
        } catch {
            return null;
        }
    }

    async function setEdition(edition) {
        if (isStandardOnly()) edition = 'standard';
        if (!VALID.includes(edition)) return false;
        if (usesVault()) {
            return SanctuaryVault.setEdition(edition);
        }
        try {
            localStorage.setItem(LEGACY_KEY, edition);
            window.SANCTUARY_EDITION = edition;
            document.documentElement.dataset.edition = edition;
            return true;
        } catch {
            return false;
        }
    }

    function applyEditionToDocument() {
        const edition = getEdition();
        if (edition) {
            window.SANCTUARY_EDITION = edition;
            document.documentElement.dataset.edition = edition;
        }
        return edition;
    }

    function needsServer() {
        return false;
    }

    function needsLlm() {
        return false;
    }

    function label(edition) {
        return LABELS[edition] || 'Not selected';
    }

    window.SanctuaryEdition = {
        VALID,
        LABELS,
        getEdition,
        setEdition,
        applyEditionToDocument,
        needsServer,
        needsLlm,
        label
    };
})();