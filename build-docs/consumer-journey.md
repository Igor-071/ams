flowchart TD
    classDef blue fill:#2E75B6,color:#fff,stroke:none
    classDef light fill:#D6E4F0,color:#1a4d7a,stroke:none
    classDef yellow fill:#FFF3CD,color:#856404,stroke:#D4A017
    classDef green fill:#D4EDDA,color:#155724,stroke:none
    classDef red fill:#F8D7DA,color:#721c24,stroke:none
    classDef purple fill:#E8D5F5,color:#4a1460,stroke:none

    A["Consumer registers on AMS"]:::blue
    B["Browse public marketplace, see merchant and service details"]:::light
    C["Request access to a service"]:::light
    D["Admin reviews and approves access"]:::purple
    E["Access Granted"]:::green
    R["Access Denied"]:::red

    F["Generate API Key"]:::purple
    G["Configure key: assign services, set configurable TTL"]:::light
    H["API Key Ready"]:::green

    I{API or Docker?}:::yellow
    J["API: Call via consumption endpoint"]:::light
    K["Docker: Pull image, validate key or license"]:::light

    L["Merchant configurable rate limits enforced per request"]:::light
    M["No hard usage cap — use as needed, billed postpaid"]:::light

    N["Usage Dashboard"]:::purple
    O["Counts, cost breakdown, per-service, per-key, history"]:::light

    A --> B --> C --> D
    D -->|Approved| E
    D -->|Rejected| R
    E --> F --> G --> H --> I
    I -->|API| J --> L
    I -->|Docker| K --> L
    L --> M --> N --> O