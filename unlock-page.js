(function () {
    'use strict';

    if (!window.crypto || !window.crypto.subtle) {
        var panel = document.createElement('div');
        panel.className = 'panel';
        var msg = document.createElement('p');
        msg.textContent = 'This browser cannot run the Sanctuary vault (Web Crypto required). Use Chrome, Edge, or Firefox via START.bat / start.sh.';
        panel.appendChild(msg);
        document.body.textContent = '';
        document.body.appendChild(panel);
        return;
    }

    if (SanctuaryVault.isUnlocked()) {
        window.location.replace(SanctuaryVault.nextRouteAfterUnlock());
        return;
    }

    var createView = document.getElementById('create-view');
    var unlockView = document.getElementById('unlock-view');

    if (SanctuaryVault.isInitialized()) {
        createView.classList.add('hidden');
        unlockView.classList.remove('hidden');
    }

    function setBusy(form, busy) {
        form.querySelector('button[type="submit"]').disabled = busy;
    }

    document.getElementById('create-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var err = document.getElementById('create-error');
        err.textContent = '';
        var pass = document.getElementById('create-pass').value;
        var confirm = document.getElementById('create-confirm').value;
        if (pass.length < 14) {
            err.textContent = 'Password must be at least 14 characters.';
            return;
        }
        if (pass !== confirm) {
            err.textContent = 'Passwords do not match.';
            return;
        }
        setBusy(e.target, true);
        SanctuaryVault.createVault(pass).then(function () {
            var next = (window.TARGETPROOF_MODEL && window.TARGETPROOF_MODEL.standardOnly)
                ? 'index.html' : 'setup.html';
            window.location.replace(next);
        }).catch(function () {
            err.textContent = 'Could not create vault. Check browser storage permissions.';
            setBusy(e.target, false);
        });
    });

    document.getElementById('unlock-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var err = document.getElementById('unlock-error');
        err.textContent = '';
        var pass = document.getElementById('unlock-pass').value;
        setBusy(e.target, true);
        SanctuaryVault.unlock(pass).then(function (res) {
            if (!res.ok) {
                err.textContent = res.error || 'Incorrect password';
                setBusy(e.target, false);
                return;
            }
            window.location.replace(SanctuaryVault.nextRouteAfterUnlock());
        }).catch(function () {
            err.textContent = 'Unlock failed.';
            setBusy(e.target, false);
        });
    });

    document.getElementById('forgot-btn').addEventListener('click', function () {
        if (!confirm('This permanently erases the vault and all assessment data in this browser. Continue?')) return;
        if (!confirm('Last chance — all local model data will be lost. Erase vault?')) return;
        SanctuaryVault.destroyVault();
        window.location.reload();
    });
})();