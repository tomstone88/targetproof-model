/**
 * AUTO-GENERATED from website/model/services-catalog.json
 * Regenerate: npm run build (from website/) or node model/build-pages.js
 * Do not edit manually — changes are overwritten.
 */
const SANCTUARY_SERVICES = {
  "site": {
    "base": "https://www.targetproof.com/model",
    "catalog": "https://www.targetproof.com/model/catalog.html",
    "briefing": "https://www.targetproof.com/meetings/thomas-stone/sales-call"
  },
  "categoryMap": {
    "GV.OC": "family-office-governance",
    "GV.RM": "family-threat-model",
    "GV.PO": "family-office-governance",
    "GV.SC": "family-office-governance",
    "ID.AM": "estate-network-iot-hardening",
    "ID.RA": "digital-footprint-mapping",
    "ID.BE": "geopolitical-reputational-risk",
    "PR.AA": "identity-access-fortification",
    "PR.DS": "identity-access-fortification",
    "PR.PT": "estate-network-iot-hardening",
    "PR.IR": "estate-network-iot-hardening",
    "PR.AT": "social-engineering-defense",
    "DE.CM": "continuous-monitoring",
    "DE.AE": "continuous-monitoring",
    "RS.MA": "incident-response-crisis-playbooks",
    "RS.CO": "incident-response-crisis-playbooks",
    "RC.RP": "recovery-resilience-planning",
    "RC.CO": "sanctuary-stewardship"
  },
  "controlOverrides": {
    "PR.IR-09": "crypto-asset-fortification",
    "ID.AM-05": "crypto-asset-fortification",
    "RC.RP-07": "crypto-asset-fortification",
    "GV.RM-04": "geopolitical-reputational-risk",
    "GV.RM-06": "geopolitical-reputational-risk",
    "ID.RA-01": "digital-footprint-mapping",
    "ID.RA-02": "digital-footprint-mapping",
    "DE.CM-03": "digital-footprint-mapping",
    "DE.CM-07": "geopolitical-reputational-risk"
  },
  "services": [
    {
      "id": "family-threat-model",
      "name": "Family Threat Model",
      "shortName": "Threat Model",
      "flagship": true,
      "tagline": "One day onsite. A complete picture of your family's risk — and a living model you keep.",
      "duration": "One day onsite assessment",
      "hero": "The Sanctuary Gap Assessment scores 156 controls across people, institutions, and lifestyle — then leaves you with a private model and a prioritized path forward.",
      "description": "A principal-led, one-day onsite engagement. Together you walk your residence and family office context the way an adversary would — physical, digital, and human. Every control is scored. Gaps are tallied. Recommendations tie directly to remediation offerings you can execute on your timeline.\n\nYou keep the Sanctuary Model on your own systems. TargetProof keeps no copy. What remains is clarity: where you are exposed, what matters most, and exactly how to close it.",
      "includes": [
        "156-control Sanctuary Framework assessment (Govern → Recover)",
        "Onsite probes across primary residence and agreed scope",
        "Private client model left on your infrastructure",
        "Gap tally with risk-ordered recommendations",
        "Cross-cutting analysis: People · Institutions · Lifestyle",
        "30 / 90 / 180 day remediation roadmap"
      ],
      "idealFor": "Family offices, multi-property estates, and principals who need an integrated picture — not another vendor checklist.",
      "closesCategories": [
        "GV.RM",
        "ID.RA",
        "ID.BE"
      ]
    },
    {
      "id": "digital-footprint-mapping",
      "name": "Digital Footprint Mapping",
      "shortName": "Footprint Mapping",
      "tagline": "Illuminate exposure. Then shrink it.",
      "duration": "2–3 days remote + onsite validation",
      "hero": "We map what the internet knows about your family, staff, entities, and properties — then execute a disciplined reduction plan.",
      "description": "Principals routinely underestimate what is findable online. We conduct structured OSINT across family members, household staff, trust entities, domains, and properties — then compare findings to what you believed was private.\n\nDeliverables include a footprint inventory, credential exposure review, lookalike domain check, and a prioritized takedown or suppression plan.",
      "includes": [
        "Principal, family, and key staff exposure mapping",
        "Entity and property linkage review",
        "Dark web and breach correlation",
        "Lookalike domain and email spoofing assessment",
        "Prioritized reduction plan with owners",
        "Re-test within 90 days"
      ],
      "idealFor": "Families with public profiles, new liquidity events, or children entering social visibility.",
      "closesCategories": [
        "ID.RA"
      ]
    },
    {
      "id": "identity-access-fortification",
      "name": "Identity & Access Fortification",
      "shortName": "Identity & Access",
      "tagline": "Who can reach what — and how that access is granted, limited, and revoked.",
      "duration": "1–2 day onsite + remote follow-through",
      "hero": "MFA, password architecture, privileged credentials, and staff access lifecycle — implemented without breaking how your household actually works.",
      "description": "Identity is the highest-leverage control in household and family office environments. We deploy hardware-key or passkey MFA on principal accounts, architect your password manager vaults, segment privileged estate credentials, and establish staff on/offboarding discipline.\n\nWire verification rituals and encrypted communications for sensitive family office workflows are included where gaps exist.",
      "includes": [
        "MFA rollout on principal and financial accounts",
        "Enterprise password manager deployment",
        "Privileged credential custody redesign",
        "Staff access lifecycle (onboard / offboard SLA)",
        "Guest network and VPN hardening",
        "Wire and payment verification protocol"
      ],
      "idealFor": "Households with staff turnover, multiple properties, or recent fraud attempts.",
      "closesCategories": [
        "PR.AA",
        "PR.DS"
      ]
    },
    {
      "id": "estate-network-iot-hardening",
      "name": "Estate Network & IoT Hardening",
      "shortName": "Network & IoT",
      "tagline": "Every connected device. Every camera. Hardened with precision.",
      "duration": "2–5 days onsite per property",
      "hero": "We segment your networks, harden IoT and cameras, and integrate physical and cyber alerting — without the integrator theater.",
      "description": "Luxury estates accumulate integrator complexity: orphan SSIDs, cloud-dependent cameras, flat networks, and default credentials. We inventory every device, segment principal, staff, guest, and IoT traffic, patch firmware, and validate that guest Wi-Fi cannot reach your NAS or cameras.\n\nPhysical layers are reviewed in parallel — camera blind spots, monitoring SLAs, and integration with cyber alerting.",
      "includes": [
        "Per-property network and IoT inventory",
        "VLAN segmentation and firewall hardening",
        "Camera and NVR credential and firmware audit",
        "External attack surface scan",
        "UPS and resilience review for security systems",
        "Integrator handoff documentation"
      ],
      "idealFor": "Smart homes, multi-property portfolios, and recent renovations with new integrators.",
      "closesCategories": [
        "ID.AM",
        "PR.PT",
        "PR.IR"
      ]
    },
    {
      "id": "social-engineering-defense",
      "name": "Social Engineering Defense",
      "shortName": "Social Engineering",
      "tagline": "Training that changes behavior — because the greatest risks are human.",
      "duration": "Half day onsite + staff modules",
      "hero": "Tailored training for principals, family office staff, household employees, and children — with live scenarios, not slides.",
      "description": "Sophisticated families are targeted through the people around them: EAs, nannies, drivers, and children. We deliver role-specific training on BEC, deepfake voice, delivery pretexting, visitor verification, and children's digital exposure.\n\nIncludes duress verification rituals and a household posting policy your family can actually follow.",
      "includes": [
        "Principal fraud and impersonation training",
        "EA and family office BEC exercises",
        "Household staff visitor and delivery protocols",
        "Children's privacy and gaming safety briefing",
        "Duress and verification ritual design",
        "Annual refresher curriculum"
      ],
      "idealFor": "Families with large staff footprints, public events, or recent social engineering attempts.",
      "closesCategories": [
        "PR.AT"
      ]
    },
    {
      "id": "crypto-asset-fortification",
      "name": "Crypto Asset Fortification",
      "shortName": "Crypto Fortification",
      "tagline": "Custody architecture you can live with — and survive without exposing seeds.",
      "duration": "1–2 days advisory + implementation oversight",
      "hero": "Hardware wallets, multi-signature design, signing ceremonies, and signer redundancy — designed for your family, not a exchange checklist.",
      "description": "Crypto assets require different thinking than traditional wealth. We design custody architecture, signer roles, transaction verification rituals, and recovery drills — without ever photographing seed phrases or compromising your cold storage.\n\nCoordination with family office wire procedures and estate planning counsel is standard.",
      "includes": [
        "Custody model design (hot / warm / cold)",
        "Multi-signature and hardware wallet architecture",
        "Signing ceremony and amount-cap protocols",
        "Signer redundancy and break-glass drill",
        "Family office coordination for large movements",
        "Documentation for trustees and counsel"
      ],
      "idealFor": "Families with material on-chain holdings or complex signer structures.",
      "closesCategories": []
    },
    {
      "id": "incident-response-crisis-playbooks",
      "name": "Incident Response & Crisis Playbooks",
      "shortName": "Crisis Playbooks",
      "tagline": "Living playbooks for the scenarios you hope never happen.",
      "duration": "3–5 days development + tabletop",
      "hero": "Written plans, retainers, contact trees, and tabletops — for cyber breach, home intrusion, extortion, and reputational crisis.",
      "description": "When an incident arrives, families without a plan improvise under pressure. We build scenario-specific playbooks with named roles, 24/7 contact trees, evidence preservation steps, and pre-positioned retainers for legal, forensics, crisis PR, and executive protection.\n\nA facilitated tabletop with principals and key staff is included.",
      "includes": [
        "Cyber, physical, extortion, and reputational playbooks",
        "Incident commander matrix",
        "24/7 contact tree with drill",
        "Retainer coordination (legal, forensics, PR, EP)",
        "Crisis communications and social blackout protocol",
        "Facilitated principal tabletop exercise"
      ],
      "idealFor": "Families who travel extensively, maintain public profiles, or have never run a crisis drill.",
      "closesCategories": [
        "RS.MA",
        "RS.CO"
      ]
    },
    {
      "id": "continuous-monitoring",
      "name": "Continuous Monitoring",
      "shortName": "Monitoring",
      "tagline": "Detect adverse events before they become crises.",
      "duration": "Ongoing program",
      "hero": "Identity exposure, endpoint anomalies, financial transaction flags, and reputational signals — reviewed by people who know your household.",
      "description": "Detection without response is noise. We configure monitoring across credential leaks, estate network anomalies, wire instruction changes, and media mentions — with escalation paths that reach a decision-maker in minutes, not days.\n\nProgram includes quarterly tuning and annual alignment to your threat model.",
      "includes": [
        "Identity and dark web monitoring",
        "EDR / network alert escalation path",
        "Financial anomaly and new-payee flagging",
        "Media and reputational monitoring",
        "Quarterly alert tuning",
        "Annual threat model alignment"
      ],
      "idealFor": "Families post-assessment who want sustained visibility without building an internal SOC.",
      "closesCategories": [
        "DE.CM",
        "DE.AE"
      ]
    },
    {
      "id": "geopolitical-reputational-risk",
      "name": "Geopolitical & Reputational Risk",
      "shortName": "Geo & Reputation",
      "tagline": "Global exposure, philanthropy, and public life — assessed with discretion.",
      "duration": "Advisory engagement",
      "hero": "Travel destinations, board affiliations, philanthropic visibility, and protest exposure — mapped to your actual routines.",
      "description": "Wealth creates visibility. We assess geopolitical exposure from travel and business interests, reputational contagion from affiliations, and event-specific risks for galas, board meetings, and public appearances.\n\nDeliverables include pre-trip briefs, event security coordination notes, and discreet mitigation strategies aligned to your preferences.",
      "includes": [
        "Geopolitical travel risk register",
        "Philanthropy and board affiliation review",
        "Event and public appearance briefs",
        "Protest and harassment route analysis",
        "Media monitoring escalation tie-in",
        "Family communication discipline for crises"
      ],
      "idealFor": "Principals with international interests, public philanthropy, or elevated media profiles.",
      "closesCategories": [
        "ID.BE",
        "GV.RM"
      ]
    },
    {
      "id": "family-office-governance",
      "name": "Family Office Security Governance",
      "shortName": "FO Governance",
      "tagline": "Policies, vendor oversight, and advisor coordination — the administrative layer that makes controls stick.",
      "duration": "2–4 week program",
      "hero": "Who decides, who approves wires, how vendors are vetted, and how policies survive staff turnover.",
      "description": "Technical controls fail without governance. We establish security authority, document household and family office policies, build vendor vetting and offboarding procedures, and map advisor access scopes.\n\nIncludes annual review cadence and exception logging so your program stays current as the family evolves.",
      "includes": [
        "Security authority and escalation charter",
        "Household and FO policy documentation",
        "Vendor vetting and offboarding SOPs",
        "Advisor access scope matrix",
        "Wire and payment dual-control procedures",
        "Annual independent review schedule"
      ],
      "idealFor": "Family offices formalizing security for the first time or recovering from advisor fragmentation.",
      "closesCategories": [
        "GV.OC",
        "GV.PO",
        "GV.SC"
      ]
    },
    {
      "id": "recovery-resilience-planning",
      "name": "Recovery & Resilience Planning",
      "shortName": "Recovery Planning",
      "tagline": "Restore operations, reputation, and confidence after disruption.",
      "duration": "2–3 week program",
      "hero": "RTO/RPO targets, insurance alignment, backup validation, and reputation recovery — tested, not theoretical.",
      "description": "Resilience is what separates a bad day from a legacy event. We define recovery targets for email, financial access, property operations, and communications; validate backups with real restore tests; align cyber and K&R coverage to your threat profile; and build reputation recovery protocols.",
      "includes": [
        "Business continuity with RTO/RPO per critical system",
        "Backup restore testing (not just backup jobs)",
        "Cyber and K&R insurance alignment review",
        "Property disaster recovery priorities",
        "Reputation recovery and legal hold protocol",
        "Post-incident corrective action framework"
      ],
      "idealFor": "Families with complex property operations or prior incidents that exposed recovery gaps.",
      "closesCategories": [
        "RC.RP"
      ]
    },
    {
      "id": "sanctuary-stewardship",
      "name": "Sanctuary Stewardship",
      "shortName": "Stewardship",
      "tagline": "Keep the living model current as your family and threat landscape evolve.",
      "duration": "Ongoing",
      "hero": "Annual reassessment, playbook updates, metrics, and a direct line when something feels wrong.",
      "description": "Security is not a project — it is a discipline. Sanctuary Stewardship provides annual control reviews, living playbook maintenance, security metrics reporting, and priority access for advisory calls when life events change your exposure.\n\nDesigned for families who own their Sanctuary Model internally and want TargetProof as a quiet guardian, not a permanent vendor on site.",
      "includes": [
        "Annual Sanctuary Framework reassessment",
        "Living playbook updates within 30 days of material events",
        "Security metrics dashboard (MFA, patching, training, gaps)",
        "Priority advisory access",
        "Life-event change-trigger reviews",
        "Coordination with your internal owner"
      ],
      "idealFor": "Families post-Threat Model who want sustained excellence without rebuilding from scratch each year.",
      "closesCategories": [
        "RC.CO"
      ]
    }
  ]
};
