(function () {
    'use strict';

    const SUGGESTIONS = [
        'What should we prioritize first?',
        'What are our biggest security gaps?',
        'How is our people dimension looking?',
        'What relates to travel and public exposure?',
        'Summarize our overall posture'
    ];

    const FN_ORDER = ['govern', 'identify', 'protect', 'detect', 'respond', 'recover'];
    let getModel = null;
    let onMessagesChanged = null;

    function isAIEdition() {
        return window.SANCTUARY_EDITION === 'ai' || window.SANCTUARY_EDITION === 'connected';
    }

    function isConnectedEdition() {
        return window.SANCTUARY_EDITION === 'connected';
    }

    function bind(handlers) {
        getModel = handlers.getModel;
        onMessagesChanged = handlers.onMessagesChanged;
        initUI();
    }

    function tokenize(text) {
        return String(text).toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2 && !STOP.has(w));
    }

    const STOP = new Set([
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our',
        'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see',
        'two', 'way', 'who', 'boy', 'did', 'let', 'put', 'say', 'she', 'too', 'use', 'what', 'when',
        'with', 'have', 'this', 'that', 'from', 'they', 'been', 'than', 'into', 'your', 'about',
        'should', 'would', 'could', 'there', 'their', 'which', 'where', 'does', 'most', 'some'
    ]);

    function scoreText(queryTokens, text) {
        const hay = String(text).toLowerCase();
        let score = 0;
        queryTokens.forEach(t => { if (hay.includes(t)) score += t.length > 5 ? 3 : 1; });
        return score;
    }

    function forEachControl(fn) {
        if (typeof SANCTUARY_CATALOG === 'undefined') return;
        SANCTUARY_CATALOG.functions.forEach(sf => {
            sf.categories.forEach(cat => cat.controls.forEach(ctrl => fn(ctrl, cat, sf)));
        });
    }

    function getControlRecords(model) {
        const rows = [];
        forEachControl((ctrl, cat, sf) => {
            const rec = model.controls[ctrl.id] || {};
            rows.push({
                id: ctrl.id,
                statement: ctrl.statement,
                status: rec.status || null,
                note: rec.note || '',
                category: cat.id,
                categoryName: cat.name,
                functionId: sf.id,
                functionName: sf.name,
                nist: sf.nist,
                dimensions: ctrl.dimensions,
                layers: ctrl.layers,
                controlType: ctrl.controlType
            });
        });
        return rows;
    }

    function getStats(model) {
        const controls = getControlRecords(model);
        const scored = controls.filter(c => c.status);
        const gaps = controls.filter(c => c.status === 'gap');
        const partials = controls.filter(c => c.status === 'partial');
        const inplace = controls.filter(c => c.status === 'inplace');
        let weight = 0, applicable = 0;
        scored.forEach(c => {
            if (c.status === 'na') return;
            applicable++;
            if (c.status === 'inplace') weight += 1;
            else if (c.status === 'partial') weight += 0.5;
        });
        const maturity = applicable ? Math.round((weight / applicable) * 100) : 0;
        return { controls, scored, gaps, partials, inplace, maturity, total: controls.length };
    }

    function getIntakeRows(model, id) {
        const val = model.intake[id];
        if (!val) return [];
        if (Array.isArray(val.rows)) return val.rows.filter(r => Object.values(r).some(v => v));
        if (typeof val === 'string' && val.trim()) return [{ notes: val }];
        return [];
    }

    function getServiceIdForControl(controlId) {
        if (typeof SANCTUARY_SERVICES === 'undefined') return null;
        const overrides = SANCTUARY_SERVICES.controlOverrides || {};
        if (overrides[controlId]) return overrides[controlId];
        return (SANCTUARY_SERVICES.categoryMap || {})[controlId.split('-')[0]] || null;
    }

    function getServiceForControl(controlId) {
        const id = getServiceIdForControl(controlId);
        return id ? SANCTUARY_SERVICES.services.find(s => s.id === id) : null;
    }

    function buildContextSummary(model) {
        const stats = getStats(model);
        const name = model.meta.clientName || 'your household';
        const properties = getIntakeRows(model, 'INTAKE-01');
        const people = getIntakeRows(model, 'INTAKE-02');
        const incidents = getIntakeRows(model, 'INTAKE-05');
        const travel = model.intake['INTAKE-04'] || {};
        return {
            name,
            owner: model.meta.internalOwner || '',
            maturity: stats.maturity,
            scored: stats.scored.length,
            total: stats.total,
            gapCount: stats.gaps.length,
            partialCount: stats.partials.length,
            propertyCount: properties.length,
            peopleCount: people.length,
            incidentCount: incidents.length,
            travelProfile: travel.publicVisibility || '',
            hasSummary: !!(model.summary.criticalGaps || model.summary.generatedAt)
        };
    }

    function buildModelContext(model) {
        const ctx = buildContextSummary(model);
        const parts = [
            'Household: ' + ctx.name,
            'Internal owner: ' + (ctx.owner || 'not set'),
            'Maturity: ' + ctx.maturity + '% (' + ctx.scored + '/' + ctx.total + ' controls scored)',
            'Gaps: ' + ctx.gapCount + ', Partial: ' + ctx.partialCount
        ];

        const gaps = topGaps(model, 12);
        if (gaps.length) {
            parts.push('Top gaps:\n' + gaps.map((g, i) => (i + 1) + '. ' + formatControl(g)).join('\n'));
        }

        const people = getIntakeRows(model, 'INTAKE-02');
        if (people.length) {
            parts.push('Participants: ' + people.map(p =>
                (p.name || 'Unnamed') + (p.role ? ' (' + p.role + ')' : '')
            ).join('; '));
        }

        const travel = model.intake['INTAKE-04'] || {};
        if (travel.publicVisibility || travel.typicalDestinations) {
            parts.push('Travel/exposure: ' + [travel.publicVisibility, travel.typicalDestinations].filter(Boolean).join(' · '));
        }

        if (model.summary.criticalGaps) {
            parts.push('Critical gaps summary:\n' + model.summary.criticalGaps.split('\n').slice(0, 10).join('\n'));
        }
        if (model.summary.roadmap30) {
            parts.push('30-day roadmap:\n' + model.summary.roadmap30.split('\n').slice(0, 8).join('\n'));
        }
        if (model.spectrum && model.spectrum.marked && model.spectrum.marked.length) {
            parts.push('Marked threat patterns: ' + model.spectrum.marked.join(', '));
        }
        if (model.review && model.review.residualRiskAccepted) {
            parts.push('Accepted residual risk:\n' + model.review.residualRiskAccepted.split('\n').slice(0, 5).join('\n'));
        }
        if (window.SanctuaryKnowledge && window.SanctuaryKnowledge.isConnectedEdition()) {
            const k = window.SanctuaryKnowledge.buildAssistantContext(model);
            if (k) parts.push(k);
        }

        return parts.join('\n\n');
    }

    function classifyIntent(query) {
        const q = query.toLowerCase();
        if (/priorit|first|urgent|30 day|roadmap|fix first|start/.test(q)) return 'priorities';
        if (/gap|risk|expos|vulner|weak|problem|missing|fail/.test(q)) return 'gaps';
        if (/people|staff|family|principal|child|household|human/.test(q)) return 'people';
        if (/institution|family office|advisor|governance|vendor|wire/.test(q)) return 'institutions';
        if (/travel|lifestyle|public|event|trip|visibility|media/.test(q)) return 'lifestyle';
        if (/matur|score|posture|overall|summary|status|how are we/.test(q)) return 'posture';
        if (/incident|fraud|breach|attack|history|near.?miss/.test(q)) return 'incidents';
        if (/recommend|service|remediat|targetproof|fix|close/.test(q)) return 'remediation';
        if (/nist|csf|framework|four question|sanctuary loop|methodology/.test(q)) return 'framework';
        if (/ftc|regulator|scam|impersonat|sim swap|wire fraud|data broker/.test(q)) return 'spectrum';
        if (/whale|uhnw|kidnap|home invasion|wrench|deepfake|pattern|targeting/.test(q)) return 'spectrum';
        if (/review|good enough|residual risk|effective|repeat|improve next/.test(q)) return 'review';
        if (/control|GV\.|ID\.|PR\.|DE\.|RS\.|RC\./.test(q)) return 'control_lookup';
        return 'general';
    }

    function getFramework() {
        return typeof SANCTUARY_FRAMEWORK !== 'undefined' ? SANCTUARY_FRAMEWORK : null;
    }

    function buildIntakeSignals(model) {
        const signals = new Set();
        const travel = model.intake['INTAKE-04'] || {};
        const goals = model.intake['INTAKE-08'] || {};
        if (travel.publicVisibility && /high|moderate/i.test(travel.publicVisibility)) signals.add('visibility');
        if (travel.typicalDestinations || travel.upcomingEvents) signals.add('travel');
        if (getIntakeRows(model, 'INTAKE-01').length) signals.add('property');
        if (getIntakeRows(model, 'INTAKE-03').length) signals.add('institutions');
        if (Array.isArray(goals.selected) && goals.selected.some(g => /crypto/i.test(g))) signals.add('crypto');
        return signals;
    }

    function topGaps(model, limit) {
        return getStats(model).gaps
            .sort((a, b) => FN_ORDER.indexOf(a.functionId) - FN_ORDER.indexOf(b.functionId))
            .slice(0, limit);
    }

    function searchControls(model, queryTokens, limit) {
        const rows = getControlRecords(model).filter(c => c.status === 'gap' || c.status === 'partial' || c.note);
        return rows
            .map(r => ({
                row: r,
                score: scoreText(queryTokens, r.id + ' ' + r.statement + ' ' + r.note + ' ' + r.categoryName + ' ' + r.dimensions.join(' '))
            }))
            .filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(x => x.row);
    }

    function formatControl(c) {
        let line = c.id + ' — ' + c.statement;
        if (c.status) line += ' [' + c.status + ']';
        if (c.note) line += ' Note: ' + c.note;
        return line;
    }

    function remediationByService(model) {
        const map = {};
        const stats = getStats(model);
        [...stats.gaps, ...stats.partials].forEach(g => {
            const svc = getServiceForControl(g.id);
            if (!svc) return;
            if (!map[svc.id]) map[svc.id] = { service: svc, controls: [] };
            map[svc.id].controls.push(g);
        });
        return Object.values(map).sort((a, b) => b.controls.length - a.controls.length);
    }

    function serviceUrl(id) {
        const base = (SANCTUARY_SERVICES && SANCTUARY_SERVICES.site)
            ? SANCTUARY_SERVICES.site.base : 'https://www.targetproof.com/model';
        return id === 'family-threat-model' ? base + '/' : base + '/services/' + id + '.html';
    }

    function respond(query, model) {
        const ctx = buildContextSummary(model);
        const intent = classifyIntent(query);
        const tokens = tokenize(query);
        const parts = [];

        if (!ctx.scored) {
            return 'I do not have scored controls yet. Complete the **Controls** tab first — then I can answer informed questions about your household\'s gaps, priorities, and remediation paths.\n\nYour intake and setup data are already available if you want to discuss scope or participants.';
        }

        parts.push('**Context:** ' + ctx.name + ' · ' + ctx.maturity + '% maturity · ' + ctx.gapCount + ' gaps · ' + ctx.partialCount + ' partial across ' + ctx.scored + '/' + ctx.total + ' scored controls.');

        if (intent === 'priorities' || intent === 'posture') {
            const r30 = (model.summary.roadmap30 || '').trim();
            if (r30) {
                parts.push('**30-day priorities** (from your roadmap):\n' + r30.split('\n').slice(0, 6).join('\n'));
            } else {
                const urgent = topGaps(model, 5).filter(g => g.category.startsWith('PR.') || g.category.startsWith('DE.'));
                const list = (urgent.length ? urgent : topGaps(model, 5));
                parts.push('**Suggested immediate priorities** (Protect & Detect gaps):\n' + list.map((g, i) => (i + 1) + '. ' + formatControl(g)).join('\n'));
            }
            if (intent === 'posture') {
                FN_ORDER.forEach(fid => {
                    const fnGaps = getStats(model).gaps.filter(g => g.functionId === fid);
                    if (fnGaps.length) parts.push('**' + fnGaps[0].functionName + ':** ' + fnGaps.length + ' gaps');
                });
            }
        }

        if (intent === 'gaps' || intent === 'general') {
            const gaps = topGaps(model, 6);
            if (gaps.length) {
                parts.push('**Top gaps in your model:**\n' + gaps.map((g, i) => (i + 1) + '. ' + formatControl(g)).join('\n'));
            }
        }

        if (intent === 'people' || tokens.some(t => ['people', 'staff', 'family'].includes(t))) {
            const dimGaps = getStats(model).gaps.filter(g => g.dimensions.includes('people'));
            const participants = getIntakeRows(model, 'INTAKE-02');
            if (participants.length) {
                parts.push('**Participants on file:** ' + participants.map(p =>
                    (p.name || 'Unnamed') + (p.role ? ' (' + p.role + ')' : '') + (p.visibility ? ', visibility: ' + p.visibility : '')
                ).join('; '));
            }
            if (dimGaps.length) {
                parts.push('**People-dimension gaps:**\n' + dimGaps.slice(0, 5).map((g, i) => (i + 1) + '. ' + formatControl(g)).join('\n'));
            } else if (model.summary.people) {
                parts.push('**People summary:**\n' + model.summary.people.split('\n').slice(0, 8).join('\n'));
            }
        }

        if (intent === 'institutions') {
            const dimGaps = getStats(model).gaps.filter(g => g.dimensions.includes('institutions'));
            const advisors = getIntakeRows(model, 'INTAKE-03');
            if (advisors.length) {
                parts.push('**Advisors & entities:** ' + advisors.map(a => (a.name || 'Entity') + (a.role ? ' — ' + a.role : '')).join('; '));
            }
            if (dimGaps.length) {
                parts.push('**Institutions-dimension gaps:**\n' + dimGaps.slice(0, 5).map((g, i) => (i + 1) + '. ' + formatControl(g)).join('\n'));
            } else if (model.summary.institutions) {
                parts.push('**Institutions summary:**\n' + model.summary.institutions.split('\n').slice(0, 8).join('\n'));
            }
        }

        if (intent === 'lifestyle') {
            const travel = model.intake['INTAKE-04'] || {};
            if (travel.publicVisibility || travel.typicalDestinations) {
                parts.push('**Travel & exposure:** ' + [travel.publicVisibility, travel.typicalDestinations, travel.upcomingEvents].filter(Boolean).join(' · '));
            }
            const dimGaps = getStats(model).gaps.filter(g => g.dimensions.includes('lifestyle'));
            if (dimGaps.length) {
                parts.push('**Lifestyle-dimension gaps:**\n' + dimGaps.slice(0, 5).map((g, i) => (i + 1) + '. ' + formatControl(g)).join('\n'));
            }
        }

        if (intent === 'incidents') {
            const incidents = getIntakeRows(model, 'INTAKE-05');
            if (incidents.length) {
                parts.push('**Recorded incidents:**\n' + incidents.map(inc =>
                    '• [' + (inc.incidentType || 'Incident') + '] ' + (inc.description || 'No description') + (inc.status ? ' — ' + inc.status : '')
                ).join('\n'));
            } else {
                parts.push('No incidents recorded in intake. Add them under **Intake → Security Incidents** to enrich threat context.');
            }
            if (model.summary.threatContext) {
                parts.push('**Threat context on file:**\n' + model.summary.threatContext.split('\n').slice(0, 6).join('\n'));
            }
        }

        if (intent === 'remediation') {
            const areas = remediationByService(model).slice(0, 4);
            if (areas.length) {
                parts.push('**Remediation areas tied to your gaps:**\n' + areas.map(a =>
                    '• **' + a.service.name + '** (' + a.controls.length + ' gaps) — ' + a.service.tagline
                ).join('\n'));
                parts.push('Open the **Recommendations** tab for TargetProof service links when you are ready to explore fixes online.');
            }
        }

        if (intent === 'framework') {
            const fw = getFramework();
            if (fw) {
                parts.push('**Sanctuary Loop (four questions):**\n' + fw.methodology.fourQuestions.map((q, i) =>
                    (i + 1) + '. **' + q.question + '** — ' + q.phase
                ).join('\n'));
                parts.push('**NIST CSF 2.0 mapping:** ' + fw.nistCsf.functions.map(f => f.code + ' ' + f.name).join(' · '));
            }
        }

        if (intent === 'spectrum') {
            const fw = getFramework();
            if (fw) {
                const signals = buildIntakeSignals(model);
                const whales = fw.whalePatterns.filter(w => w.signals && w.signals.some(s => signals.has(s)));
                const ftc = fw.ftcAdvisories.filter(f => f.signals && f.signals.some(s => signals.has(s)));
                const marked = (model.spectrum && model.spectrum.marked) || [];
                if (whales.length) {
                    parts.push('**UHNWI patterns matching your intake:**\n' + whales.slice(0, 5).map(w =>
                        '• **' + w.title + '** — ' + w.lesson
                    ).join('\n'));
                }
                if (ftc.length) {
                    parts.push('**Regulator warnings to weigh:**\n' + ftc.slice(0, 4).map(f => '• ' + f.title).join('\n'));
                }
                if (marked.length) {
                    parts.push('**You marked ' + marked.length + ' pattern(s) as relevant** — see the Spectrum tab.');
                }
                if (!whales.length && !ftc.length) {
                    parts.push('Open the **Spectrum** tab for the full UHNWI and FTC pattern library. Complete intake to auto-highlight matches.');
                }
            }
        }

        if (intent === 'review') {
            const rev = model.review || {};
            if (rev.effectiveness || rev.wouldRepeat || rev.residualRiskAccepted) {
                if (rev.effectiveness) parts.push('**Assessment effectiveness:** ' + rev.effectiveness);
                if (rev.wouldRepeat) parts.push('**Would repeat:** ' + rev.wouldRepeat);
                if (rev.wouldRecommend) parts.push('**Would recommend:** ' + rev.wouldRecommend);
                if (rev.residualRiskAccepted) parts.push('**Accepted residual risk:**\n' + rev.residualRiskAccepted);
                if (rev.improvements) parts.push('**Next-cycle improvements:**\n' + rev.improvements);
            } else {
                parts.push('The **Review** tab closes the assessment loop — effectiveness, residual risk acceptance, and what to improve. Shostack\'s fourth question: *Did we do a good enough job?*');
            }
        }

        if (intent === 'control_lookup' || tokens.length > 2) {
            const hits = searchControls(model, tokens, 4);
            if (hits.length && (intent === 'control_lookup' || parts.length < 3)) {
                parts.push('**Relevant controls in your model:**\n' + hits.map((g, i) => (i + 1) + '. ' + formatControl(g)).join('\n'));
            }
        }

        if (parts.length === 1) {
            parts.push('I can help with priorities, gaps, the threat spectrum (UHNWI patterns & FTC warnings), NIST mapping, review findings, and remediation. Try the Spectrum tab or ask what patterns match your profile.');
        }

        parts.push('\n*All answers are generated locally from your model. Nothing is sent off this device.*');
        return parts.join('\n\n');
    }

    function renderMarkdown(text) {
        return text
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    function renderMessages(messages) {
        const el = document.getElementById('assistant-messages');
        if (!el) return;
        el.innerHTML = messages.map(m => {
            const cls = m.role === 'user' ? 'chat-bubble chat-user' : 'chat-bubble chat-assistant';
            const body = m.role === 'assistant' ? renderMarkdown(m.content) : escapeHtml(m.content);
            return '<div class="' + cls + '">' + body + '</div>';
        }).join('');
        el.scrollTop = el.scrollHeight;
    }

    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function updateContextPanel(model) {
        const el = document.getElementById('assistant-context');
        if (!el) return;
        const c = buildContextSummary(model);
        el.innerHTML =
            '<span class="ctx-pill">' + escapeHtml(c.name) + '</span>' +
            '<span class="ctx-pill">' + c.maturity + '% maturity</span>' +
            '<span class="ctx-pill">' + c.gapCount + ' gaps</span>' +
            '<span class="ctx-pill">' + c.propertyCount + ' properties</span>' +
            '<span class="ctx-pill">' + c.peopleCount + ' participants</span>' +
            (c.incidentCount ? '<span class="ctx-pill">' + c.incidentCount + ' incidents</span>' : '');
    }

    let sending = false;

    function setInputEnabled(enabled) {
        const input = document.getElementById('assistant-input');
        const form = document.getElementById('assistant-form');
        if (input) input.disabled = !enabled;
        if (form) form.querySelector('button[type="submit"]')?.toggleAttribute('disabled', !enabled);
    }

    function updateEngineStatus() {
        if (!isAIEdition()) return;
        const el = document.getElementById('assistant-engine-status');
        if (!el || !window.SanctuaryLLM) return;
        const s = window.SanctuaryLLM.getStatus();
        let label = 'Guided assistant';
        let detail = 'Rule-based answers from your model data.';
        if (s.status === 'checking') {
            label = 'Checking AI…';
            detail = 'Looking for bundled language model.';
        } else if (s.status === 'loading') {
            label = 'Loading AI…';
            detail = 'First load may take a minute. Keep this window open.';
        } else if (s.status === 'ready') {
            const name = s.manifest && s.manifest.modelSize === '1B' ? 'Llama 3.2 1B' : 'Llama 3.2 3B';
            label = 'AI ready';
            detail = name + ' running locally via WebGPU. Nothing leaves this device.';
        } else if (!s.isHttp) {
            detail = 'Launch via START.bat (Windows) or START.command (Mac) to enable AI.';
        } else if (!s.hasWebGPU) {
            detail = 'Use Chrome or Edge for AI. Guided mode still works.';
        } else if (s.error) {
            detail = s.error + ' Guided mode is active.';
        }
        el.innerHTML = '<strong>' + escapeHtml(label) + '</strong><br><span style="font-size:0.8rem;color:var(--muted)">' + escapeHtml(detail) + '</span>';
        const prog = document.getElementById('assistant-llm-progress-wrap');
        if (prog) prog.classList.toggle('hidden', s.status !== 'loading');
    }

    async function sendMessage(text) {
        if (!getModel || sending) return;
        const model = getModel();
        if (!model.assistant) model.assistant = { messages: [] };
        const q = text.trim();
        if (!q) return;

        sending = true;
        setInputEnabled(false);

        model.assistant.messages.push({ role: 'user', content: q, at: new Date().toISOString() });
        renderMessages(model.assistant.messages);

        let answer = null;
        let usedLlm = false;

        if (isAIEdition() && window.SanctuaryLLM) {
            try {
                const history = model.assistant.messages.slice(0, -1);
                answer = await window.SanctuaryLLM.chat(q, buildModelContext(model), history);
                usedLlm = !!answer;
            } catch (err) {
                console.warn('SanctuaryLLM error:', err);
            }
        }

        if (!answer) {
            answer = respond(q, model);
        } else {
            answer += '\n\n*Generated locally by the on-device AI model. Nothing was sent off this device.*';
        }

        model.assistant.messages.push({ role: 'assistant', content: answer, at: new Date().toISOString() });
        model.assistant.contextBuiltAt = new Date().toISOString();

        if (onMessagesChanged) onMessagesChanged(model.assistant.messages);
        renderMessages(model.assistant.messages);
        updateContextPanel(model);

        sending = false;
        setInputEnabled(true);
        updateEngineStatus();
    }

    function initUI() {
        const form = document.getElementById('assistant-form');
        const input = document.getElementById('assistant-input');
        const clearBtn = document.getElementById('assistant-clear');
        const suggestEl = document.getElementById('assistant-suggestions');

        if (suggestEl) {
            suggestEl.innerHTML = SUGGESTIONS.map(s =>
                '<button type="button" class="chip" data-suggest="' + escapeHtml(s) + '">' + escapeHtml(s) + '</button>'
            ).join('');
            suggestEl.querySelectorAll('[data-suggest]').forEach(btn => {
                btn.addEventListener('click', () => sendMessage(btn.dataset.suggest));
            });
        }

        if (form && input) {
            form.addEventListener('submit', e => {
                e.preventDefault();
                sendMessage(input.value);
                input.value = '';
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (!getModel || !confirm('Clear assistant conversation history?')) return;
                const model = getModel();
                model.assistant = { messages: [] };
                if (onMessagesChanged) onMessagesChanged([]);
                renderMessages([]);
            });
        }
    }

    function onTabOpen() {
        if (!getModel) return;
        const model = getModel();
        if (!model.assistant) model.assistant = { messages: [] };
        if (!model.assistant.messages.length) {
            let intro = isAIEdition()
                ? 'I am your **Sanctuary Assistant** — a private advisor that reads only the data in this model.\n\nAsk about priorities, gaps, people and staff risks, travel exposure, incidents, or what TargetProof services might close specific gaps. When the bundled AI model is available, I use it for richer answers — still entirely on this device.'
                : 'I am your **Sanctuary Assistant** — a guided advisor that reads only the data in this model.\n\nI use structured, rule-based analysis — **no AI, no language model, no external services**. Ask about priorities, gaps, people and staff risks, travel exposure, incidents, or remediation paths tied to your scores.';
            if (isConnectedEdition()) {
                intro += '\n\n**Connected Edition:** I also read **confirmed knowledge** from your Knowledge tab (calendar imports today; email and phone when connected).';
            }
            model.assistant.messages.push({
                role: 'assistant',
                content: intro,
                at: new Date().toISOString()
            });
            if (onMessagesChanged) onMessagesChanged(model.assistant.messages);
        }
        renderMessages(model.assistant.messages);
        updateContextPanel(model);
        if (isAIEdition()) {
            updateEngineStatus();
            if (window.SanctuaryLLM) {
                window.SanctuaryLLM.bindStatus(updateEngineStatus);
                window.SanctuaryLLM.preload();
            }
        }
    }

    window.SanctuaryAssistant = { bind, onTabOpen, respond, buildContextSummary, buildModelContext };
})();