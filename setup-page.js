(function () {
    'use strict';

    if (!SanctuaryVault.isUnlocked()) {
        location.replace('unlock.html');
        return;
    }

    var params = new URLSearchParams(location.search);
    var changeMode = params.get('change') === '1';
    var hasWebGPU = !!(navigator.gpu);
    var hasManifest = false;

    function updateAvailability() {
        var aiBanner = document.getElementById('ai-banner');
        var aiBadge = document.getElementById('ai-badge');
        var connBadge = document.getElementById('connected-badge');
        var notes = [];

        if (!hasManifest) {
            notes.push('No AI model is bundled on this drive. AI and Connected still run — the Assistant uses guided mode until a model is present, or you can add one per README.');
            aiBadge.textContent = 'Guided fallback';
            aiBadge.className = 'badge warn';
            connBadge.className = 'badge warn';
        } else if (!hasWebGPU) {
            notes.push('WebGPU not detected in this browser. Use Chrome or Edge for full on-device AI.');
            aiBadge.className = 'badge warn';
        } else {
            aiBadge.textContent = 'Model on drive';
            aiBadge.className = 'badge ok';
            connBadge.className = 'badge ok';
        }

        if (notes.length) {
            aiBanner.classList.remove('hidden');
            aiBanner.textContent = notes.join(' ');
        }
    }

    function bindEditionButtons() {
        document.querySelectorAll('[data-select]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var edition = btn.dataset.select;
                btn.disabled = true;
                Promise.resolve(SanctuaryEdition.setEdition(edition)).then(function (ok) {
                    if (!ok) {
                        alert('Could not save your choice.');
                        btn.disabled = false;
                        return;
                    }
                    location.href = 'index.html';
                });
            });
        });
    }

    function showProtocolBanner() {
        var pb = document.getElementById('protocol-banner');
        pb.classList.remove('hidden');
        pb.textContent = '';
        var strong = document.createElement('strong');
        strong.textContent = 'Tip:';
        pb.appendChild(strong);
        pb.appendChild(document.createTextNode(' For AI or Connected editions, close this window and launch via '));
        ['START.bat', 'START.command', 'start.sh'].forEach(function (cmd, i) {
            if (i) pb.appendChild(document.createTextNode(i === 1 ? ' (Mac), ' : ' (Windows), '));
            var code = document.createElement('code');
            code.textContent = cmd;
            pb.appendChild(code);
        });
        pb.appendChild(document.createTextNode(' (Linux). Standard can run from here, but the launcher is recommended on all systems.'));
    }

    SanctuaryVault.ensureCache().then(function () {
        var current = SanctuaryEdition.getEdition();
        if (current && !changeMode) {
            location.replace('index.html');
            return;
        }

        if (current && changeMode) {
            document.getElementById('continue-row').classList.remove('hidden');
            document.querySelector('h1').textContent = 'Change edition';
            document.querySelector('.lead').textContent =
                'Current: ' + SanctuaryEdition.label(current) + '. Select a different path below, or continue without changing.';
        }

        if (location.protocol === 'file:') {
            showProtocolBanner();
        }

        var ua = navigator.userAgent || '';
        var plat = /Win/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux / Unix' : 'your system';
        document.getElementById('platform-hint').textContent = 'Detected: ' + plat + ' · Sanctuary Model v1.5';

        bindEditionButtons();

        fetch('./models/manifest.json').then(function (r) {
            return r.ok ? r.json() : null;
        }).then(function (m) {
            hasManifest = !!(m && m.modelId);
            updateAvailability();
        }).catch(updateAvailability);
    });
})();