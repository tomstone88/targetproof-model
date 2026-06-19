/**
 * Sanctuary Threat Model — synthesized reference layer.
 * Informed by threat-modeling practice (outcome-focused four-question loop,
 * risk-centric business context) and mapped to NIST CSF 2.0, FTC consumer
 * fraud guidance, and documented UHNWI targeting patterns. Not a copy of
 * any single methodology.
 */
const SANCTUARY_FRAMEWORK = {
    version: '1.0',
    methodology: {
        name: 'Sanctuary Loop',
        tagline: 'Measure twice. Prioritize by business impact. Improve without growing the model.',
        principles: [
            'Business context before controls — who decides, what is at stake, what must not break.',
            'Residual risk is explicit — gaps can be accepted knowingly, not accidentally.',
            'Evidence over theory — score what you can verify onsite, not what sounds good on paper.',
            'Continuous refinement — the catalog sharpens; the client deliverable stays lean.',
            'Perspective matters — people, institutions, and lifestyle are first-class attack surfaces.'
        ],
        fourQuestions: [
            {
                id: 'work',
                question: 'What are we protecting?',
                phase: 'Intake & Setup',
                nav: 'intake',
                summary: 'Household scope: properties, participants, advisors, travel, incidents, and goals.',
                nist: ['GV.OC', 'ID.AM', 'ID.BE']
            },
            {
                id: 'wrong',
                question: 'What can go wrong?',
                phase: 'Spectrum & Controls',
                nav: 'spectrum',
                summary: 'Real-world UHNWI patterns, regulator warnings, and 156 scored controls across Govern → Recover.',
                nist: ['ID.RA', 'DE.CM']
            },
            {
                id: 'about',
                question: 'What will we do about it?',
                phase: 'Summary & Recommendations',
                nav: 'summary',
                summary: 'Prioritized gaps, 30/90/180 roadmap, and remediation paths tied to your scores.',
                nist: ['PR', 'RS', 'RC']
            },
            {
                id: 'good',
                question: 'Did we do a good enough job?',
                phase: 'Review',
                nav: 'review',
                summary: 'Effectiveness check, residual risk acceptance, and what to improve next cycle.',
                nist: ['GV.RM', 'ID.IM']
            }
        ]
    },
    nistCsf: {
        version: '2.0',
        source: 'NIST Cybersecurity Framework (CSWP 29)',
        functions: [
            {
                id: 'govern',
                code: 'GV',
                name: 'Govern',
                outcome: 'Organizational context, risk strategy, roles, and policy oversight.',
                sanctuary: 'Who holds authority, advisor access, supply-chain rules, and annual review cadence.'
            },
            {
                id: 'identify',
                code: 'ID',
                name: 'Identify',
                outcome: 'Asset inventory, business environment, risk assessment, and improvement planning.',
                sanctuary: 'Properties, participants, digital footprint, incident history, and threat scenarios.'
            },
            {
                id: 'protect',
                code: 'PR',
                name: 'Protect',
                outcome: 'Safeguards for identity, data, platforms, infrastructure, and awareness.',
                sanctuary: 'MFA, network segmentation, staff discipline, physical access, and vendor boundaries.'
            },
            {
                id: 'detect',
                code: 'DE',
                name: 'Detect',
                outcome: 'Anomalies, continuous monitoring, and detection processes.',
                sanctuary: 'Estate monitoring, fraud alerts, camera/analytics, and family-office wire controls.'
            },
            {
                id: 'respond',
                code: 'RS',
                name: 'Respond',
                outcome: 'Incident management, analysis, mitigation, and communications.',
                sanctuary: 'Crisis playbooks, EP coordination, legal hold, and principal communication trees.'
            },
            {
                id: 'recover',
                code: 'RC',
                name: 'Recover',
                outcome: 'Recovery planning, restoration, and post-incident improvement.',
                sanctuary: 'Backup authority, property re-securing, insurance coordination, and lessons captured.'
            }
        ]
    },
    ftcAdvisories: [
        {
            id: 'ftc-impersonation',
            title: 'Impersonation & authority fraud',
            source: 'FTC impersonation rule · consumer.ftc.gov',
            theme: 'Scammers pose as government, banks, tech support, family members, or advisors to override judgment.',
            uhnwiAngle: 'Family offices receive spoofed counsel emails, fake IRS/SEC urgency, and "assistant in trouble" calls.',
            signals: ['wire', 'advisor', 'staff', 'institutions'],
            controls: ['GV.PO-02', 'PR.AA-04', 'DE.CM-03', 'RS.MA-02']
        },
        {
            id: 'ftc-bec-wire',
            title: 'Business email compromise & wire diversion',
            source: 'FTC · FBI IC3 public alerts',
            theme: 'Email or message thread compromise redirects wires, invoices, and closing funds.',
            uhnwiAngle: 'Family office wires, property purchases, art/vehicle transactions, and philanthropy disbursements.',
            signals: ['wire', 'institutions', 'property'],
            controls: ['GV.PO-02', 'PR.AA-06', 'PR.DS-02', 'DE.CM-05']
        },
        {
            id: 'ftc-investment-crypto',
            title: 'Investment & crypto schemes',
            source: 'FTC consumer alerts · SEC investor.gov',
            theme: 'Fake platforms, pig-butchering, and "exclusive" deals exploiting trust and sophistication bias.',
            uhnwiAngle: 'Private deal flow, family-office "special sits," and crypto allocation pressure from social circles.',
            signals: ['crypto', 'advisor', 'goals'],
            controls: ['GV.RM-01', 'GV.RM-07', 'PR.DS-04', 'ID.RA-03']
        },
        {
            id: 'ftc-sim-swap',
            title: 'SIM swap & mobile account takeover',
            source: 'FTC · FCC port-out guidance',
            theme: 'Phone number hijacking intercepts MFA codes and password resets.',
            uhnwiAngle: 'Principal mobile lines, crypto exchange 2FA, and banking app recovery paths.',
            signals: ['crypto', 'people', 'technology'],
            controls: ['PR.AA-01', 'PR.AA-02', 'PR.AA-03', 'DE.CM-02']
        },
        {
            id: 'ftc-deepfake-voice',
            title: 'AI voice & video impersonation',
            source: 'FTC emerging-tech scam alerts',
            theme: 'Synthetic voice/video of principals or CFOs authorizing transfers on live calls.',
            uhnwiAngle: 'Multi-principal families and distributed decision-makers are high-value deepfake targets.',
            signals: ['wire', 'institutions', 'people'],
            controls: ['GV.PO-02', 'PR.AA-06', 'GV.OC-06', 'DE.CM-03']
        },
        {
            id: 'ftc-data-broker',
            title: 'Data broker & people-search exposure',
            source: 'FTC data broker enforcement · consumer.ftc.gov',
            theme: 'Personal data aggregated and sold, enabling targeting, stalking, and pretexting.',
            uhnwiAngle: 'Property records, children\'s schools, staff identities, and travel patterns become searchable.',
            signals: ['travel', 'people', 'property', 'visibility'],
            controls: ['ID.AM-03', 'ID.RA-02', 'GV.RM-05', 'PR.DS-01']
        },
        {
            id: 'ftc-real-estate-wire',
            title: 'Real estate closing wire fraud',
            source: 'FTC · CFPB mortgage closing alerts',
            theme: 'Last-minute "updated wiring instructions" during property purchases.',
            uhnwiAngle: 'Multi-property families and rapid acquisitions across jurisdictions.',
            signals: ['property', 'wire', 'institutions'],
            controls: ['PR.AA-06', 'GV.PO-02', 'GV.SC-05', 'DE.CM-05']
        },
        {
            id: 'ftc-tech-support',
            title: 'Tech support & remote-access fraud',
            source: 'FTC consumer.ftc.gov scam articles',
            theme: 'Pop-ups and cold calls trick users into granting remote desktop access.',
            uhnwiAngle: 'Estate workstations, principal laptops, and staff devices on shared networks.',
            signals: ['technology', 'staff', 'people'],
            controls: ['PR.AT-02', 'PR.PS-03', 'DE.CM-01', 'GV.PO-04']
        }
    ],
    whalePatterns: [
        {
            id: 'wrench-crypto',
            title: 'Home invasion for crypto keys',
            category: 'Physical + digital coercion',
            period: '2023–2025',
            pattern: 'Organized groups identify crypto-affluent households through OSINT, follow travel, then force in-person transfer of wallet credentials.',
            publicNote: 'Documented in U.S. federal prosecutions, San Francisco home invasions, and Canadian cases involving violent coercion.',
            layers: ['physical', 'human', 'digital'],
            dimensions: ['people', 'lifestyle'],
            signals: ['crypto', 'travel', 'visibility', 'property'],
            controls: ['PR.PS-01', 'DE.CM-04', 'GV.RM-05', 'RS.MA-01', 'PR.AA-05'],
            lesson: 'Digital asset wealth converts physical security into a primary control.'
        },
        {
            id: 'exec-kidnap-crypto',
            title: 'Executive kidnapping for ransom',
            category: 'Physical extortion',
            period: '2024–2025',
            pattern: 'Kidnappers target crypto-industry principals and family members in EU/US to demand wallet transfers.',
            publicNote: 'High-profile cases include crypto-company founders abducted in France and similar EU incidents.',
            layers: ['physical', 'human'],
            dimensions: ['people', 'lifestyle'],
            signals: ['travel', 'visibility', 'crypto'],
            controls: ['RS.MA-01', 'GV.OC-06', 'PR.PS-02', 'DE.CM-04'],
            lesson: 'Public affiliation with crypto or liquidity events raises kidnapping/extortion tier.'
        },
        {
            id: 'sim-swap-whale',
            title: 'SIM swap against principals',
            category: 'Identity takeover',
            period: 'Ongoing',
            pattern: 'Attackers socially engineer carriers to port principal phone numbers, then reset MFA-protected accounts.',
            publicNote: 'Repeated seven- and eight-figure crypto losses tied to mobile account takeover.',
            layers: ['digital', 'human'],
            dimensions: ['people', 'institutions'],
            signals: ['crypto', 'technology'],
            controls: ['PR.AA-01', 'PR.AA-02', 'PR.AA-03', 'DE.CM-02'],
            lesson: 'Phone numbers are crown-jewel credentials — not a convenience channel.'
        },
        {
            id: 'deepfake-wire',
            title: 'Deepfake video call wire authorization',
            category: 'Institutional fraud',
            period: '2024',
            pattern: 'Live video calls use synthetic likeness of CFO/principal to authorize treasury staff to move funds.',
            publicNote: 'Public reporting of nine-figure attempted fraud via deepfake video conference.',
            layers: ['digital', 'human'],
            dimensions: ['institutions', 'people'],
            signals: ['wire', 'institutions'],
            controls: ['PR.AA-06', 'GV.PO-02', 'GV.OC-06', 'DE.CM-03'],
            lesson: 'Out-of-band verification rituals must survive realistic synthetic media.'
        },
        {
            id: 'family-office-bec',
            title: 'Family office wire fraud',
            category: 'Business email compromise',
            period: 'Ongoing',
            pattern: 'Compromised advisor or FO email threads insert subtle payment-detail changes during active deals.',
            publicNote: 'FTC and FBI IC3 consistently rank BEC among top dollar-loss categories — FO wires are high value.',
            layers: ['digital', 'human'],
            dimensions: ['institutions'],
            signals: ['wire', 'advisor', 'institutions'],
            controls: ['GV.PO-02', 'PR.AA-06', 'DE.CM-05', 'GV.SC-03'],
            lesson: 'Wire verification is a people process, not an IT feature.'
        },
        {
            id: 'integrator-backdoor',
            title: 'Smart-home integrator persistent access',
            category: 'Supply chain / vendor',
            period: 'Ongoing',
            pattern: 'AV/smart-home vendors retain super-admin across estates; former integrator staff retain credentials.',
            publicNote: 'Recurring pattern in luxury estate assessments — rarely headline news but common in practice.',
            layers: ['digital', 'physical'],
            dimensions: ['institutions', 'lifestyle'],
            signals: ['technology', 'property'],
            controls: ['GV.SC-01', 'GV.SC-04', 'PR.PS-04', 'ID.AM-02'],
            lesson: 'Integrator custody is supply-chain risk with physical consequences.'
        },
        {
            id: 'osint-to-stalking',
            title: 'OSINT-enabled stalking & targeting',
            category: 'Reconnaissance → physical',
            period: 'Ongoing',
            pattern: 'Social posts, event photos, aircraft tracking, and property records enable follow-home and targeting.',
            publicNote: 'FTC data-broker actions highlight how public fragments compose dangerous whole pictures.',
            layers: ['human', 'digital', 'physical'],
            dimensions: ['lifestyle', 'people'],
            signals: ['travel', 'visibility', 'people'],
            controls: ['GV.RM-05', 'GV.PO-03', 'ID.AM-03', 'PR.DS-01'],
            lesson: 'Lifestyle visibility is an input to physical threat tier — not a vanity metric.'
        },
        {
            id: 'staff-social-engineering',
            title: 'Staff & assistant targeting',
            category: 'Human vector',
            period: 'Ongoing',
            pattern: 'Attackers profile assistants, nannies, and estate managers as softer paths to principals and wire authority.',
            publicNote: 'Common in UHNWI social-engineering case studies and FTC impersonation complaints.',
            layers: ['human'],
            dimensions: ['people'],
            signals: ['staff', 'people'],
            controls: ['PR.AT-01', 'GV.PO-01', 'PR.AA-04', 'GV.PO-04'],
            lesson: 'Staff discipline and visitor protocol are principal-protection controls.'
        },
        {
            id: 'event-surveillance',
            title: 'Gala, board, and travel-event surveillance',
            category: 'Physical reconnaissance',
            period: 'Ongoing',
            pattern: 'High-exposure events concentrate principals, routines, and security gaps in predictable windows.',
            publicNote: 'EP and law-enforcement briefings routinely cite charity galas and conference circuits.',
            layers: ['physical', 'human'],
            dimensions: ['lifestyle'],
            signals: ['travel', 'visibility'],
            controls: ['PR.PS-02', 'GV.RM-04', 'DE.CM-04', 'GV.OC-07'],
            lesson: 'Upcoming events belong in the threat model as time-bounded risk spikes.'
        },
        {
            id: 'insider-household',
            title: 'Household insider & recording abuse',
            category: 'Insider threat',
            period: 'Ongoing',
            pattern: 'Trusted staff, contractors, or former employees exfiltrate information, access, or recordings.',
            publicNote: 'Recurring in estate security reviews; often NDA-bound rather than public headlines.',
            layers: ['human', 'physical'],
            dimensions: ['people'],
            signals: ['staff', 'property'],
            controls: ['GV.PO-06', 'GV.PO-04', 'PR.PS-03', 'DE.CM-06'],
            lesson: 'Offboarding SLAs and camera policy are detective controls, not HR paperwork.'
        },
        {
            id: 'crypto-travel-follow',
            title: 'Travel-route targeting',
            category: 'Lifestyle exposure',
            period: '2023–2025',
            pattern: 'Predictable routes between properties and airports enable surveillance ahead of physical or digital attacks.',
            publicNote: 'Documented in crypto-related home invasion prosecutions citing travel pattern analysis.',
            layers: ['physical', 'lifestyle'],
            dimensions: ['lifestyle', 'people'],
            signals: ['travel', 'property', 'crypto'],
            controls: ['GV.RM-04', 'PR.PS-02', 'GV.PO-03', 'DE.CM-04'],
            lesson: 'Travel discipline is a Protect control, not lifestyle friction.'
        },
        {
            id: 'ransomware-estate',
            title: 'Ransomware via estate or FO networks',
            category: 'Digital extortion',
            period: 'Ongoing',
            pattern: 'Weak segmentation between home office, IoT, and family devices enables encryption and data theft.',
            publicNote: 'NIST CSF ransomware community profile applies equally to estate networks without IT staff.',
            layers: ['digital'],
            dimensions: ['institutions', 'lifestyle'],
            signals: ['technology', 'property'],
            controls: ['PR.PS-04', 'PR.PS-05', 'RS.MA-03', 'RC.RP-01'],
            lesson: 'Guest Wi-Fi and IoT VLANs are Recover-planning inputs, not minor networking details.'
        }
    ]
};