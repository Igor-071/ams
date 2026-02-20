flowchart TD
    classDef blue fill:#2E75B6,color:#fff,stroke:none
    classDef light fill:#D6E4F0,color:#1a4d7a,stroke:none
    classDef yellow fill:#FFF3CD,color:#856404,stroke:#D4A017
    classDef green fill:#D4EDDA,color:#155724,stroke:none
    classDef red fill:#F8D7DA,color:#721c24,stroke:none
    classDef purple fill:#E8D5F5,color:#4a1460,stroke:none
    classDef orange fill:#FFF0E0,color:#8a5a00,stroke:#E67E22,stroke-width:2px
    classDef grey fill:#F0F0F0,color:#666,stroke:#ccc

    A["Admin Login"]:::blue
    B["Admin Dashboard — full CRUD over platform"]:::purple

    C["Merchant Management"]:::light
    C1["Invite merchants"]:::light
    C2["Review and approve service listings"]:::purple
    C3["Suspend merchant platform-wide"]:::red

    D["Consumer Management"]:::light
    D1["Approve consumer access requests"]:::purple
    D2["View individual consumer usage data"]:::orange
    D3["Block consumer platform-wide"]:::orange

    E["Governance"]:::light
    E1["Audit logs, platform config, teams"]:::light

    F["System health, APM, alerting — Azure native"]:::grey

    A --> B
    B --> C
    C --> C1
    C --> C2
    C --> C3
    B --> D
    D --> D1
    D --> D2
    D --> D3
    B --> E --> E1
    B ~~~ F