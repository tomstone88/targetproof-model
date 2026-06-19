// TargetProof Model — runtime configuration
// USB unified builds: household picks edition on setup.html
// Standard practitioner build: set standardOnly true (see publish-standard.ps1)
window.TARGETPROOF_MODEL = window.TARGETPROOF_MODEL || {
    name: 'TargetProof Model',
    version: '1.5',
    standardOnly: true
};

if (window.TARGETPROOF_MODEL.standardOnly) {
    window.SANCTUARY_EDITION = 'standard';
}