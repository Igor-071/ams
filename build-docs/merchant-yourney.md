flowchart TD
    classDef blue fill:#2E75B6,color:#fff,stroke:none
    classDef light fill:#D6E4F0,color:#1a4d7a,stroke:none
    classDef yellow fill:#FFF3CD,color:#856404,stroke:#D4A017
    classDef green fill:#D4EDDA,color:#155724,stroke:none
    classDef red fill:#F8D7DA,color:#721c24,stroke:none
    classDef purple fill:#E8D5F5,color:#4a1460,stroke:none
    classDef grey fill:#F0F0F0,color:#666,stroke:#ccc

    A["Admin invites Merchant to AMS"]:::blue
    B["Merchant registers via invite link"]:::light
    C["Merchant accesses Dashboard"]:::light
    D["Create New Service"]:::light
    E{API or Docker Image?}:::yellow

    F["API: Set metadata, pricing, tracing"]:::light
    G["Docker: Set metadata, license, push image"]:::light

    H["Submit for Admin Approval"]:::light
    I["Admin reviews and approves service"]:::purple
    J["Service Live on Marketplace"]:::green

    K["Monitor Usage by API Key"]:::purple
    L["Merchant sees usage per key, not consumer identity"]:::light
    M["Merchant can revoke consumer API keys"]:::red
    N["End of month: generate postpaid invoice from usage"]:::light
    O["Invoice sent to consumer, AMS commission deducted"]:::light

    P["Pricing model, free tiers, payment collection — TBD by business team"]:::grey

    A --> B --> C --> D --> E
    E -->|API| F --> H
    E -->|Docker| G --> H
    H --> I --> J
    J --> K --> L
    K --> M
    K --> N --> O
    J ~~~ P