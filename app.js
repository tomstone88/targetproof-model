(function () {
    'use strict';

    const STORAGE_KEY = 'sanctuary-client-model-v1';
    const FN_ORDER = ['govern', 'identify', 'protect', 'detect', 'respond', 'recover'];

    const STATUS = {
        inplace: { label: 'In Place', cls: 'selected-inplace', weight: 1 },
        partial: { label: 'Partial', cls: 'selected-partial', weight: 0.5 },
        gap: { label: 'Gap', cls: 'selected-gap', weight: 0 },
        na: { label: 'N/A', cls: 'selected-na', weight: null }
    };

    const LAYER_COLORS = { physical: '#f97316', digital: '#60a5fa', human: '#a78bfa' };
    const DIM_COLORS = { people: '#60a5fa', institutions: '#c084fc', lifestyle: '#fbbf24' };

    const INTAKE_SCHEMA = [
        {
            section: 'Scope', id: 'INTAKE-01', title: 'Properties & Assets', type: 'repeatable',
            prompt: 'Every residence, vehicle, aircraft, and staffed location in scope.',
            fields: [
                { key: 'name', label: 'Name', type: 'text', placeholder: 'Aspen estate' },
                { key: 'assetType', label: 'Type', type: 'select', options: ['Primary residence', 'Secondary residence', 'Staff housing', 'Commercial', 'Vehicle', 'Aircraft', 'Yacht', 'Other'] },
                { key: 'location', label: 'Location', type: 'text' },
                { key: 'staffed', label: 'Staff on site', type: 'select', options: ['Yes', 'No', 'Seasonal'] }
            ]
        },
        {
            section: 'Scope', id: 'INTAKE-02', title: 'Household Participants', type: 'repeatable',
            prompt: 'Principals, family members, and staff involved in this assessment.',
            fields: [
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'role', label: 'Role', type: 'select', options: ['Principal', 'Spouse / Partner', 'Child', 'Family office', 'Household staff', 'Advisor', 'Other'] },
                { key: 'visibility', label: 'Public visibility', type: 'select', options: ['High', 'Moderate', 'Low', 'None'] }
            ]
        },
        {
            section: 'Institutions', id: 'INTAKE-03', title: 'Family Office & Advisors', type: 'repeatable',
            prompt: 'Entities and professional advisors with access to family systems or decisions.',
            fields: [
                { key: 'name', label: 'Name / Entity', type: 'text' },
                { key: 'role', label: 'Function', type: 'select', options: ['Family office', 'Legal', 'Tax', 'Wealth management', 'Insurance', 'IT / MSP', 'Physical security', 'Executive protection', 'Other'] },
                { key: 'access', label: 'Access level', type: 'select', options: ['Full', 'Financial only', 'Property only', 'Advisory only', 'Limited'] }
            ]
        },
        {
            section: 'Lifestyle', id: 'INTAKE-04', title: 'Travel & Public Exposure', type: 'structured',
            fields: [
                { key: 'travelFrequency', label: 'Travel frequency', type: 'select', options: ['Weekly', 'Monthly', 'Quarterly', 'Rarely'] },
                { key: 'typicalDestinations', label: 'Typical destinations', type: 'text', placeholder: 'Cities, regions, properties' },
                { key: 'publicVisibility', label: 'Overall public profile', type: 'select', options: ['High — media / public figure', 'Moderate — industry known', 'Low — private', 'Minimal'] },
                { key: 'upcomingEvents', label: 'Upcoming high-exposure events', type: 'textarea', rows: 2, placeholder: 'Galas, board meetings, public appearances…' }
            ]
        },
        {
            section: 'History', id: 'INTAKE-05', title: 'Security Incidents (36 months)', type: 'repeatable',
            prompt: 'Fraud attempts, breaches, near-misses, or physical security events.',
            fields: [
                { key: 'date', label: 'Date', type: 'date' },
                { key: 'incidentType', label: 'Type', type: 'select', options: ['Fraud attempt', 'Cyber incident', 'Physical security', 'Social engineering', 'Privacy breach', 'Near miss', 'Other'] },
                { key: 'description', label: 'What happened', type: 'textarea', rows: 2 },
                { key: 'status', label: 'Status', type: 'select', options: ['Resolved', 'Ongoing', 'Unresolved'] }
            ]
        },
        {
            section: 'Technology', id: 'INTAKE-06', title: 'Technology & Vendors', type: 'structured',
            fields: [
                { key: 'ispVendor', label: 'ISP / connectivity vendor', type: 'text' },
                { key: 'integrator', label: 'Smart-home / AV integrator', type: 'text' },
                { key: 'securityVendor', label: 'Physical security vendor', type: 'text' },
                { key: 'networkNotes', label: 'Network architecture notes', type: 'textarea', rows: 2, placeholder: 'VLANs, guest Wi-Fi, remote access…' }
            ]
        },
        {
            section: 'Constraints', id: 'INTAKE-07', title: 'Constraints & Preferences', type: 'structured',
            fields: [
                { key: 'aesthetic', label: 'Aesthetic / architectural constraints', type: 'textarea', rows: 2 },
                { key: 'usability', label: 'Usability requirements', type: 'textarea', rows: 2, placeholder: 'What must not disrupt daily life?' },
                { key: 'privacy', label: 'Privacy preferences', type: 'textarea', rows: 2, placeholder: 'Staff access, cameras, monitoring boundaries…' }
            ]
        },
        {
            section: 'Goals', id: 'INTAKE-08', title: 'Assessment Goals', type: 'checklist',
            options: [
                'Peace of mind about family physical safety',
                'Reduce digital exposure and online targeting',
                'Harden primary residence',
                'Improve staff security discipline',
                'Crisis and incident preparedness',
                'Crypto / digital asset protection',
                'Multi-property consistency',
                'Governance and policy clarity'
            ],
            followUp: { key: 'additionalGoals', label: 'Additional goals', type: 'textarea', rows: 2 }
        }
    ];

    const SUMMARY_FIELDS = [
        ['critical-gaps', 'criticalGaps'],
        ['threat-context', 'threatContext'],
        ['summary-people', 'people'],
        ['summary-institutions', 'institutions'],
        ['summary-lifestyle', 'lifestyle'],
        ['roadmap-30', 'roadmap30'],
        ['roadmap-90', 'roadmap90'],
        ['roadmap-180', 'roadmap180']
    ];

    let model = null;
    let saveTimer = null;
    let currentView = 'setup';
    let controlFilter = 'all';
    let spectrumFilter = 'all';
    let catalogRendered = false;

    function emptyModel() {
        return {
            version: '1.5',
            meta: {
                clientName: '', properties: '', internalOwner: '', preparedBy: '',
                handoffDate: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },
            intake: {},
            controls: {},
            spectrum: { marked: [] },
            summary: {
                criticalGaps: '', threatContext: '', people: '', institutions: '', lifestyle: '',
                roadmap30: '', roadmap90: '', roadmap180: '',
                generatedAt: null, userEdited: {}
            },
            review: {
                effectiveness: '', wouldRepeat: '', wouldRecommend: '',
                residualRiskAccepted: '', improvements: '', reviewedAt: null
            },
            assistant: { messages: [], contextBuiltAt: null },
            knowledge: window.SanctuaryKnowledge ? window.SanctuaryKnowledge.emptyKnowledge() : null
        };
    }

    function migrateModel(data) {
        if (!data.summary) data.summary = emptyModel().summary;
        if (!data.assistant) data.assistant = { messages: [], contextBuiltAt: null };
        if (!data.assistant.messages) data.assistant.messages = [];
        if (!data.spectrum) data.spectrum = { marked: [] };
        if (!data.spectrum.marked) data.spectrum.marked = [];
        if (!data.review) data.review = emptyModel().review;
        if (window.SanctuaryKnowledge && window.SanctuaryKnowledge.isConnectedEdition()) {
            window.SanctuaryKnowledge.ensureKnowledgeShape(data);
        }
        const s = data.summary;
        if (s.roadmap && !s.roadmap30) {
            s.roadmap30 = s.roadmap;
            delete s.roadmap;
        }
        if (!s.roadmap30) s.roadmap30 = '';
        if (!s.roadmap90) s.roadmap90 = '';
        if (!s.roadmap180) s.roadmap180 = '';
        if (!s.userEdited) s.userEdited = {};
        if (!s.generatedAt) s.generatedAt = null;
        data.version = '1.5';
        return data;
    }

    function getFramework() {
        return typeof SANCTUARY_FRAMEWORK !== 'undefined' ? SANCTUARY_FRAMEWORK : null;
    }

    function buildIntakeSignals() {
        const signals = new Set();
        const travel = getIntakeValue('INTAKE-04') || {};
        const tech = getIntakeValue('INTAKE-06') || {};
        const goals = getIntakeValue('INTAKE-08') || {};
        if (travel.publicVisibility && /high|moderate/i.test(travel.publicVisibility)) signals.add('visibility');
        if (travel.typicalDestinations || travel.upcomingEvents || travel.travelFrequency) signals.add('travel');
        if (getIntakeRows('INTAKE-01').length) signals.add('property');
        if (getIntakeRows('INTAKE-02').some(p => p.role && /staff/i.test(p.role))) signals.add('staff');
        if (getIntakeRows('INTAKE-02').length) signals.add('people');
        if (getIntakeRows('INTAKE-03').length) signals.add('advisor');
        if (getIntakeRows('INTAKE-03').length) signals.add('institutions');
        if (getIntakeRows('INTAKE-05').some(i => /fraud|wire|cyber|social/i.test((i.incidentType || '') + (i.description || '')))) {
            signals.add('wire');
        }
        if (getIntakeRows('INTAKE-05').length) signals.add('incidents');
        if (tech.integrator || tech.ispVendor || tech.securityVendor) signals.add('technology');
        if (Array.isArray(goals.selected) && goals.selected.some(g => /crypto/i.test(g))) signals.add('crypto');
        if (Array.isArray(goals.selected) && goals.selected.some(g => /staff|people|family/i.test(g))) signals.add('staff');
        if (window.SanctuaryKnowledge && window.SanctuaryKnowledge.isConnectedEdition()) {
            window.SanctuaryKnowledge.getSignals(model).forEach(s => signals.add(s));
        }
        return signals;
    }

    function spectrumItemMatches(signals, item) {
        if (!item.signals || !item.signals.length) return false;
        return item.signals.some(sig => signals.has(sig));
    }

    function renderLoopGrid(elId, activeNav, clickable) {
        const el = document.getElementById(elId);
        const fw = getFramework();
        if (!el || !fw) return;
        el.innerHTML = fw.methodology.fourQuestions.map((q, i) => {
            const active = activeNav && q.nav === activeNav ? ' active-phase' : '';
            const navAttr = clickable && q.nav ? ' data-loop-nav="' + q.nav + '" role="button" tabindex="0"' : '';
            return '<div class="loop-card' + active + (clickable ? ' loop-card--clickable' : '') + '"' + navAttr + '>' +
                '<div class="loop-card-head">' +
                '<span class="loop-num">Q' + (i + 1) + '</span>' +
                '<div><div class="loop-phase">' + q.phase + '</div>' +
                '<div class="loop-title">' + q.question + '</div></div></div>' +
                '<p class="loop-desc">' + q.summary + '</p></div>';
        }).join('');
        if (clickable) {
            el.querySelectorAll('[data-loop-nav]').forEach(card => {
                const go = () => setView(card.dataset.loopNav);
                card.addEventListener('click', go);
                card.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
                });
            });
        }
    }

    function renderSetupLoop() {
        renderLoopGrid('setup-loop', null, true);
    }

    function renderNistGrid() {
        const el = document.getElementById('nist-grid');
        const fw = getFramework();
        if (!el || !fw) return;
        el.innerHTML = fw.nistCsf.functions.map(fn => {
            const stats = getMaturityStats().fnStats[fn.id];
            const pct = stats && stats.scored ? Math.round((stats.weight / stats.scored) * 100) : 0;
            return '<div class="nist-card"><div class="nist-code">' + fn.code + ' · ' + fn.name + '</div>' +
                '<p style="font-size:0.8rem;color:var(--dim);margin:0.4rem 0">' + fn.outcome + '</p>' +
                '<p style="font-size:0.75rem;color:var(--muted);margin:0 0 0.5rem">' + fn.sanctuary + '</p>' +
                (stats ? '<div style="font-size:0.7rem;color:var(--gold)">' + pct + '% scored maturity</div>' : '') +
                '</div>';
        }).join('');
    }

    function renderFtcList() {
        const el = document.getElementById('ftc-list');
        const fw = getFramework();
        if (!el || !fw) return;
        const signals = buildIntakeSignals();
        el.innerHTML = fw.ftcAdvisories.map(item => {
            const match = spectrumItemMatches(signals, item);
            return '<div class="card spectrum-card' + (match ? ' relevant' : '') + '" data-spectrum-id="' + item.id + '">' +
                '<div style="display:flex;justify-content:space-between;gap:0.5rem;flex-wrap:wrap">' +
                '<strong style="color:white;font-size:0.95rem">' + item.title + '</strong>' +
                (match ? '<span class="spectrum-tag match">Matches intake</span>' : '') + '</div>' +
                '<p style="font-size:0.8rem;color:var(--muted);margin:0.35rem 0">' + item.source + '</p>' +
                '<p style="font-size:0.85rem;color:var(--dim);margin:0">' + item.theme + '</p>' +
                '<p style="font-size:0.85rem;color:var(--dim);margin:0.5rem 0 0"><em>UHNWI:</em> ' + item.uhnwiAngle + '</p>' +
                '<div class="spectrum-controls">Controls: ' + item.controls.join(', ') + '</div></div>';
        }).join('');
    }

    function renderWhaleList() {
        const el = document.getElementById('whale-list');
        const fw = getFramework();
        if (!el || !fw) return;
        const signals = buildIntakeSignals();
        const marked = new Set(model.spectrum.marked || []);
        el.innerHTML = fw.whalePatterns.map(item => {
            const match = spectrumItemMatches(signals, item);
            const isMarked = marked.has(item.id);
            if (spectrumFilter === 'matched' && !match) return '';
            if (spectrumFilter === 'marked' && !isMarked) return '';
            return '<div class="card spectrum-card' + (match || isMarked ? ' relevant' : '') + '" data-whale-id="' + item.id + '">' +
                '<div style="display:flex;justify-content:space-between;gap:0.5rem;flex-wrap:wrap;align-items:flex-start">' +
                '<div><strong style="color:white">' + item.title + '</strong>' +
                '<div class="spectrum-meta"><span class="spectrum-tag">' + item.category + '</span>' +
                '<span class="spectrum-tag">' + item.period + '</span>' +
                (match ? '<span class="spectrum-tag match">Matches intake</span>' : '') + '</div></div>' +
                '<button type="button" class="btn' + (isMarked ? ' btn-primary' : '') + ' btn-mark-spectrum" data-mark="' + item.id + '">' +
                (isMarked ? 'Marked' : 'Relevant to us') + '</button></div>' +
                '<p style="font-size:0.85rem;color:var(--dim);margin:0.5rem 0">' + item.pattern + '</p>' +
                '<p style="font-size:0.8rem;color:var(--muted);margin:0">' + item.publicNote + '</p>' +
                '<p style="font-size:0.85rem;color:var(--gold);margin:0.75rem 0 0">' + item.lesson + '</p>' +
                '<div class="spectrum-controls">Controls: ' + item.controls.join(', ') + '</div></div>';
        }).join('');

        el.querySelectorAll('.btn-mark-spectrum').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.mark;
                const set = new Set(model.spectrum.marked || []);
                if (set.has(id)) set.delete(id); else set.add(id);
                model.spectrum.marked = [...set];
                scheduleSave();
                renderWhaleList();
            });
        });
    }

    function renderSpectrum() {
        renderLoopGrid('spectrum-loop', 'spectrum');
        renderNistGrid();
        renderFtcList();
        renderWhaleList();
    }

    function renderReview() {
        renderLoopGrid('review-loop', 'review');
        const dash = document.getElementById('review-dashboard');
        if (dash) {
            const { maturityPct, totalScored, total } = getMaturityStats();
            const marked = (model.spectrum.marked || []).length;
            dash.innerHTML =
                '<div class="stat-card accent-gold"><div class="stat-num">' + maturityPct + '%</div><div class="stat-label">Maturity at review</div></div>' +
                '<div class="stat-card"><div class="stat-num">' + totalScored + '/' + total + '</div><div class="stat-label">Controls scored</div></div>' +
                '<div class="stat-card"><div class="stat-num">' + marked + '</div><div class="stat-label">Patterns marked</div></div>' +
                '<div class="stat-card"><div class="stat-num">' + gapCount() + '</div><div class="stat-label">Open gaps</div></div>';
        }
        const r = model.review;
        [['review-eff', 'effectiveness'], ['review-repeat', 'wouldRepeat'], ['review-rec', 'wouldRecommend']].forEach(([name, key]) => {
            document.querySelectorAll('input[name="' + name + '"]').forEach(inp => {
                inp.checked = r[key] === inp.value;
            });
        });
        const residual = document.getElementById('review-residual');
        const improve = document.getElementById('review-improvements');
        if (residual) residual.value = r.residualRiskAccepted || '';
        if (improve) improve.value = r.improvements || '';
        const ts = document.getElementById('review-timestamp');
        if (ts) ts.textContent = r.reviewedAt ? 'Last reviewed · ' + new Date(r.reviewedAt).toLocaleString() : '';
    }

    function bindReview() {
        document.querySelectorAll('input[name="review-eff"]').forEach(inp => {
            inp.addEventListener('change', () => {
                if (inp.checked) { model.review.effectiveness = inp.value; model.review.reviewedAt = new Date().toISOString(); scheduleSave(); renderReview(); }
            });
        });
        document.querySelectorAll('input[name="review-repeat"]').forEach(inp => {
            inp.addEventListener('change', () => {
                if (inp.checked) { model.review.wouldRepeat = inp.value; model.review.reviewedAt = new Date().toISOString(); scheduleSave(); renderReview(); }
            });
        });
        document.querySelectorAll('input[name="review-rec"]').forEach(inp => {
            inp.addEventListener('change', () => {
                if (inp.checked) { model.review.wouldRecommend = inp.value; model.review.reviewedAt = new Date().toISOString(); scheduleSave(); renderReview(); }
            });
        });
        ['review-residual', 'review-improvements'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('input', () => {
                model.review[id === 'review-residual' ? 'residualRiskAccepted' : 'improvements'] = el.value;
                model.review.reviewedAt = new Date().toISOString();
                scheduleSave();
            });
        });
    }

    function buildSpectrumThreatLines() {
        const fw = getFramework();
        if (!fw) return [];
        const signals = buildIntakeSignals();
        const marked = new Set(model.spectrum.marked || []);
        const lines = [];
        const matchedWhales = fw.whalePatterns.filter(w => spectrumItemMatches(signals, w) || marked.has(w.id));
        const matchedFtc = fw.ftcAdvisories.filter(f => spectrumItemMatches(signals, f));
        if (matchedWhales.length) {
            lines.push('Relevant UHNWI patterns (' + matchedWhales.length + '):');
            matchedWhales.slice(0, 6).forEach(w => lines.push('• ' + w.title + ' — ' + w.lesson));
        }
        if (matchedFtc.length) {
            lines.push('FTC-aligned warnings (' + matchedFtc.length + '):');
            matchedFtc.slice(0, 4).forEach(f => lines.push('• ' + f.title));
        }
        return lines;
    }

    function loadModelFromVault() {
        if (window.SanctuaryVault && SanctuaryVault.isInitialized()) {
            const stored = SanctuaryVault.getModel();
            model = stored ? migrateModel(stored) : emptyModel();
            return;
        }
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            model = raw ? migrateModel(JSON.parse(raw)) : emptyModel();
        } catch (e) {
            model = emptyModel();
        }
    }

    function saveModel() {
        model.meta.updatedAt = new Date().toISOString();
        if (window.SanctuaryVault && SanctuaryVault.isInitialized()) {
            SanctuaryVault.setModel(model);
            SanctuaryVault.persist().then(() => {
                updateSaveIndicator();
                updateStats();
                updateControlProgress();
                markSummaryStaleIfNeeded();
            });
            return;
        }
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
        } catch (e) {}
        updateSaveIndicator();
        updateStats();
        updateControlProgress();
        markSummaryStaleIfNeeded();
    }

    function scheduleSave() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            saveModel();
            if (currentView === 'spectrum') renderSpectrum();
        }, 400);
    }

    function forEachControl(fn) {
        SANCTUARY_CATALOG.functions.forEach(sf => {
            sf.categories.forEach(cat => {
                cat.controls.forEach(ctrl => fn(ctrl, cat, sf));
            });
        });
    }

    function getControlRecord(id) {
        return model.controls[id] || {};
    }

    function countControls() {
        let n = 0;
        forEachControl(() => { n++; });
        return n;
    }

    function scoredControls() {
        return Object.keys(model.controls).filter(id => model.controls[id].status).length;
    }

    function gapCount() {
        return Object.values(model.controls).filter(c => c.status === 'gap').length;
    }

    function partialCount() {
        return Object.values(model.controls).filter(c => c.status === 'partial').length;
    }

    function getMaturityStats() {
        const fnStats = {};
        const dimStats = { people: { gap: 0, partial: 0, inplace: 0, scored: 0 }, institutions: { gap: 0, partial: 0, inplace: 0, scored: 0 }, lifestyle: { gap: 0, partial: 0, inplace: 0, scored: 0 } };
        let totalWeight = 0, totalScored = 0, totalApplicable = 0;

        forEachControl((ctrl, cat, sf) => {
            const st = getControlRecord(ctrl.id).status;
            if (!fnStats[sf.id]) fnStats[sf.id] = { name: sf.name, nist: sf.nist, total: 0, scored: 0, weight: 0, gaps: 0, partials: 0 };
            const fs = fnStats[sf.id];
            fs.total++;
            if (st && st !== 'na') {
                fs.scored++;
                totalScored++;
                const w = STATUS[st].weight;
                if (w !== null) {
                    fs.weight += w;
                    totalWeight += w;
                    totalApplicable++;
                }
                if (st === 'gap') fs.gaps++;
                if (st === 'partial') fs.partials++;
            }
            ctrl.dimensions.forEach(d => {
                if (!dimStats[d]) return;
                if (st && st !== 'na') {
                    dimStats[d].scored++;
                    dimStats[d][st === 'inplace' ? 'inplace' : st]++;
                }
            });
        });

        const maturityPct = totalApplicable ? Math.round((totalWeight / totalApplicable) * 100) : 0;
        return { fnStats, dimStats, maturityPct, totalScored, total: countControls() };
    }

    function getScoredControlList() {
        const list = [];
        forEachControl((ctrl, cat, sf) => {
            const rec = getControlRecord(ctrl.id);
            if (!rec.status || rec.status === 'na') return;
            list.push({
                id: ctrl.id, statement: ctrl.statement, status: rec.status, note: rec.note || '',
                category: cat.id, categoryName: cat.name, functionId: sf.id, functionName: sf.name,
                nist: sf.nist, dimensions: ctrl.dimensions, layers: ctrl.layers, controlType: ctrl.controlType
            });
        });
        return list;
    }

    function sortByFunctionOrder(list) {
        return list.sort((a, b) => {
            const fa = FN_ORDER.indexOf(a.functionId), fb = FN_ORDER.indexOf(b.functionId);
            if (fa !== fb) return fa - fb;
            return a.id.localeCompare(b.id);
        });
    }

    function formatControlLine(item, includeStatus) {
        let line = item.id + ' — ' + item.statement;
        if (item.note) line += ' [' + item.note + ']';
        if (includeStatus && item.status === 'partial') line = '(Partial) ' + line;
        const svc = getServiceById(getServiceIdForControl(item.id));
        if (svc) line += ' → ' + (svc.shortName || svc.name);
        return line;
    }

    function generateSummaryContent() {
        const scored = getScoredControlList();
        const gaps = sortByFunctionOrder(scored.filter(c => c.status === 'gap'));
        const partials = sortByFunctionOrder(scored.filter(c => c.status === 'partial'));

        let criticalGaps = '';
        if (gaps.length) {
            criticalGaps = gaps.map((g, i) => (i + 1) + '. [' + g.nist + ' / ' + g.category + '] ' + formatControlLine(g, false)).join('\n');
        } else if (partials.length) {
            criticalGaps = 'No full gaps recorded. Priority partial controls:\n' +
                partials.slice(0, 10).map((g, i) => (i + 1) + '. ' + formatControlLine(g, true)).join('\n');
        } else {
            criticalGaps = 'No gaps or partial controls scored yet. Complete the Controls tab first.';
        }

        function dimSummary(dim) {
            const items = sortByFunctionOrder(scored.filter(c => c.dimensions.includes(dim) && (c.status === 'gap' || c.status === 'partial')));
            if (!items.length) return 'No gaps or partial controls in the ' + dim + ' dimension.';
            const gapLines = items.filter(c => c.status === 'gap').map(g => '• ' + formatControlLine(g, false));
            const partialLines = items.filter(c => c.status === 'partial').map(g => '• ' + formatControlLine(g, true));
            return (gapLines.length ? 'Gaps:\n' + gapLines.join('\n') : '') +
                (gapLines.length && partialLines.length ? '\n\n' : '') +
                (partialLines.length ? 'Partials:\n' + partialLines.join('\n') : '');
        }

        const threatParts = [];
        const travel = getIntakeValue('INTAKE-04');
        if (travel && typeof travel === 'object') {
            if (travel.publicVisibility) threatParts.push('Public profile: ' + travel.publicVisibility);
            if (travel.typicalDestinations) threatParts.push('Travel destinations: ' + travel.typicalDestinations);
            if (travel.upcomingEvents) threatParts.push('Upcoming exposure: ' + travel.upcomingEvents);
        }
        const incidents = getIntakeRows('INTAKE-05');
        if (incidents.length) {
            threatParts.push('Recent incidents (' + incidents.length + '):');
            incidents.forEach(inc => {
                if (inc.description) threatParts.push('• [' + (inc.incidentType || 'Incident') + '] ' + inc.description);
            });
        }
        const principals = getIntakeRows('INTAKE-02').filter(p => p.visibility === 'High' || p.visibility === 'Moderate');
        if (principals.length) {
            threatParts.push('Elevated-visibility participants: ' + principals.map(p => p.name + ' (' + p.visibility + ')').filter(Boolean).join(', '));
        }
        const spectrumLines = buildSpectrumThreatLines();
        if (spectrumLines.length) threatParts.push(spectrumLines.join('\n'));
        if (window.SanctuaryKnowledge && window.SanctuaryKnowledge.isConnectedEdition()) {
            const kFacts = window.SanctuaryKnowledge.confirmedFacts(model).slice(0, 6);
            if (kFacts.length) {
                threatParts.push('Confirmed knowledge (calendar / network / comms / phone):\n' +
                    kFacts.map(f => '• [' + f.source + '] ' + f.summary).join('\n'));
            }
        }
        const threatContext = threatParts.length ? threatParts.join('\n\n') : 'Complete Intake and review the Spectrum tab to enrich threat context with UHNWI patterns and regulator warnings.';

        function roadmapForPrefixes(prefixes, label) {
            const items = gaps.filter(g => prefixes.some(p => g.category.startsWith(p)));
            if (!items.length) return 'No ' + label + ' gaps identified.';
            return items.map((g, i) => (i + 1) + '. ' + g.id + ' — ' + g.statement).join('\n');
        }

        return {
            criticalGaps,
            threatContext,
            people: dimSummary('people'),
            institutions: dimSummary('institutions'),
            lifestyle: dimSummary('lifestyle'),
            roadmap30: roadmapForPrefixes(['PR.', 'DE.'], 'Protect/Detect'),
            roadmap90: roadmapForPrefixes(['GV.', 'ID.'], 'Govern/Identify'),
            roadmap180: roadmapForPrefixes(['RS.', 'RC.'], 'Respond/Recover')
        };
    }

    function applyGeneratedSummary(content) {
        Object.entries(content).forEach(([key, val]) => {
            if (!model.summary.userEdited[key]) model.summary[key] = val;
        });
        model.summary.generatedAt = new Date().toISOString();
        saveModel();
        bindSummaryFields();
        updateSummaryBadges();
        updateSummaryGeneratedLabel();
        hideSummaryStaleBanner();
    }

    function generateSummary(force) {
        if (!force) {
            const hasEdits = Object.keys(model.summary.userEdited).length;
            const hasContent = SUMMARY_FIELDS.some(([, key]) => model.summary[key]);
            if (hasEdits || hasContent) {
                if (!confirm('Regenerate report? Fields you have not manually edited will be updated. Your edited sections are preserved.')) return;
            }
        }
        applyGeneratedSummary(generateSummaryContent());
    }

    function markSummaryStaleIfNeeded() {
        if (currentView !== 'summary') return;
        updateSummaryStaleBanner();
    }

    function updateSummaryStaleBanner() {
        const el = document.getElementById('summary-stale-banner');
        if (!el) return;
        const scored = scoredControls();
        if (!scored) { el.classList.add('hidden'); return; }
        if (!model.summary.generatedAt) {
            el.textContent = scored + ' controls scored. Click "Generate Report from Controls" to build your summary.';
            el.classList.remove('hidden');
            return;
        }
        const genTime = new Date(model.summary.generatedAt).getTime();
        const updTime = new Date(model.meta.updatedAt).getTime();
        if (updTime - genTime > 2000) {
            el.textContent = 'Control scores changed since the last report was generated. Regenerate to refresh auto-drafted sections.';
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    }

    function hideSummaryStaleBanner() {
        const el = document.getElementById('summary-stale-banner');
        if (el) el.classList.add('hidden');
    }

    function updateSummaryGeneratedLabel() {
        const el = document.getElementById('summary-generated-label');
        if (!el) return;
        if (!model.summary.generatedAt) { el.textContent = ''; return; }
        el.textContent = 'Last generated · ' + new Date(model.summary.generatedAt).toLocaleString();
    }

    function updateSummaryBadges() {
        document.querySelectorAll('[data-field-badge]').forEach(badge => {
            const key = badge.dataset.fieldBadge;
            const edited = model.summary.userEdited[key];
            const hasContent = model.summary[key];
            if (edited) badge.textContent = 'Edited';
            else if (hasContent && model.summary.generatedAt) badge.textContent = 'Auto-drafted';
            else badge.textContent = '';
        });
    }

    function renderSummaryDashboard() {
        const el = document.getElementById('summary-dashboard');
        if (!el) return;
        const { fnStats, dimStats, maturityPct, totalScored, total } = getMaturityStats();
        const gaps = gapCount(), partials = partialCount();

        let fnBars = FN_ORDER.map(fid => {
            const fs = fnStats[fid];
            if (!fs) return '';
            const pct = fs.scored ? Math.round((fs.weight / fs.scored) * 100) : 0;
            return '<div class="maturity-row"><span>' + fs.name + '</span><div class="maturity-track"><div class="maturity-fill" style="width:' + pct + '%"></div></div><span class="maturity-pct">' + pct + '%</span></div>';
        }).join('');

        const dimCards = ['people', 'institutions', 'lifestyle'].map(d => {
            const ds = dimStats[d];
            return '<div class="dim-bar-card"><div class="dim-bar-title">' + d + '</div><div class="dim-bar-counts">' +
                '<span style="color:#fca5a5">' + ds.gap + ' gaps</span> · <span style="color:#fde047">' + ds.partial + ' partial</span> · <span style="color:#86efac">' + ds.inplace + ' in place</span></div></div>';
        }).join('');

        el.innerHTML =
            '<div class="stat-grid">' +
            '<div class="stat-card accent-gold"><div class="stat-num">' + maturityPct + '%</div><div class="stat-label">Maturity</div></div>' +
            '<div class="stat-card"><div class="stat-num">' + totalScored + '/' + total + '</div><div class="stat-label">Scored</div></div>' +
            '<div class="stat-card accent-red"><div class="stat-num">' + gaps + '</div><div class="stat-label">Gaps</div></div>' +
            '<div class="stat-card accent-yellow"><div class="stat-num">' + partials + '</div><div class="stat-label">Partial</div></div>' +
            '</div>' +
            '<div class="card"><div class="label" style="margin-bottom:0.75rem">Maturity by Function</div><div class="maturity-grid">' + fnBars + '</div></div>' +
            '<div class="dim-bars">' + dimCards + '</div>';
    }

    function getIntakeValue(id) {
        return model.intake[id];
    }

    function getIntakeRows(id) {
        const val = getIntakeValue(id);
        if (!val) return [];
        if (Array.isArray(val.rows)) return val.rows;
        if (typeof val === 'string' && val.trim()) return [{ notes: val }];
        return [];
    }

    function normalizeIntake(id, schema) {
        let val = model.intake[id];
        if (!val) {
            if (schema.type === 'repeatable') model.intake[id] = { rows: [emptyRow(schema.fields)] };
            else if (schema.type === 'checklist') model.intake[id] = { selected: [], additionalGoals: '' };
            else model.intake[id] = {};
            return;
        }
        if (typeof val === 'string') {
            if (schema.type === 'repeatable') model.intake[id] = { rows: [{ notes: val }] };
            else if (schema.type === 'structured') model.intake[id] = { notes: val };
            else if (schema.type === 'checklist') model.intake[id] = { selected: [], additionalGoals: val };
        }
        if (schema.type === 'repeatable' && !val.rows) model.intake[id] = { rows: [emptyRow(schema.fields)] };
    }

    function emptyRow(fields) {
        const row = {};
        fields.forEach(f => { row[f.key] = ''; });
        return row;
    }

    function intakeSectionProgress(section) {
        const items = INTAKE_SCHEMA.filter(s => s.section === section);
        let filled = 0;
        items.forEach(schema => {
            const val = getIntakeValue(schema.id);
            if (!val) return;
            if (schema.type === 'repeatable') {
                if (val.rows && val.rows.some(r => Object.values(r).some(v => v))) filled++;
            } else if (schema.type === 'checklist') {
                if ((val.selected && val.selected.length) || val.additionalGoals) filled++;
            } else if (Object.values(val).some(v => v)) filled++;
        });
        return { filled, total: items.length };
    }

    function renderFieldInput(field, value, prefix) {
        const id = prefix + '-' + field.key;
        const v = escapeAttr(value || '');
        if (field.type === 'select') {
            return '<select id="' + id + '" data-key="' + field.key + '">' +
                '<option value="">—</option>' +
                field.options.map(o => '<option value="' + escapeAttr(o) + '"' + (value === o ? ' selected' : '') + '>' + o + '</option>').join('') +
                '</select>';
        }
        if (field.type === 'textarea') {
            return '<textarea id="' + id + '" data-key="' + field.key + '" rows="' + (field.rows || 2) + '" placeholder="' + escapeAttr(field.placeholder || '') + '">' + v + '</textarea>';
        }
        return '<input type="' + (field.type || 'text') + '" id="' + id + '" data-key="' + field.key + '" value="' + v + '" placeholder="' + escapeAttr(field.placeholder || '') + '">';
    }

    function renderIntake() {
        const container = document.getElementById('intake-list');
        const sections = [...new Set(INTAKE_SCHEMA.map(s => s.section))];
        let html = '';

        sections.forEach(section => {
            const prog = intakeSectionProgress(section);
            html += '<div class="intake-section"><div class="intake-section-header">' +
                '<h2 class="intake-section-title">' + section + '</h2>' +
                '<span class="intake-progress">' + prog.filled + '/' + prog.total + ' complete</span></div>';

            INTAKE_SCHEMA.filter(s => s.section === section).forEach(schema => {
                normalizeIntake(schema.id, schema);
                const val = getIntakeValue(schema.id);
                html += '<div class="card" data-intake-id="' + schema.id + '">';
                html += '<div class="label">' + schema.id + '</div>';
                html += '<h3 style="color:white;margin:0.25rem 0 0.5rem;font-size:1rem">' + schema.title + '</h3>';
                if (schema.prompt) html += '<p class="card-text">' + schema.prompt + '</p>';

                if (schema.type === 'repeatable') {
                    html += '<table class="repeatable-table"><thead><tr>';
                    schema.fields.forEach(f => { html += '<th>' + f.label + '</th>'; });
                    html += '<th></th></tr></thead><tbody id="rows-' + schema.id + '">';
                    val.rows.forEach((row, ri) => {
                        html += '<tr data-row="' + ri + '">';
                        schema.fields.forEach(f => {
                            html += '<td>' + renderFieldInput(f, row[f.key], schema.id + '-r' + ri).replace('id="', 'data-intake="' + schema.id + '" id="') + '</td>';
                        });
                        html += '<td><button type="button" class="row-remove" data-remove-row="' + schema.id + '" data-row-idx="' + ri + '" title="Remove">×</button></td></tr>';
                    });
                    html += '</tbody></table>';
                    html += '<button type="button" class="btn" data-add-row="' + schema.id + '">+ Add row</button>';
                } else if (schema.type === 'structured') {
                    html += '<div class="grid-2">';
                    schema.fields.forEach(f => {
                        html += '<div' + (f.type === 'textarea' ? ' style="grid-column:1/-1"' : '') + '><label class="label">' + f.label + '</label>' +
                            renderFieldInput(f, val[f.key], schema.id).replace('data-key', 'data-intake="' + schema.id + '" data-key') + '</div>';
                    });
                    html += '</div>';
                } else if (schema.type === 'checklist') {
                    html += '<div class="checklist-grid">';
                    schema.options.forEach((opt, oi) => {
                        const checked = val.selected && val.selected.includes(opt);
                        html += '<div class="check-item"><input type="checkbox" id="' + schema.id + '-c' + oi + '" data-intake="' + schema.id + '" data-checklist value="' + escapeAttr(opt) + '"' + (checked ? ' checked' : '') + '>' +
                            '<label for="' + schema.id + '-c' + oi + '">' + opt + '</label></div>';
                    });
                    html += '</div>';
                    if (schema.followUp) {
                        html += '<div style="margin-top:0.75rem"><label class="label">' + schema.followUp.label + '</label>' +
                            renderFieldInput(schema.followUp, val[schema.followUp.key], schema.id).replace('data-key', 'data-intake="' + schema.id + '" data-key') + '</div>';
                    }
                }
                html += '</div>';
            });
            html += '</div>';
        });

        container.innerHTML = html;
        bindIntakeEvents();
    }

    function bindIntakeEvents() {
        document.querySelectorAll('[data-intake]').forEach(el => {
            const id = el.dataset.intake;
            const schema = INTAKE_SCHEMA.find(s => s.id === id);
            if (!schema) return;

            const handler = () => {
                if (schema.type === 'repeatable') {
                    const rowEl = el.closest('[data-row]');
                    if (!rowEl) return;
                    const ri = parseInt(rowEl.dataset.row, 10);
                    const key = el.dataset.key;
                    if (!model.intake[id].rows[ri]) return;
                    model.intake[id].rows[ri][key] = el.type === 'checkbox' ? (el.checked ? el.value : '') : el.value;
                } else if (schema.type === 'checklist' && el.dataset.checklist !== undefined) {
                    if (!model.intake[id].selected) model.intake[id].selected = [];
                    if (el.checked) {
                        if (!model.intake[id].selected.includes(el.value)) model.intake[id].selected.push(el.value);
                    } else {
                        model.intake[id].selected = model.intake[id].selected.filter(v => v !== el.value);
                    }
                } else {
                    const key = el.dataset.key;
                    model.intake[id][key] = el.value;
                }
                scheduleSave();
                if (el.type === 'checkbox' || el.tagName === 'SELECT') renderIntake();
            };

            const inputHandler = () => { handler(); };
            el.addEventListener('change', inputHandler);
            if (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && el.type === 'text')) {
                el.addEventListener('input', inputHandler);
            }
        });

        document.querySelectorAll('[data-add-row]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.addRow;
                const schema = INTAKE_SCHEMA.find(s => s.id === id);
                normalizeIntake(id, schema);
                model.intake[id].rows.push(emptyRow(schema.fields));
                saveModel();
                renderIntake();
            });
        });

        document.querySelectorAll('[data-remove-row]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.removeRow;
                const ri = parseInt(btn.dataset.rowIdx, 10);
                const schema = INTAKE_SCHEMA.find(s => s.id === id);
                if (model.intake[id].rows.length <= 1) {
                    model.intake[id].rows[0] = emptyRow(schema.fields);
                } else {
                    model.intake[id].rows.splice(ri, 1);
                }
                saveModel();
                renderIntake();
            });
        });
    }

    function bindSummaryFields() {
        SUMMARY_FIELDS.forEach(([elId, key]) => {
            const el = document.getElementById(elId);
            if (!el) return;
            el.value = model.summary[key] || '';
        });
        updateSummaryBadges();
        updateSummaryGeneratedLabel();
    }

    function initSummaryFields() {
        SUMMARY_FIELDS.forEach(([elId, key]) => {
            const el = document.getElementById(elId);
            if (!el) return;
            el.value = model.summary[key] || '';
            el.addEventListener('input', () => {
                model.summary[key] = el.value;
                model.summary.userEdited[key] = true;
                scheduleSave();
                updateSummaryBadges();
            });
        });
        updateSummaryBadges();
        updateSummaryGeneratedLabel();
    }

    function updateSaveIndicator() {
        const el = document.getElementById('save-indicator');
        if (!el) return;
        el.textContent = 'Saved locally · ' + new Date(model.meta.updatedAt).toLocaleString();
    }

    function updateStats() {
        const stats = document.getElementById('header-stats');
        if (!stats) return;
        const { maturityPct } = getMaturityStats();
        stats.innerHTML =
            '<span>' + scoredControls() + '/' + countControls() + ' scored</span>' +
            '<span class="stat-sep">·</span>' +
            '<span class="gap-stat">' + gapCount() + ' gaps</span>' +
            '<span class="stat-sep">·</span>' +
            '<span style="color:var(--gold)">' + maturityPct + '%</span>';
    }

    function updateControlProgress() {
        const fill = document.getElementById('control-progress');
        const label = document.getElementById('control-progress-label');
        if (!fill) return;
        const total = countControls(), scored = scoredControls();
        const pct = total ? Math.round((scored / total) * 100) : 0;
        fill.style.width = pct + '%';
        if (label) label.textContent = pct + '% scored (' + scored + '/' + total + ')';
    }

    function getServiceIdForControl(controlId) {
        if (typeof SANCTUARY_SERVICES === 'undefined') return null;
        const overrides = SANCTUARY_SERVICES.controlOverrides || {};
        if (overrides[controlId]) return overrides[controlId];
        return (SANCTUARY_SERVICES.categoryMap || {})[controlId.split('-')[0]] || null;
    }

    function getServiceById(id) {
        if (typeof SANCTUARY_SERVICES === 'undefined') return null;
        return SANCTUARY_SERVICES.services.find(s => s.id === id);
    }

    function serviceUrl(id) {
        const base = (SANCTUARY_SERVICES && SANCTUARY_SERVICES.site)
            ? SANCTUARY_SERVICES.site.base : 'https://www.targetproof.com/model';
        if (id === 'family-threat-model') return base + '/';
        return base + '/services/' + id + '.html';
    }

    function catalogUrl() {
        return (SANCTUARY_SERVICES && SANCTUARY_SERVICES.site)
            ? SANCTUARY_SERVICES.site.catalog : 'https://www.targetproof.com/model/catalog.html';
    }

    function briefingUrl() {
        return (SANCTUARY_SERVICES && SANCTUARY_SERVICES.site)
            ? SANCTUARY_SERVICES.site.briefing : 'https://www.targetproof.com/meetings/thomas-stone/sales-call';
    }

    function tallyByService() {
        const tallies = {};
        forEachControl(ctrl => {
            const st = getControlRecord(ctrl.id);
            if (!st.status || st.status === 'na' || st.status === 'inplace') return;
            const svcId = getServiceIdForControl(ctrl.id);
            if (!svcId) return;
            if (!tallies[svcId]) tallies[svcId] = { gaps: 0, partials: 0, controls: [] };
            tallies[svcId].controls.push({ id: ctrl.id, statement: ctrl.statement, status: st.status });
            if (st.status === 'gap') tallies[svcId].gaps++;
            else tallies[svcId].partials++;
        });
        return tallies;
    }

    function renderRecommendations() {
        const container = document.getElementById('recommendations-list');
        const summaryEl = document.getElementById('rec-summary');
        if (!container) return;

        const tallies = tallyByService();
        const entries = Object.entries(tallies)
            .map(([id, t]) => ({ id, ...t, service: getServiceById(id), total: t.gaps + t.partials }))
            .filter(e => e.service)
            .sort((a, b) => b.gaps - a.gaps || b.total - a.total);

        const totalGaps = gapCount();
        const totalPartials = partialCount();

        if (summaryEl) {
            if (!totalGaps && !totalPartials) {
                summaryEl.innerHTML = '<p style="color:var(--dim)">Score controls on the <strong>Controls</strong> tab to generate recommendations.</p>';
            } else {
                summaryEl.innerHTML = '<div class="rec-tally-banner">' +
                    '<span class="rec-tally-num">' + totalGaps + '</span> gaps · ' +
                    '<span class="rec-tally-num">' + totalPartials + '</span> partial · ' +
                    '<span class="rec-tally-num">' + entries.length + '</span> remediation areas</div>';
            }
        }

        if (!entries.length) {
            container.innerHTML = totalGaps || totalPartials ? '<p style="color:var(--muted)">No remediation mappings for scored gaps.</p>' : '';
            return;
        }

        container.innerHTML = entries.map(e => {
            const gapItems = e.controls.filter(c => c.status === 'gap').slice(0, 5);
            const more = e.controls.length - gapItems.length;
            const includes = (e.service.includes || []).slice(0, 4).map(i => '<li>' + escapeHtml(i) + '</li>').join('');
            return '<div class="card rec-card"><div class="rec-card-header"><div><div class="label">' + escapeHtml(e.service.duration) + '</div>' +
                '<h3 class="rec-title">' + escapeHtml(e.service.name) + '</h3><p class="rec-tagline">' + escapeHtml(e.service.tagline) + '</p></div>' +
                '<div class="rec-counts"><span class="rec-gap-count">' + e.gaps + ' gaps</span>' +
                (e.partials ? '<span class="rec-partial-count">' + e.partials + ' partial</span>' : '') + '</div></div>' +
                '<p style="color:var(--dim);font-size:0.9rem;margin:0 0 1rem">' + escapeHtml(e.service.hero) + '</p>' +
                (includes ? '<ul class="rec-gap-list" style="margin-bottom:1rem">' + includes + '</ul>' : '') +
                '<ul class="rec-gap-list">' + gapItems.map(c => '<li><span class="mono">' + escapeHtml(c.id) + '</span> ' + escapeHtml(c.statement) + '</li>').join('') +
                (more > 0 ? '<li class="rec-more">+' + more + ' more controls</li>' : '') + '</ul>' +
                '<div class="btn-row">' +
                '<a href="' + serviceUrl(e.id) + '" target="_blank" rel="noopener" class="btn btn-primary">Learn How to Fix →</a>' +
                '<a href="' + briefingUrl() + '" target="_blank" rel="noopener" class="btn">Request Briefing</a>' +
                '</div></div>';
        }).join('') +
        '<div class="card" style="margin-top:1rem;text-align:center">' +
        '<p style="color:var(--dim);margin:0 0 1rem">Your model stays on this device. Links open the TargetProof website to explore remediation options.</p>' +
        '<a href="' + catalogUrl() + '" target="_blank" rel="noopener" class="btn btn-primary">View Full Services Catalog</a></div>';
    }

    function updateEditionLabel() {
        const el = document.getElementById('data-edition-label');
        if (!el || !window.SanctuaryEdition) return;
        const ed = SanctuaryEdition.getEdition();
        el.textContent = ed ? SanctuaryEdition.label(ed) : 'Not selected';
    }

    function updateNavState(view) {
        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.classList.toggle('nav-active', btn.dataset.nav === view);
        });
        document.querySelectorAll('.nav-group').forEach(group => {
            group.classList.toggle('has-active', !!group.querySelector('[data-nav].nav-active'));
            group.classList.remove('is-open');
            const trigger = group.querySelector('.nav-group-btn');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
        });
        const overview = document.querySelector('.portal-nav > [data-nav="setup"]');
        if (overview) overview.classList.toggle('nav-active', view === 'setup');
    }

    function bindPortalNav() {
        document.querySelectorAll('.nav-group-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const group = btn.closest('.nav-group');
                const open = group.classList.toggle('is-open');
                document.querySelectorAll('.nav-group').forEach(g => {
                    if (g !== group) g.classList.remove('is-open');
                });
                btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        });
        document.addEventListener('click', () => {
            document.querySelectorAll('.nav-group.is-open').forEach(g => {
                g.classList.remove('is-open');
                const t = g.querySelector('.nav-group-btn');
                if (t) t.setAttribute('aria-expanded', 'false');
            });
        });
        document.querySelectorAll('.nav-menu').forEach(menu => {
            menu.addEventListener('click', e => e.stopPropagation());
        });
    }

    function setView(view) {
        currentView = view;
        document.querySelectorAll('[data-view]').forEach(el => {
            el.classList.toggle('hidden', el.dataset.view !== view);
        });
        updateNavState(view);
        if (view === 'checklist' && !catalogRendered) renderCatalog();
        if (view === 'recommendations') renderRecommendations();
        if (view === 'summary') {
            renderSummaryDashboard();
            updateSummaryStaleBanner();
            bindSummaryFields();
        }
        if (view === 'intake') renderIntake();
        if (view === 'spectrum') renderSpectrum();
        if (view === 'review') renderReview();
        if (view === 'setup') renderSetupLoop();
        if (view === 'knowledge' && window.SanctuaryKnowledge) window.SanctuaryKnowledge.onTabOpen(model);
        if (view === 'assistant' && window.SanctuaryAssistant) window.SanctuaryAssistant.onTabOpen();
        if (view === 'data') updateEditionLabel();
    }

    function bindMeta() {
        [['client-name', 'clientName'], ['properties', 'properties'], ['internal-owner', 'internalOwner'], ['handoff-date', 'handoffDate']].forEach(([elId, key]) => {
            const el = document.getElementById(elId);
            if (!el) return;
            el.value = model.meta[key] || '';
            el.addEventListener('input', () => { model.meta[key] = el.value; scheduleSave(); updateTitle(); });
        });
        updateTitle();
    }

    function updateTitle() {
        const name = model.meta.clientName.trim();
        const hero = document.getElementById('page-title');
        const nav = document.getElementById('nav-household');
        const profileName = document.getElementById('profile-display-name');
        if (hero) hero.textContent = name || 'Your Security Model';
        if (profileName) profileName.textContent = name || 'Your household';
        if (nav) {
            if (name) {
                nav.textContent = name;
                nav.classList.remove('is-placeholder');
            } else {
                nav.textContent = 'Add household name';
                nav.classList.add('is-placeholder');
            }
        }
        document.title = name ? (name + ' · TargetProof Model') : 'TargetProof Model';
    }

    function renderToc() {
        const toc = document.getElementById('toc');
        let html = '';
        SANCTUARY_CATALOG.functions.forEach(fn => {
            html += '<div class="toc-fn"><div class="toc-fn-name">' + fn.name + '</div><ul>';
            fn.categories.forEach(cat => {
                const gaps = cat.controls.filter(c => getControlRecord(c.id).status === 'gap').length;
                const scored = cat.controls.filter(c => getControlRecord(c.id).status).length;
                html += '<li><a href="#' + cat.id + '">' + cat.id + ' - ' + cat.name +
                    ' <span class="toc-count">(' + scored + '/' + cat.controls.length + (gaps ? ', <b>' + gaps + ' gaps</b>' : '') + ')</span></a></li>';
            });
            html += '</ul></div>';
        });
        toc.innerHTML = html;
    }

    function controlMatchesFilter(ctrlId) {
        const st = getControlRecord(ctrlId).status;
        if (controlFilter === 'all') return true;
        if (controlFilter === 'unscored') return !st;
        if (controlFilter === 'gap') return st === 'gap';
        if (controlFilter === 'partial') return st === 'partial';
        if (controlFilter === 'inplace') return st === 'inplace';
        return true;
    }

    function renderCatalog() {
        const container = document.getElementById('catalog');
        let html = '';
        SANCTUARY_CATALOG.functions.forEach(fn => {
            html += '<section class="fn-section"><div class="fn-label">' + fn.nist + ' · ' + fn.name.toUpperCase() + '</div><h2 class="section-title">' + fn.name + '</h2>';
            fn.categories.forEach(cat => {
                html += '<div id="' + cat.id + '" class="category-block card"><div class="cat-header"><span class="mono">' + cat.id + '</span><h3>' + cat.name + '</h3><span class="cat-count">' + cat.controls.length + ' controls</span></div>';
                html += '<p class="cat-desc">' + cat.description + '</p><div class="cat-controls">';
                cat.controls.forEach(ctrl => {
                    const st = getControlRecord(ctrl.id);
                    const layers = ctrl.layers.map(l => '<span class="pill" style="color:' + LAYER_COLORS[l] + ';border-color:' + LAYER_COLORS[l] + '44">' + l + '</span>').join('');
                    const dims = ctrl.dimensions.map(d => '<span class="pill dim" style="color:' + DIM_COLORS[d] + '">' + d + '</span>').join('');
                    html += '<div class="control-row" data-ctrl-id="' + ctrl.id + '" data-status="' + (st.status || 'unscored') + '" data-search="' + escapeAttr(ctrl.id + ' ' + ctrl.statement) + '">';
                    html += '<div class="control-meta"><span class="mono">' + ctrl.id + '</span><span class="ctype">' + ctrl.controlType + '</span>' + layers + dims + '</div>';
                    html += '<div class="control-statement">' + escapeHtml(ctrl.statement) + '</div>';
                    const svcId = getServiceIdForControl(ctrl.id);
                    const svc = svcId ? getServiceById(svcId) : null;
                    if (svc) {
                        html += '<div class="control-service-hint"><span class="label">Remediation</span> ' +
                            escapeHtml(svc.shortName || svc.name) + '</div>';
                    }
                    html += '<details class="control-details"><summary>Evidence & verification</summary><div class="details-body"><div><strong>Evidence:</strong> ' + ctrl.evidence.join(' · ') + '</div><div><strong>Verify:</strong> ' + ctrl.verify + '</div></div></details>';
                    html += '<div class="status-btns">';
                    Object.entries(STATUS).forEach(([key, s]) => {
                        html += '<button type="button" class="status-btn' + (st.status === key ? ' ' + s.cls : '') + '" data-ctrl="' + ctrl.id + '" data-status="' + key + '">' + s.label + '</button>';
                    });
                    html += '</div><textarea class="control-note" data-note="' + ctrl.id + '" rows="2" placeholder="Evidence notes, owner, timeline…">' + escapeAttr(st.note || '') + '</textarea></div>';
                });
                html += '</div></div>';
            });
            html += '</section>';
        });
        container.innerHTML = html;
        catalogRendered = true;

        container.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', () => setControlStatus(btn.dataset.ctrl, btn.dataset.status));
        });
        container.querySelectorAll('.control-note').forEach(el => {
            el.addEventListener('input', () => {
                if (!model.controls[el.dataset.note]) model.controls[el.dataset.note] = {};
                model.controls[el.dataset.note].note = el.value;
                scheduleSave();
            });
        });
        applyControlFilters();
        updateControlProgress();
    }

    function applyControlFilters() {
        const term = (document.getElementById('search')?.value || '').toLowerCase().trim();
        document.querySelectorAll('.control-row').forEach(row => {
            const id = row.dataset.ctrlId;
            const matchFilter = controlMatchesFilter(id);
            const matchSearch = !term || row.dataset.search.toLowerCase().includes(term);
            row.style.display = matchFilter && matchSearch ? '' : 'none';
        });
        document.querySelectorAll('.category-block').forEach(cat => {
            const visible = [...cat.querySelectorAll('.control-row')].some(r => r.style.display !== 'none');
            cat.style.display = visible ? '' : 'none';
        });
        document.querySelectorAll('.fn-section').forEach(sec => {
            const visible = [...sec.querySelectorAll('.control-row')].some(r => r.style.display !== 'none');
            sec.style.display = visible ? '' : 'none';
        });
    }

    function escapeAttr(s) {
        return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }

    function escapeHtml(s) {
        return escapeAttr(s).replace(/>/g, '&gt;');
    }

    function setControlStatus(id, status) {
        if (!model.controls[id]) model.controls[id] = {};
        model.controls[id].status = status;
        document.querySelectorAll('[data-ctrl="' + id + '"]').forEach(btn => {
            btn.classList.remove('selected-inplace', 'selected-partial', 'selected-gap', 'selected-na');
            if (btn.dataset.status === status) btn.classList.add(STATUS[status].cls);
        });
        const row = document.querySelector('[data-ctrl-id="' + id + '"]');
        if (row) row.dataset.status = status;
        scheduleSave();
        renderToc();
        if (currentView === 'recommendations') renderRecommendations();
        if (currentView === 'summary') renderSummaryDashboard();
        applyControlFilters();
    }

    function jumpToNextUnscored() {
        if (!catalogRendered) renderCatalog();
        const rows = [...document.querySelectorAll('.control-row')];
        const unscored = rows.filter(r => r.dataset.status === 'unscored');
        if (!unscored.length) { alert('All controls have been scored.'); return; }
        controlFilter = 'all';
        document.querySelectorAll('.chip').forEach(c => c.classList.toggle('chip-active', c.dataset.filter === 'all'));
        document.getElementById('search').value = '';
        applyControlFilters();
        unscored[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        unscored[0].style.outline = '2px solid var(--gold)';
        setTimeout(() => { unscored[0].style.outline = ''; }, 2000);
    }

    async function exportModel() {
        saveModel();
        const name = (model.meta.clientName || 'sanctuary-model').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
        const stamp = new Date().toISOString().slice(0, 10);
        const plaintext = JSON.stringify(model, null, 2);
        let body = plaintext;
        let ext = '.json';

        if (window.SanctuaryVault && confirm(
            'Encrypt this backup with a password?\n\nRecommended — without encryption, anyone with the file can read your assessment.'
        )) {
            const pass = prompt('Export password (at least 14 characters — needed to restore this backup):');
            if (!pass) return;
            const confirmPass = prompt('Confirm export password:');
            if (pass !== confirmPass) {
                alert('Passwords do not match.');
                return;
            }
            try {
                body = await SanctuaryVault.encryptExport(plaintext, pass);
                ext = '.sanctuary.json';
            } catch (e) {
                alert(e.message || 'Could not encrypt backup.');
                return;
            }
        }

        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([body], { type: 'application/json' }));
        a.download = 'sanctuary-model-' + name + '-' + stamp + ext;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    const MAX_MODEL_IMPORT_BYTES = 5 * 1024 * 1024;

    async function importModel(file) {
        if (file.size > MAX_MODEL_IMPORT_BYTES) {
            alert('That file is too large. Sanctuary model exports must be under 5 MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                if (reader.result.length > MAX_MODEL_IMPORT_BYTES) {
                    throw new Error('Too large');
                }
                let raw = reader.result;
                if (window.SanctuaryVault && SanctuaryVault.isEncryptedExport(raw)) {
                    const pass = prompt('This backup is encrypted. Enter the export password:');
                    if (!pass) return;
                    try {
                        raw = await SanctuaryVault.decryptExport(raw, pass);
                    } catch {
                        alert('Wrong password or corrupted encrypted backup.');
                        return;
                    }
                }
                const data = migrateModel(JSON.parse(raw));
                if (!data.controls || !data.meta || !Array.isArray(data.controls)) throw new Error('Invalid');
                if (!confirm('Replace the current model with this backup?')) return;
                model = data;
                saveModel();
                location.reload();
            } catch (e) {
                alert('Could not read that file. Choose a Sanctuary Model export (.json or .sanctuary.json).');
            }
        };
        reader.readAsText(file);
    }

    function loadLlmIfNeeded() {
        const ed = window.SanctuaryEdition && SanctuaryEdition.getEdition();
        if (ed !== 'ai' && ed !== 'connected') return;
        if (document.querySelector('script[data-llm]')) return;
        const s = document.createElement('script');
        s.type = 'module';
        s.src = 'llm.js';
        s.dataset.llm = '1';
        document.body.appendChild(s);
    }

    async function init() {
        if (window.SanctuaryVault) {
            if (!SanctuaryVault.isInitialized() || !SanctuaryVault.isUnlocked()) {
                window.location.replace('unlock.html');
                document.documentElement.classList.add('redirecting');
                return;
            }
            await SanctuaryVault.ensureCache();
        }
        if (window.SanctuaryEdition && !SanctuaryEdition.getEdition()) {
            if (window.TARGETPROOF_MODEL && window.TARGETPROOF_MODEL.standardOnly) {
                await SanctuaryEdition.setEdition('standard');
            } else {
                window.location.replace('setup.html');
                document.documentElement.classList.add('redirecting');
                return;
            }
        }
        if (window.SanctuaryEdition) SanctuaryEdition.applyEditionToDocument();
        if (window.TARGETPROOF_MODEL && window.TARGETPROOF_MODEL.standardOnly) {
            document.querySelectorAll('.edition-picker-only').forEach(el => el.classList.add('hidden'));
        }
        loadLlmIfNeeded();
        loadModelFromVault();
        bindMeta();
        renderIntake();
        initSummaryFields();
        renderToc();
        updateStats();
        updateSaveIndicator();
        updateControlProgress();
        updateEditionLabel();

        bindPortalNav();
        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.addEventListener('click', () => setView(btn.dataset.nav));
        });

        document.getElementById('search').addEventListener('input', () => applyControlFilters());
        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                controlFilter = chip.dataset.filter;
                document.querySelectorAll('.chip').forEach(c => c.classList.toggle('chip-active', c === chip));
                applyControlFilters();
            });
        });
        document.getElementById('btn-next-unscored').addEventListener('click', jumpToNextUnscored);
        document.getElementById('btn-generate-summary').addEventListener('click', () => generateSummary(false));
        const lockBtn = document.getElementById('btn-lock-vault');
        if (lockBtn && window.SanctuaryVault) {
            lockBtn.addEventListener('click', () => {
                saveModel();
                SanctuaryVault.lock();
                window.location.replace('unlock.html');
            });
        }

        document.getElementById('btn-export').addEventListener('click', exportModel);
        document.getElementById('btn-print').addEventListener('click', () => window.print());
        document.getElementById('import-file').addEventListener('change', e => {
            if (e.target.files[0]) importModel(e.target.files[0]);
            e.target.value = '';
        });

        if (window.SanctuaryAssistant) {
            window.SanctuaryAssistant.bind({
                getModel: () => model,
                onMessagesChanged: messages => {
                    if (!model.assistant) model.assistant = { messages: [] };
                    model.assistant.messages = messages;
                    scheduleSave();
                }
            });
        }

        if (window.SanctuaryKnowledge && window.SanctuaryKnowledge.isConnectedEdition()) {
            window.SanctuaryKnowledge.bind({
                getModel: () => model,
                scheduleSave,
                onKnowledgeChanged: () => {
                    if (currentView === 'spectrum') renderSpectrum();
                    markSummaryStaleIfNeeded();
                }
            });
        }

        document.querySelectorAll('[data-spectrum-filter]').forEach(chip => {
            chip.addEventListener('click', () => {
                spectrumFilter = chip.dataset.spectrumFilter;
                document.querySelectorAll('[data-spectrum-filter]').forEach(c =>
                    c.classList.toggle('chip-active', c.dataset.spectrumFilter === spectrumFilter));
                renderWhaleList();
            });
        });

        bindReview();
        renderSetupLoop();

        setView('setup');
    }

    document.addEventListener('DOMContentLoaded', init);
})();