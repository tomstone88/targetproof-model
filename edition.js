/**
 * Edition selection — stored inside the encrypted vault when active.
 */
(function () {
    'use strict';

    const LEGACY_KEY = 'sanctuary-edition-choice';
    const VALID = ['standard', 'ai', 'connected'];

    const LABELS = {
        standard: 'TargetProof Model · Standard',
        ai: 'TargetProof Model · AI',
        connected: 'TargetProof Model · Connected'
    };

    function usesVault() {
        return window.SanctuaryVault && SanctuaryVault.isInitialized();
    }

    function getEdition() {
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

    function needsServer(edition) {
        return edition === 'ai' || edition === 'connected';
    }

    function needsLlm(edition) {
        return needsServer(edition);
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