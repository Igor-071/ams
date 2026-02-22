# Ministry Of Programming TRD Template

![mop-logo.png][image1]

**Ministry Of Programming TRD** 

**AMS**

---

Version 0.1

February 22, 2026,

| Date | Ver. | Authors | Comments |
| :---: | :---: | :---: | :---: |
| 22/02/2026 | 0.1 | Adnan Bucalović | Initial version |

# Table of contents {#table-of-contents}

---

[**Table of contents	2**](#table-of-contents)

[**General information	5**](#general-information)

[**Document Purpose	5**](#document-purpose)

[**Overview	5**](#overview)

[Core Purpose	5](#core-purpose)

[**Acronyms and Abbreviations (Example)	6**](#acronyms-and-abbreviations-\(example\))

[**System overview	7**](#system-overview)

[**Current State of the System	7**](#current-state-of-the-system)

[**Target State of the System	7**](#target-state-of-the-system)

[**Functional Requirements	7**](#functional-requirements)

[**FR1: Authentication	7**](#fr1:-authentication)

[Overview	7](#overview-1)

[Consumer	8](#consumer)

[Design	9](#design)

[Acceptance Criteria	9](#acceptance-criteria)

[Open Questions	9](#open-questions)

[FR2: Merchant	10](#fr2:-merchant)

[FR2-MERCH-01: API Service configuration	10](#fr2-merch-01:-api-service-configuration)

[Overview	10](#overview-2)

[Design	10](#design-1)

[Service Metadata Requirements	11](#service-metadata-requirements)

[Acceptance Criteria	12](#acceptance-criteria-1)

[Open Questions	13](#open-questions-1)

[FR2-MERCH-02: Image Storage & Lifecycle Management	13](#fr2-merch-02:-image-storage-&-lifecycle-management)

[Overview	13](#overview-3)

[Design	14](#design-2)

[Key Design Principles:	14](#key-design-principles:)

[Step 1 – Authorization	15](#step-1-–-authorization)

[Step 2 – Image Push	15](#step-2-–-image-push)

[Step 3 – Validation Pipeline (Handled by AMS)	15](#heading=h.lam36p8udubw)

[Interface Example:	16](#interface-example:)

[Acceptance Criteria	17](#acceptance-criteria-2)

[Open Questions	17](#open-questions-2)

[FR2-MERCH-03: Consumption	17](#fr2-merch-03:-consumption)

[Overview	17](#overview-4)

[Design	17](#design-3)

[Acceptance Criteria	18](#acceptance-criteria-3)

[Open Questions	19](#open-questions-3)

[FR2-MERCH-04: Invoicing / Usage Metrics	19](#fr2-merch-04:-invoicing-/-usage-metrics)

[Overview	19](#overview-5)

[Design	19](#design-4)

[Acceptance Criteria	20](#acceptance-criteria-4)

[Open Questions	20](#open-questions-4)

[FR2-MERCH-05: Consumer Management & Monitoring	20](#fr2-merch-05:-consumer-management-&-monitoring)

[Overview	20](#overview-6)

[Design	21](#design-5)

[1\. Consumer Usage Tracking	21](#1.-consumer-usage-tracking)

[2\. Monitoring & Dashboard	21](#2.-monitoring-&-dashboard)

[3\. Access Management	22](#3.-access-management)

[4\. Licensing & Provisioning Management	22](#4.-licensing-&-provisioning-management)

[Acceptance Criteria	23](#acceptance-criteria-5)

[Open Questions	23](#open-questions-5)

[FR3: Consumer	23](#fr3:-consumer)

[FR3-CONS-01: Api Key Management	24](#fr3-cons-01:-api-key-management)

[Overview	24](#overview-7)

[Design	24](#design-6)

[1\. API Key Generation	24](#1.-api-key-generation)

[2\. Service Access Configuration	24](#2.-service-access-configuration)

[3\. Disabling & Revoking Keys	24](#3.-disabling-&-revoking-keys)

[4\. Metadata & Description	25](#4.-metadata-&-description)

[Acceptance Criteria	25](#acceptance-criteria-6)

[Open Questions	25](#open-questions-6)

[FR3-CONS-02: Service overview	25](#fr3-cons-02:-service-overview)

[Overview	25](#overview-8)

[Design	26](#design-7)

[Acceptance Criteria	27](#acceptance-criteria-7)

[Open Questions	27](#open-questions-7)

[FR3-CONS-03: Usage overview	27](#fr3-cons-03:-usage-overview)

[Overview	27](#overview-9)

[Design	28](#design-8)

[Acceptance Criteria	28](#acceptance-criteria-8)

[Open Questions	28](#open-questions-8)

[FR3-CONS-04: Project & Teams	28](#fr3-cons-04:-project-&-teams)

[Overview	28](#overview-10)

[Design	29](#design-9)

[Acceptance Criteria	29](#acceptance-criteria-9)

[Open Questions	29](#open-questions-9)

[FR3-CONS-05: Image & container menagment	29](#fr3-cons-05:-image-&-container-menagment)

[Overview	29](#overview-11)

[Key Capabilities	29](#heading=h.asuaj7veunzt)

[Design	30](#design-10)

[Acceptance Criteria	30](#acceptance-criteria-10)

[Open Questions	30](#open-questions-10)

[FR4: Ahoy Admin	30](#fr4:-ahoy-admin)

[FR4-ADMIN-01: Merchant Management	30](#fr4-admin-01:-merchant-management)

[Overview	30](#overview-12)

[Design	31](#design-11)

[Acceptance Criteria	31](#acceptance-criteria-11)

[Open Questions	31](#open-questions-11)

[FR4-ADMIN-02: Consumer Management	31](#fr4-admin-02:-consumer-management)

[Overview	31](#overview-13)

[Design	31](#design-12)

[Acceptance Criteria	31](#acceptance-criteria-12)

[Open Questions	31](#open-questions-12)

[**Non-Functional Requirements	32**](#heading=h.ibp9do6gjao)

[**NFR1-PERF-001: API Response Time for Content Retrieval	32**](#heading=h.mgkzxk565u58)

[Overview	32](#heading=h.jed5q98z1ut)

[Design	32](#heading=h.8kuayhqxqjqs)

[Acceptance Criteria	32](#heading=h.jdew9il048t0)

[Open Questions	33](#heading=h.91np3ikkh8c9)

[**Platform Infrastructure	33**](#platform-infrastructure)

[**Infrastructure Overview	33**](#infrastructure-overview)

[AWS Infrastructure	34](#aws-infrastructure)

[**Infrastructure Pricing	35**](#infrastructure-pricing)

[Amazon RDS	36](#amazon-rds)

[**Software Development Lifecycle (SDLC)	37**](#software-development-lifecycle-\(sdlc\))

[**Code repositories	37**](#code-repositories)

[**Environments	37**](#environments)

[**Continuous Integration (CI)	38**](#continuous-integration-\(ci\))

# **General information** {#general-information}

## **Document Purpose** {#document-purpose}

This document serves as the Technical Requirements Document (TRD) for the AMS platform, specifically addressing its MVP phase. It delineates the comprehensive technical specifications, architectural design, system constituents, and infrastructural prerequisites for the platform's development and deployment.

## **Overview** {#overview}

The **AMS (Application Management & Service) Platform** is a centralized service marketplace and management system that enables organizations to publish, distribute, monetize, and consume digital services in a controlled and observable manner.

The platform connects three primary roles:

* **Ahoy Administrators** – platform-level operators with full oversight and governance.

* **Merchants** – service providers who publish APIs, Docker images, and, in future phases, SDKs and packages.

* **Consumers (End Users)** – individuals or systems that discover, access, and use services provided through AMS.

### **Core Purpose** {#core-purpose}

AMS provides a structured ecosystem where service providers can:

* Publish APIs and containerized services  
* Configure pricing and usage models  
* Track consumption in real time  
* Enforce licensing and access control  
* Generate invoices and usage reports

At the same time, Consumers can:

* Discover and search available services  
* Request access and generate API keys  
* Configure API key permissions and expiration  
* Monitor usage and spending through dashboards  
* Organize access via teams and projects  
* Pull and operate licensed Docker images

## **Acronyms and Abbreviations (Example)** {#acronyms-and-abbreviations-(example)}

| Acronym/Abbreviation | Full Name | Description |
| ----- | ----- | ----- |
| TRD | Technical Requirements Document | A document describing the technical requirements and specifications of the YouViral platform. |
| API | Application Programming Interface | A set of definitions and protocols that allows different software applications to communicate with each other. |
| AWS | Amazon Web Services | A cloud computing platform provided by Amazon that offers various services like computing, storage, and more. |

# **System overview** {#system-overview}

The AMS (Application Management & Service) platform is designed as a centralized marketplace and governance layer for digital services, including APIs and containerized workloads. It connects three primary roles:

* **Ahoy Administrators** – Platform operators with full governance and oversight  
* **Merchants** – Service providers publishing APIs and Docker images  
* **Consumers** – End users or systems consuming licensed services

At a high level, AMS consists of:

* **Identity Layer** – External Identity Provider (IdP) for authentication (e.g., Microsoft Entra ID), with internal authorization managed by AMS.

* **API Gateway Layer** – Centralized API exposure and policy enforcement using Azure API Management.

* **Consumption & Event Processing Layer** – High-throughput ingestion of usage events via a consumption endpoint, forwarding events to streaming infrastructure (e.g. Apache Kafka).

* **Image Registry Layer** – Private container registry abstraction (initially backed by Azure Container Registry).

* **Data Layer** – Structured storage for service metadata, API keys, usage metrics, licensing data, and audit logs.

* **Portal / UI Layer** – Web interface for Admins, Merchants, and Consumers.

The system is designed around separation of concerns:

* Authentication ≠ Authorization  
* Ingestion ≠ Processing  
* Registry ≠ Access validation  
* Consumption tracking ≠ Reporting

This modularity ensures scalability, vendor abstraction, and future extensibility.

## **Current State of the System** {#current-state-of-the-system}

At present, there is no existing production system. AMS is being built as an MVP from the ground up.

## **Target State of the System**  {#target-state-of-the-system}

The target state of the MVP is a fully operational, production-ready foundation of the AMS platform with the following capabilities:

**1\. Secure Multi-Tenant Platform**

* Externalized authentication via IdP (JWT \+ JWKS validation)  
* Internal RBAC-based authorization  
* Tenant isolation between Merchants and Consumers

**2\. API Service Governance**

* Merchant self-service API registration  
* Automated API onboarding into Azure API Management  
* Policy-driven tracking (request count, payload size, rate limiting)  
* Per-consumer API key enforcement

**3\. Image-Based Service Distribution**

* Docker images as first-class service entities  
* Private registry abstraction (initially Azure Container Registry)  
* Controlled push/pull via scoped tokens  
* Versioning and lifecycle management  
* Licensing enforcement (online reporting or TTL-based)

**4\. Scalable Consumption Tracking**

* High-throughput ingestion endpoint  
* Asynchronous event streaming  
* Background processing workers  
* Accurate per-service and per-consumer aggregation

**5\. Usage Reporting Foundation**

* Period-based usage reporting  
* Aggregated metrics per service and consumer  
* Exportable reports (CSV/PDF)  
* Foundation for future automated billing

**6\. Observability & Monitoring**

* Centralized logging and tracing  
* Usage dashboards for merchants and consumers  
* Administrative oversight for platform health

**7\. Cloud-Native & Extensible Architecture**

* Registry abstraction layer (future support for AWS ECR or on-prem)  
* Event-driven processing model  
* Clear separation between infrastructure and domain logic  
* Designed for future SDK/package distribution support

# **Functional Requirements** {#functional-requirements}

## **FR1: Authentication** {#fr1:-authentication}

### **Overview** {#overview-1}

The **AMS platform** needs a full-blown identity provider with proper support.

It must provide controlled access to **AHOY administrators**, who have overall control of the platform, including full oversight of all services and system health.

**Merchants** are tenants on the platform that provide the actual services. They need to be able to:

* Register a service  
* Configure the type of service (e.g., image-based or API-based)  
* Configure tracing and usage cycles

For **API-based services**, the platform should support tracking:

* Number of requests  
* Request payload size  
* Response payload size

For **image-based services**, the platform should support:

* Images with internet access that send usage data to AMS  
* Images with time-based licenses that automatically deactivate after the license period expires

### **Consumer** {#consumer}

An **Consumer** is a user who can request access to any of the available services on the platform.

The End User must be able to:

* Request access to one or more services  
* Generate API keys  
* Configure each API key to have access only to specific services  
* Invalidate (revoke) an API key  
* Create and manage multiple API keys  
* Configure each API key differently (e.g., different service access, limits, or permissions)

---

### **Design** {#design}

Authentication and authorization should be treated as **separate concerns**.

Authentication can be handled by an external Identity Provider (IdP) platform such as **Microsoft Entra ID**, while the authorization layer should be managed internally by AMS to avoid vendor lock-in.

In the initial version, the following authentication methods should be supported:

* **Email-based OTP** for signup and login  
* **Google SSO**

The primary focus should be to keep the integration with the identity provider as **abstract and provider-agnostic as possible**. Specifically:

* Integrate via a **JWKS endpoint**  
* Validate and process **access tokens**  
* Avoid tight coupling to any IdP-specific SDKs or proprietary features

This ensures flexibility, portability, and long-term architectural independence.

---

### **Acceptance Criteria** {#acceptance-criteria}

* AHOY administrators can log in and manage the platform.  
* Merchants can register and configure their services.  
* Consumers can request access to services.  
* Authentication is separate from authorization.  
* Supported authentication methods: Email OTP and Google SSO.  
* Integration with IdP is provider-agnostic using JWKS and token validation.

---

### **Open Questions** {#open-questions}

## 

## 

## **FR2: Merchant** {#fr2:-merchant}

A **Merchant** is a service provider that exists on the AMS platform.

Through AMS, Merchants provide various types of services, including:

* **APIs**  
* **Docker images**  
* In the future, **packages** and **SDKs**

Merchants manage, configure, and distribute their services entirely through AMS, while maintaining control over access, usage tracking, pricing, and service metadata.

## **FR2-MERCH-01: API Service configuration** {#fr2-merch-01:-api-service-configuration}

### **Overview** {#overview-2}

Merchants should be able to configure and expose their APIs through the AMS platform. AMS acts as a **gateway**, with **Azure API Management (APIM)** as the proxy layer, ensuring:

* Centralized API exposure  
* Consumption tracking and metrics collection  
* Configurable access control and rate limiting

This allows AMS to automatically apply policies for:

* Request tracing (count, payload size, response size)  
* Consumption monitoring  
* Optional rate limits and usage quotas

The merchant UI should provide an intuitive way to configure APIs, **without requiring direct access to APIM**.

---

### **Design** {#design-1}

**Service Configuration**

For each API, merchants should be able to:

* **Define a usage pricing model** (e.g., per request, per MB)  
* **Set usage limits** (optional)

**APIM Integration**

* AMS programmatically registers the merchant’s API in APIM via the **APIM REST API**.  
* AMS automatically applies policies for:

  * **Request/response tracing**  
  * **Logging to Event Hub / backend** for usage analytics  
  * **Rate limiting / throttling** (configurable through the UI)

**API-Specific Configuration**

For REST APIs, merchants should be able to configure:

* **Request tracing options**:  
  * Request count per API key  
  * Request payload size  
  * Response payload size

* **Rate limiting / throttling** (e.g., requests per minute/hour/day)  
* **Access control** (which consumers/projects can call the API)

All these settings should be **reflected automatically in APIM policies**, so the merchant does not manually configure APIM.

---

### **Service Metadata Requirements** {#service-metadata-requirements}

Each API added to AMS must include structured metadata, visible to **end users**:

* Service name  
* Service description (clear explanation of API functionality)  
* API base URL (proxied via AMS / APIM)  
* Documentation link  
* Version information  
* Usage & pricing model  
* Additional info: rate limits, authentication method, supported formats, SLA

This ensures APIs are **discoverable and self-explanatory** for consumers.

---

### 

**UI / AMS Portal:**

* Merchant clicks **“Add API”**  
* Form fields for metadata, pricing, limits, and tracing configuration  
* Optional rate limiting / throttling fields  
* AMS validates input, then calls backend API

**Backend Flow:**

1. Validate merchant input  
2. Call **Azure APIM REST API**:

   * Create API object  
   * Configure operations (endpoints)  
   * Apply **policies** for:

     * Consumption tracking → Event Hub  
     * Request/response logging  
     * Rate limiting / throttling

3. Store API metadata in **AMS DB**  
4. Update merchant dashboard with status

---

### **Acceptance Criteria** {#acceptance-criteria-1}

* Merchant can create a new API via AMS UI  
*  API is automatically registered in APIM  
*  Default consumption policies (logging/tracing) are applied  
*  Optional rate limits can be set via UI and reflected in APIM  
*  API metadata is stored in AMS DB and visible to end users

---

### **Open Questions** {#open-questions-1}

## **FR2-MERCH-02: Image Storage & Lifecycle Management** {#fr2-merch-02:-image-storage-&-lifecycle-management}

### **Overview** {#overview-3}

Merchants should have a **predefined configuration process** for registering and managing Docker image-based services within AMS.

**Image Service Onboarding**

After configuring a Docker image as a service offering in AMS, the Merchant should be able to:

* Push Docker images to the AMS platform  
* Define the type of image offering (e.g., public API container, batch processor, offline licensed image, etc.)  
* Assign versioning to the image  
* Configure runtime parameters (if applicable)

---

**Standardized Image Publishing Process**

The platform should provide a **standardized and documented process** for:

* Pushing images to AMS image storage (private registry)  
* Version management  
* Tagging conventions  
* Defining licensing models (e.g., internet-connected usage reporting vs. time-based license)  
* Configuring image-level usage tracking

---

**Image Configuration & Management**

The platform should allow Merchants to:

* Manage image configuration through the AMS portal  
* Update metadata  
* Control access (which consumers can pull the image)  
* Monitor usage and licensing compliance  
* Deprecate or disable specific image versions

---

### **Design** {#design-2}

**1\. Service Model – “Images as a Service Type”**

The AMS platform must support **Docker images as a first-class service type**.

#### **Key Design Principles:** {#key-design-principles:}

* A single **Service** can contain **multiple Docker images**  
* Each image can have:  
  * Multiple versions  
  * Independent lifecycle state  
  * Independent licensing configuration

* Images are logically grouped under a **Merchant-owned Service**

Example structure:

Merchant  
└── Service (Image-based)  
     ├── Image A (API container)  
     │     ├── v1.0.0  
     │     └── v1.1.0  
     ├── Image B (Worker)  
     │     ├── v1.0.0  
     │     └── v2.0.0

This supports complex service compositions where one logical product depends on multiple containers.

---

**2\. Image Upload & Validation Flow**

When a Merchant pushes a new image version:

#### **Step 1 – Authorization** {#step-1-–-authorization}

AMS issues a **PAT (Personal Access Token)** or API key:

* Scoped to a **single Image Service**  
* Permission-controlled (push-only, versioned, revocable)  
* Time-bound (optional)

This token is:

* Associated with the Merchant  
* Linked to a specific service  
* Auditable and revocable

---

#### **Step 2 – Image Push** {#step-2-–-image-push}

For MVP, images are stored in **Azure Container Registry**.

However:

* The container registry **must not be publicly accessible**  
* End users must never pull images directly from the registry  
* All access must go through AMS validation logic


**3\. Abstraction Layer for Registry**

Even though MVP uses **Azure Container Registry**, AMS must implement a **Registry Abstraction Layer**.

#### **Interface Example:** {#interface-example:}

ImageRegistryProvider  
 \- PushImage()  
 \- ValidateImage()  
 \- GeneratePullToken()  
 \- GetImageMetadata()  
 \- RevokeAccess()

This ensures:

* No hard vendor lock-in  
* Future support for:  
  * AWS ECR  
  * Self-hosted registry  
  * On-prem registry

Registry provider becomes a pluggable infrastructure component.

---

### **Acceptance Criteria** {#acceptance-criteria-2}

* Merchants can push Docker images to AMS.  
* Merchants can define image type and assign versioning.  
* Merchants can manage image metadata, access control, and monitor usage.  
* Merchants can deprecate or disable specific image versions.  
* Each service can contain multiple images with independent versions and licensing.  
* AMS issues scoped, auditable tokens for image push operations.  
* AMS enforces access through its platform; registry is not publicly accessible.  
* Registry access is abstracted to allow future support for multiple providers.

---

### **Open Questions** {#open-questions-2}

## **FR2-MERCH-03: Consumption**  {#fr2-merch-03:-consumption}

### **Overview** {#overview-4}

Merchants should have a **consumption endpoint** provided from AMS side, to which they can send usage data.

---

### **Design** {#design-3}

The AMS platform provides a **highly scalable consumption endpoint** for merchants to send usage data. This endpoint is the core of usage tracking and billing, designed to handle **high volumes of concurrent requests** reliably without causing bottlenecks.

Incoming requests include the **consumer API key** and the **merchant’s service configuration**, enabling AMS to track usage per consumer and per service accurately. The endpoint performs **authorization and validation checks** to ensure only valid requests are processed: it validates API keys, verifies access to the requested service, and blocks requests if merchant configurations are invalid or incomplete.

Once validated, usage data is forwarded to a **centralized consumption processing environment**, which interfaces with **Azure Event Hub or Kafka** in a **fire-and-forget manner**. This design ensures that service containers can send data asynchronously without waiting for processing to complete, avoiding performance bottlenecks. **Background workers** then pick up the events, process them, and persist the consumption metrics per service, ensuring accurate tracking for analytics and billing. The system is designed to **handle multiple containers sending data simultaneously** without loss or duplication of events.

**Key Requirements**

1. **High Scalability**

   * The consumption endpoint must handle **high volumes of requests** reliably.  
   * It should be designed to process usage data efficiently, even under heavy load.

2. **Data Received**

   * The endpoint should receive:  
     * **Consumer API key**  
     * **Merchant configuration** for the designated service

   * This allows AMS to **track usage per consumer and per service** accurately.

3. **Authorization & Access Control**

   * The endpoint should perform **basic authorization checks**:  
     * Validate the consumer’s API key  
     * Verify access to the requested service  
     * Block requests if the Merchant’s configuration is misconfigured or the API key is invalid

4. **Usage Tracking**

   * All incoming requests should be logged for usage tracking, analytics, and billing purposes.

---

### **Acceptance Criteria** {#acceptance-criteria-3}

* The consumption endpoint must **accept usage data from multiple merchant containers simultaneously** without errors or data loss.

* Only **valid API keys** and correctly configured services are authorized; invalid keys or misconfigured services are rejected.

* All incoming usage events are **logged** and **forwarded reliably** to the Event Hub/Kafka interface.

* Background workers **process and persist consumption metrics correctly**, associating data with the correct service and consumer.

---

### **Open Questions** {#open-questions-3}

## **FR2-MERCH-04: Invoicing / Usage Metrics** {#fr2-merch-04:-invoicing-/-usage-metrics}

### **Overview** {#overview-5}

Merchants should have the ability to **generate invoices / usage metrics reports** based on usage of their services.

In the MVP phase, full invoicing is not supported. The business team should be able to generate usage reports for certain periods, and based on that communicate spending with the end user.

---

### **Design** {#design-4}

In the MVP phase, AMS will provide a **usage reporting system** that allows merchants to track consumption of their services and prepare invoice-like reports without full automated billing.

The system will rely on **consumption data** collected via the usage endpoint (FR2-MERCH-03). Background workers process and persist usage metrics per consumer, per service, and per image/version. These metrics are stored in a structured database to allow **querying for specific periods** and aggregation by consumer or service.

Merchants access usage metrics via the AMS portal:

* **Report Generation:** Merchants can request usage reports for a specific consumer, group of consumers, or an entire service.

* **Aggregation & Calculation:** Usage is aggregated based on predefined service models (e.g., number of requests, data transferred, time-based usage).

* **Export & Sharing:** Reports can be exported in common formats (CSV, PDF) and shared with consumers.

* **Historical Data:** Reports include historical usage for a selected period, enabling monthly or custom reporting cycles.

The design ensures separation of concerns: the **consumption tracking pipeline** is decoupled from the reporting layer, allowing scalability and eventual integration with full invoicing/billing systems in the future.

---

### **Acceptance Criteria** {#acceptance-criteria-4}

* Merchants can generate **usage reports** for one or multiple.  
* Reports aggregate usage metrics accurately based on service type and usage model.  
* Reports can be generated for **custom date ranges** and historical periods.  
* Reports can be **exported** (CSV, PDF) and shared with consumers.  
* All usage data used in reports is **sourced from validated consumption data**.  
* Merchants can generate reports **without affecting consumption tracking pipeline**.

---

### **Open Questions** {#open-questions-4}

## **FR2-MERCH-05: Consumer Management & Monitoring** {#fr2-merch-05:-consumer-management-&-monitoring}

### **Overview** {#overview-6}

Merchants should have comprehensive control and visibility over how their services—both APIs and images—are being consumed. This includes not only tracking usage but also managing access and understanding licensing status for their digital assets.

Merchants should be able to see which consumers are actively using their APIs or images, including detailed metrics such as request counts, payload usage, or execution frequency. This allows them to understand usage patterns per consumer and identify heavy users or potential misuse.

An overview dashboard should provide a clear snapshot of overall service activity, highlighting trends, spikes, and usage distribution among consumers. For individual consumers, merchants should be able to drill down to view monthly usage history and access historical data for reporting, auditing, or review purposes.

Additionally, merchants must be able to block or restrict specific consumers from accessing a service if required, providing granular control over who can use each API or image.

For images, especially those that are online or licensed assets, merchants should also be able to view **license or provisioning status**. This includes whether the image is properly provisioned for consumption, whether it has a valid license, and any restrictions associated with its usage. By surfacing this information directly in the management interface, merchants can ensure compliance with licensing agreements and avoid unauthorized distribution.

This unified monitoring and management capability ensures that merchants have full visibility into usage, licensing, and access control for all their services, helping them make informed decisions and maintain operational control.

---

### **Design** {#design-5}

#### **1\. Consumer Usage Tracking** {#1.-consumer-usage-tracking}

* All usage data is captured via the **Consumption Endpoint** (FR2-MERCH-03) and stored in a structured **Usage Metrics Database**.

* For API services, tracked metrics include:

  * Requests per API key/consumer  
  * Payload size (requests and responses)  
  * Timestamped execution history

* For image services, tracked metrics include:

  * Pull frequency per consumer  
  * Execution counts (for online images reporting usage)  
  * License and TTL compliance

#### **2\. Monitoring & Dashboard** {#2.-monitoring-&-dashboard}

* **Overview Dashboard**:

  * Aggregates all service consumption across all consumers  
  * Displays trends (daily/weekly/monthly), spikes, and usage distribution  
  * Visualizes top consumers by activity

* **Consumer Detail View**:

  * Drill-down view per consumer  
  * Monthly usage history and historical data  
  * License/provisioning status for images

* **Alerting & Notifications** (future enhancement):

  * Option to notify merchants when usage exceeds thresholds or licensing violations occur

#### **3\. Access Management** {#3.-access-management}

* Merchants can **block or restrict consumers** on a per-service basis

* Restrictions are enforced through:

  * API key disabling or revocation  
  * Pull-token revocation for image services

* All changes are **auditable** in the platform for compliance purposes

#### **4\. Licensing & Provisioning Management** {#4.-licensing-&-provisioning-management}

* For image services:  
  * License validity and provisioning status are displayed  
  * TTL, usage limits, and access restrictions are enforced

* For API services:  
  * Optional usage quota enforcement per consumer

* All licensing checks are performed at consumption or pull time

---

### **Acceptance Criteria** {#acceptance-criteria-5}

* Merchants can view overall usage metrics for all services in a unified dashboard.  
* Merchants can drill down into individual consumer activity, including monthly usage history.  
* Merchants can identify top consumers and detect potential misuse patterns.  
* Merchants can block or restrict a specific consumer from accessing a service.  
* For images, merchants can view provisioning status, license validity, and restrictions.  
* Usage metrics reflect real-time consumption data from APIs and images accurately.  
* Dashboard visualizations clearly show trends, spikes, and the distribution of consumer usage.

---

### **Open Questions** {#open-questions-5}

## **FR3: Consumer** {#fr3:-consumer}

A **Consumer** of the AMS platform is a **person or system** that uses services provided on the platform.

**Key Capabilities**

1. **Discover Services**  
   * View and browse available services on the platform.

2. **Request Access**  
   * Request access to one or more services provided by Merchants.

3. **API Key Management**  
   * Generate **API keys** to access authorized services.  
   * Configure API keys with specific service access and limits.  
   * Manage multiple API keys with different configurations.

4. **Usage Tracking**  
   * Monitor their own usage where applicable (optional for transparency).

## **FR3-CONS-01: Api Key Management** {#fr3-cons-01:-api-key-management}

### **Overview** {#overview-7}

Consumers need full control over their API keys to access services on the AMS platform. This includes the ability to generate, configure, and manage multiple API keys with specific service access and metadata. Proper management ensures secure, auditable, and flexible access to merchant services.

---

### **Design** {#design-6}

#### **1\. API Key Generation** {#1.-api-key-generation}

* Consumers can generate one or more API keys via the AMS portal or API.  
* Key generation supports:  
  * Unique identifier for each key  
  * Association with one or more services  
  * Automatic recording of creation timestamp

* Generated keys are stored securely in the **API Key Store** (encrypted at rest).

#### **2\. Service Access Configuration** {#2.-service-access-configuration}

* Each API key can be configured with specific service access:  
  * Multiple services can be assigned to a single key

* The **Authorization Layer** enforces these access rules at request time.

#### **3\. Disabling & Revoking Keys** {#3.-disabling-&-revoking-keys}

* Consumers can disable a key temporarily or revoke permanently:  
  * Disabled keys are immediately rejected at the gateway  
  * Revoked keys cannot be re-enabled

* Revocation actions are **auditable**, capturing user, timestamp, and reason.

#### **4\. Metadata & Description** {#4.-metadata-&-description}

* Consumers can add metadata to each API key:  
  * Name, description, purpose, or notes  
  * Helps manage multiple keys efficiently

* Metadata is editable by the consumer without affecting access permissions.

---

### **Acceptance Criteria** {#acceptance-criteria-6}

* Consumers can generate new API keys via the AMS portal or API.  
* Consumers can assign one or multiple services to each API key.  
* Consumers can disable or revoke API keys at any time.  
* Consumers can add, edit, and view metadata for each API key.  
* API keys are enforced at all request endpoints; invalid or expired keys are rejected.  
* All key management actions (creation, update, revocation) are auditable.  
* Dashboard displays key status, TTL, associated services, and metadata clearly.

---

### **Open Questions** {#open-questions-6}

## **FR3-CONS-02: Service overview** {#fr3-cons-02:-service-overview}

### **Overview** {#overview-8}

End Users and the general public should be able to search, discover, and browse services available on the AMS platform. Authenticated consumers can request access to services and generate the required credentials, while unauthenticated visitors can view the public service catalog for discovery and SEO purposes.

**Key Capabilities**

1. **Service Discovery**  
   * Search for available services provided by Merchants.  
   * Filter and browse services based on type (API, Docker image, etc.), category, or metadata.

2. **Access Requests**  
   * Request access to a selected service.  
   * Generate **API keys** or configure other access credentials as required.

---

### **Design** {#design-7}

**Service Discovery (Public & Authenticated)**:

* All users, including unauthenticated visitors, can browse and search services.  
* Services can be filtered by type (API, Docker image), category, or metadata.  
* SEO-optimized pages for each service to improve visibility in search engines.

**Access Requests (Authenticated Users Only)**:

* Authenticated consumers can request access to a service.  
* Approved requests trigger credential generation (API key or image token).  
* Dashboard shows access status (pending, approved, denied).

**UI / Portal**:

* Public service catalog: list or grid of all available services with metadata (name, description, version, availability).  
* Search and filter controls.  
* For authenticated users: access request button per service.

**SEO Considerations**:

* Service pages are crawlable by search engines.  
* Structured metadata (JSON-LD or OpenGraph) for better indexing.  
* Friendly URLs and descriptive titles for each service.

---

### **Acceptance Criteria** {#acceptance-criteria-7}

* All users, including unauthenticated visitors, can view the public service catalog.  
* Consumers can search and filter services by type, category, or metadata.  
* SEO-optimized service pages exist for each service, with structured metadata and friendly URLs.  
* Authenticated consumers can request access to a service from the portal.  
* Consumers can view the status of their access requests (pending, approved, denied).

---

### **Open Questions** {#open-questions-7}

## 

## **FR3-CONS-03: Usage overview** {#fr3-cons-03:-usage-overview}

### **Overview** {#overview-9}

End Users (Consumers) should have access to a usage dashboard that provides clear visibility into their service consumption and spending. The dashboard must offer transparency across services, API keys, and teams/projects, enabling users to monitor usage, track costs, and analyze historical trends.

**Key Capabilities**

1. **Service-Level Usage**  
   * View usage and spending **per service**.

2. **API Key-Level Usage**  
   * Track usage and spending **per API key**.

3. **Combined Overview**  
   * See **total consumption and spending** across all services and API keys.

4. **Historical Data & Trends**  
   * Access historical usage data for reporting and budget tracking.  
   * Optionally filter by date range, service, or team/project.

5. **Transparency & Monitoring**  
   * Enable End Users to monitor their usage in real time.

---

### **Design** {#design-8}

#### **1\. Usage Data Source**

* All usage data is sourced from the validated consumption pipeline (FR2-MERCH-03).

* Data is aggregated per:

  * Consumer  
  * Service  
  * API Key  
  * Team / Project (if applicable)

* Metrics include:

  * Request count  
  * Data transfer (if applicable)  
  * Execution frequency (for images)  
  * Calculated cost based on merchant pricing model

---

#### **2\. Dashboard Structure**

**Service-Level View**

* Usage and spending per service  
* Clear breakdown of consumption metrics  
* Current billing period summary

**API Key-Level View**

* Usage per API key  
* Associated services per key  
* Status of key (active, disabled, expired)

**Combined Overview**

* Total usage across all services  
* Total calculated spending  
* Top services by consumption

---

#### **3\. Historical Data & Filtering**

* Consumers can filter by:

  * Date range  
  * Service  
  * API key  
  * Team / Project

* Historical data should support:

  * Monthly summaries  
  * Custom date ranges

* Simple trend visualization (daily or monthly graph)

---

### **Acceptance Criteria** {#acceptance-criteria-8}

* Consumers can view usage and spending per service.  
* Consumers can view usage and spending per API key.  
* Consumers can see total combined usage and calculated spending.  
* Consumers can filter usage data by date range, service, API key, or team/project.  
* Historical usage data is accessible for past billing periods.  
* Dashboard reflects near real-time usage data.  
* Consumers cannot access usage data belonging to other consumers.

---

### **Open Questions** {#open-questions-8}

## 

## **FR3-CONS-04: Project & Teams**  {#fr3-cons-04:-project-&-teams}

### **Overview** {#overview-10}

End Users (Consumers) should be able to create logical groupings such as **Teams** or **Projects** within the AMS platform. These groupings allow collaborative management of services, API keys, usage tracking, and access control while maintaining clear visibility of roles and responsibilities.

Teams/Projects help organize service consumption across departments, products, or environments (e.g., Development, Production, Analytics).

**Key Capabilities**

1. **Create Teams / Projects**  
   * End Users can define teams or projects to organize work or service usage.

2. **Invite Members**  
   * Invite other users to join a team or project.  
   * Manage team/project membership.

3. **Access Configuration**  
   * Assign specific permissions and access rights to members within the team or project.  
   * Control which services or resources team members can access.

4. **Collaboration & Management**  
   * Teams/projects allow users to manage API keys, usage tracking, and service access collectively.  
   * Maintain clear visibility over roles and responsibilities within the group.

---

### **Design** {#design-9}

#### **1\. Team / Project Creation**

* Consumers can create one or multiple Teams or Projects.  
* Each Team/Project includes:

  * Name  
  * Description (optional)  
  * Owner (creator by default)  
  * Creation timestamp

* A user can belong to multiple Teams/Projects.

---

#### **2\. Membership Management**

* Team/Project owners can:

  * Invite members via email  
  * Remove members  
  * Assign roles

* Invitation flow:

  * If user exists → direct assignment  
  * If not → invitation email with registration link

* Membership actions are auditable.

---

#### **3\. Roles & Permissions**

Each Team/Project supports role-based access control (RBAC).

Example roles (MVP):

* **Owner** – Full control (manage members, keys, services)  
* **Admin** – Manage API keys and service access ( generate new keys, remove old ones )  
* **Member** – Use assigned services and view usage ( can get keys but not modify )

Permissions may include:

* Generate API keys within the project  
* Assign services to API keys  
* View usage dashboard  
* Manage access requests

Authorization is enforced through the platform’s internal authorization layer.

---

#### **4\. Service & Resource Association**

Teams/Projects can:

* Own API keys  
* Be assigned access to specific services  
* View usage aggregated at the Team/Project level  
* Restrict certain services to specific Teams

This allows separation of environments (e.g., staging vs. production) or business units.

---

### **Acceptance Criteria** {#acceptance-criteria-9}

* Users can create Teams/Projects with a name and description.  
* Users can invite and remove members from a Team/Project.  
* Role-based permissions are enforced within Teams/Projects.  
* API keys can be created and managed at the Team/Project level.  
* Usage data can be filtered and viewed per Team/Project.  
* Members can only access services and resources assigned to their Team/Project.  
* All membership and permission changes are auditable.

---

### **Open Questions** {#open-questions-9}

## **FR3-CONS-05: Image & container menagment** {#fr3-cons-05:-image-&-container-menagment}

### **Overview** {#overview-11}

End Users should be able to **pull and use Docker images** provided on the AMS platform, with proper access controls based on the image type.

---

### **Design** {#design-10}

### **1\. Image as a First-Class Service Entity**

Docker images are modeled as a **Service Type: Image-Based Service** within AMS.

Structure:

* Merchant

  * Service (Image-Based)

    * Image

      * Version (e.g., v1.0.0, v1.1.0)

Each image version contains:

* Metadata (name, description, category, tags)  
* Version number (semantic versioning)  
* Licensing model (online / offline TTL-based)  
* Runtime instructions (pull command, environment variables)  
* Usage model (execution-based, pull-based, time-based)

Images are discoverable via the public or authenticated catalog, similar to API services.

---

### **2\. Image Discovery & Metadata**

Consumers can:

* Browse images by category, merchant, or tags  
* View version history  
* See licensing type (online reporting vs. offline TTL)  
* Access usage instructions and required environment variables

Each image page includes:

* Pull command (abstracted through AMS)  
* Required API key / token instructions  
* License terms summary

---

### **3\. Secure Image Pull Flow**

Images are stored in a private registry (e.g., Azure Container Registry), but **direct registry access is not exposed publicly**.

Pull flow:

1. Consumer requests pull access via AMS.  
2. AMS validates:

   * Consumer entitlement  
   * Team/project association  
   * License status

3. AMS generates a short-lived pull token.  
4. Consumer pulls the image using the generated token.

Tokens are:

* Scoped to image \+ version  
* Time-bound  
* Revocable

---

### **4\. Licensing Enforcement Models**

#### **A. Online (Internet-Connected) Images**

At container startup:

* Container must provide a valid AMS API key.  
* Container registers with the Consumption Endpoint.  
* Usage is reported periodically.

If:

* API key is invalid  
* License is expired

* Consumer is blocked

The container must refuse to start or deactivate functionality.

---

#### **B. Offline / TTL-Based Images**

For restricted environments:

* AMS issues a signed license token.  
* Token contains:

  * Expiry timestamp  
  * Consumer ID  
  * Image version

* Container validates signature locally.  
* After TTL expires → container disables functionality.

No runtime internet dependency required.

---

### **Acceptance Criteria** {#acceptance-criteria-10}

* Consumers can browse and search available Docker images with metadata and version information.  
* Consumers can request and receive pull access to licensed images.  
* Image pulls require a short-lived, scoped token generated by AMS.  
* Online images require a valid API key at startup and reject invalid or expired credentials.  
* Offline images enforce TTL-based licensing via signed license tokens.  
* Image usage is tracked and associated with the correct consumer and service.  
* Images can be assigned to Teams/Projects, and access is restricted accordingly.  
* Expired licenses or revoked access prevent further image pulls or execution.

---

### **Open Questions** {#open-questions-10}

## **FR4: Ahoy Admin** {#fr4:-ahoy-admin}

Administrative capabilities for internal Ahoy operators to manage platform participants (Merchants & Consumers), enforce compliance, and maintain operational control across AMS.

## **FR4-ADMIN-01: Merchant Management** {#fr4-admin-01:-merchant-management}

### **Overview** {#overview-12}

Ahoy Admin users must be able to manage Merchants onboarded to AMS, including lifecycle control, compliance enforcement, and service governance.

This includes approval workflows, service visibility control, and merchant-level operational status management.

---

### **Design** {#design-11}

**1\. Merchant Lifecycle**

Merchant states:

* Pending (awaiting review)  
* Active  
* Suspended  
* Disabled

Admin actions:

* Approve / Reject onboarding  
* Suspend merchant (temporary restriction)  
* Disable merchant (hard stop)

State changes immediately impact:

* Service visibility in catalog  
* API / image accessibility  
* Revenue tracking eligibility

---

**2\. Service Governance**

Admins can:

* View all services (APIs & Images) published by a merchant  
* Override service visibility  
* Force-disable a specific service  
* Review metadata and compliance declarations

This does not replace merchant self-management but provides supervisory control.

---

**3\. Compliance & Risk Controls**

Admin capabilities include:

* Flagging a merchant for review  
* Blocking new consumer subscriptions  
* Monitoring usage anomalies (high-level view)

Operational enforcement integrates with:

* API access control  
* Image pull authorization  
* License enforcement

---

### **Acceptance Criteria** {#acceptance-criteria-11}

* Admin can view a list of all registered merchants.  
* Admin can change merchant lifecycle state (Pending, Active, Suspended, Disabled).  
* Suspending or disabling a merchant prevents new subscriptions and access to their services.  
* Admin can view all services associated with a merchant.  
* Admin can override or disable a specific service if required.  
* All admin actions are logged for auditing.

---

### **Open Questions** {#open-questions-11}

## **FR4-ADMIN-02: Consumer Management** {#fr4-admin-02:-consumer-management}

### **Overview** {#overview-13}

Ahoy Admin users must be able to oversee Consumers using the AMS platform, including account lifecycle control, subscription oversight, and access enforcement.

This ensures operational integrity, fraud mitigation, and platform compliance.

---

### **Design** {#design-12}

**Consumer Lifecycle**

Consumer states:

* Active  
* Suspended  
* Disabled

Admin actions:

* Suspend consumer (temporary restriction)  
* Disable consumer (permanent restriction)

Impact:

* API keys invalidated  
* Image pull tokens revoked  
* Active subscriptions frozen

---

**2\. Subscription & Usage Oversight**

Admins can:

* View consumer subscriptions (APIs & Images)  
* Inspect assigned teams/projects  
* View high-level usage metrics  
* Identify abnormal usage patterns

This supports billing disputes and compliance checks.

---

**3\. Access & Credential Control**

Admins can:

* Revoke API keys  
* Force key regeneration  
* Invalidate image license tokens  
* Terminate active sessions (where applicable)

All changes propagate to enforcement layers (APIM policies, image validation logic).

---

### **Acceptance Criteria** {#acceptance-criteria-12}

* Admin can view and search all registered consumers.  
* Admin can change consumer lifecycle state (Active, Suspended, Disabled).  
* Suspending or disabling a consumer prevents API access and image pulls.  
* Admin can view consumer subscriptions and assigned teams/projects.  
* Admin can revoke or regenerate consumer API keys.  
* All admin actions are auditable.

---

### **Open Questions** {#open-questions-12}

# **Non-Functional Requirements**

### ---

## **NFR1: Monitoring & Alerts**

### **Overview**

Monitoring and observability for AMS MVP will be implemented using Azure Application Insights.

The objective is to provide:

* Request tracing  
* Error monitoring  
* Dependency tracking  
* Alerting for critical failures

This ensures operational visibility across APIs, image services, and the Consumption Endpoint.

### ---

### **Design**

**1\. Telemetry Collection**

Application Insights will capture:

* API request/response metrics  
* Exception logs  
* Dependency calls (e.g., database, external services)  
* Custom events (e.g., license validation failures)

Structured logging standards will be enforced across services.

### 

**2\. Distributed Tracing**

Each request should include:

* Correlation ID  
* Service-to-service trace propagation

This enables root cause analysis across:

* API Gateway  
* Backend services  
* Consumption pipeline

### 

**3\. Alerts**

Alerts will be configured for:

* High error rate  
* Increased response time  
* Consumption endpoint failures  
* Dependency downtime

Alerts should integrate with the internal notification channel (e.g., email or incident management tool).

### 

### **Acceptance Criteria**

* ### All backend services are integrated with Application Insights.

* ### Errors and exceptions are logged with correlation IDs.

* ### Alerts are configured for critical failures and high error rates.

* ### Consumption endpoint failures trigger alerts within defined threshold.

### ---

### **Open Questions**

### ---

## **NFR2: Documentation**

### **Overview**

Comprehensive documentation must be available to ensure Merchants and Consumers can effectively use the AMS platform.

Documentation should cover onboarding, service publication, API usage, image pulling, licensing models, and billing concepts.

### ---

### **Design**

**1\. Public Documentation Portal**

Documentation should include:

* Platform overview  
* Merchant onboarding guide  
* Consumer onboarding guide  
* API key usage instructions  
* Docker image usage & licensing instructions  
* FAQ and troubleshooting

Documentation should be versioned and aligned with platform releases.

**2\. Developer-Focused Content**

Include:

* API examples (request/response samples)  
* Authentication instructions  
* Usage reporting guidelines  
* Error handling explanations

Where applicable, align documentation with gateway exposure (e.g., via Azure API Management developer portal).

**3\. Governance**

* Documentation updates required as part of feature release process  
* Clear ownership for maintaining documentation  
* Change log for significant updates

### ---

### **Acceptance Criteria**

* Public documentation is accessible to Consumers and Merchants.  
* Documentation covers onboarding, authentication, and usage workflows.  
* API examples and usage instructions are provided.  
* Image-based services include clear pull and license validation instructions.  
* Documentation is version-aligned with MVP release.

### ---

### **Open Questions**

### ---

## **NFR3: Consumption Endpoint Performance & Scalability**

### **Overview**

The Consumption Endpoint is a critical component responsible for ingesting service usage events (APIs and images).

It must be:

* Highly available  
* Scalable under load  
* Resilient to traffic spikes  
* Fault tolerant

It directly impacts billing accuracy and platform reliability.

### ---

### **Design**

**1\. Stateless Ingestion Layer**

The Consumption Endpoint should:

* Be stateless  
* Validate minimal required metadata  
* Immediately enqueue events for processing

This prevents blocking under high load.

**2\. Asynchronous Processing**

Usage events should be pushed into a durable messaging system (e.g., event streaming or queue).

Processing (aggregation, billing calculations) must occur asynchronously to avoid request-time coupling.

**3\. Scalability**

The ingestion service must:

* Support horizontal scaling  
* Handle burst traffic from multiple tenants  
* Maintain consistent latency under load

Auto-scaling policies should be configured based on:

* CPU utilization  
* Request rate  
* Queue depth

**4\. Reliability**

* Idempotent event handling  
* Retry mechanisms for transient failures  
* Dead-letter handling for malformed events

Data loss must be prevented under normal failure scenarios.

### 

### **Acceptance Criteria**

* Consumption endpoint supports horizontal scaling.  
* Usage events are processed asynchronously.  
* No data loss under transient failure scenarios.  
* Endpoint maintains acceptable latency under defined load threshold.  
* Alerts are triggered when ingestion failure rate exceeds threshold.

### ---

### **Open Questions**

### 

# **Platform Infrastructure** {#platform-infrastructure}

## **Infrastructure Overview** {#infrastructure-overview}

This section delineates the infrastructure necessary to support the platform modules and their dependencies.

Ideally, it should incorporate a replica of the context diagram from the "System Overview" section. However, the conceptual components within this replica should be supplanted by icons representing concrete infrastructure instances (e.g., AWS/Azure building blocks such as ECS instances or Azure Container Apps). This should subsequently be followed by spreadsheets enumerating all components from the diagram, including their respective names and descriptions.

Example:

### **AWS Infrastructure** {#aws-infrastructure}

| Service | Purpose / Role | Notes / Scale |
| ----- | ----- | ----- |
| **Amazon ECS Fargate** | Runs **2 containers**: Next.js Web App (SSR/SSG), Express-based Web API (all modules) | Autoscaling tasks based on load |
| **AWS Lambda** | Event-driven business logic (moderation, referrals, notifications, audit pulls, challenge resolution, search indexing, etc.) | \~20-30 functions, scheduled via EventBridge |
| **Amazon S3** | Storage buckets for: • Raw uploads (videos) • Processed videos, thumbnails • Profile & static assets | 3 buckets, accessed via pre-signed URLs |
| **Amazon CloudFront** | CDN to deliver video assets globally | Single distribution |
| **Amazon MediaConvert** | Video transcoding and processing | On-demand, usage-based |
| **Amazon Rekognition** | Video content moderation | On-demand, usage-based |
| **Amazon RDS (PostgreSQL)** | Primary relational database for user data, challenges, submissions, notifications, KYC status, etc. | Single instance, scalable storage |
| **Amazon SNS** | Pub/sub messaging for fanout of events (moderation, notifications, referrals, search triggers) | \~4 topics |
| **Amazon SQS** *(optional)* | Buffering queues for decoupling asynchronous processes (if needed) | 0–2 queues depending on load |
| **Amazon CloudWatch Logs** | Centralized logs from containers, Lambdas, Fireblocks audit pullers | Multiple log groups |
| **Amazon CloudWatch Alarms** | Alerting on operational metrics (errors, latency, failed transactions) | \~10–20 alarms |
| **Amazon CloudTrail** | API activity and access logging for compliance and auditing | Single trail (optional but recommended) |
| **AWS Secrets Manager** | Secure storage of API keys and credentials (Fireblocks, Auth0, Sumsub, SendGrid, DB, etc.) | \~10-20 secrets |

## **Infrastructure Pricing** {#infrastructure-pricing}

Initial assumptions regarding platform usage are based on a breakdown of potential throughput, derived from a table detailing tracked metrics, values, and relevant notes.

A comprehensive analysis of all infrastructure components, including configuration, SKU analysis, and estimated monthly costs, will be provided, along with a summary.

Example:

## **Assumption:**

| Metric | Value | Notes |
| ----- | ----- | ----- |
| **Monthly Active Users (MAU)** | \~10,000 |  |
| **Challenges per month** | 500 | New challenges created monthly |
| **Submissions per challenge** | \~50 | Average number of submissions per challenge |
| **Total submissions per month** | 25,000 | 500 challenges × 50 submissions |
| **Average submission video size** | \~30 MB raw, \~55 MB processed (all formats combined) | Includes WebM, preview, thumbnail |
| **Average video length** | \~20 seconds | Used for MediaConvert and Rekognition calculations |
| **Average notifications per user per month** | \~12.5 | Estimated from 10–15 notifications/user/month |

### **Amazon RDS** {#amazon-rds}

We'll assume:

* **Single AZ** (MVP: no failover)  
* **No read replicas yet**  
* **Automated backups enabled**  
* **PostgreSQL 14+**  
* **Provisioned instance, not Aurora** (simpler \+ cheaper to start)

| Component | Cost (USD) |
| ----- | ----- |
| **Instance (t3.large)** | $60.00 |
| **Storage (100 GB)** | $10.00 |
| **Backups** | $0.00 (covered) |
| **Total** | **$70.00/month** |

# **Software Development Lifecycle (SDLC)** {#software-development-lifecycle-(sdlc)}

This section details the product development lifecycle, encompassing the methodology for software authoring, storage, construction, and deployment.

## **Code repositories** {#code-repositories}

Outline code repositories and their naming conventions relative to system requirements.

Outline branching strategy and merge request requirements (What constitutes an acceptable pull request and what is the definition of done).

## **Environments** {#environments}

Please provide an overview of the deployment environments and elaborate on the development process within each. Additionally, address any particular considerations regarding production releases, including the deployment strategy. A table outlining the environments and their respective release triggers would be beneficial.

Example:

| Environment | Release trigger | Source branch |
| :---- | :---- | :---- |
| test | Automatic Manual (feature branch) | main or feature branches  |
| production | Manual | main |

## 

## **Continuous Integration (CI)** {#continuous-integration-(ci)}

Outline essential platform pipelines, their deployment triggers, rough steps, and targeted completion states.

# Images Service

![][image2] 							       			**SDD**

# 

# **Step 1 — Merchant Registers an Image Service in AMS**

Before pushing anything, the Merchant:

1. Logs into AMS Portal  
2. Creates a new **Image-Based Service**  
3. Defines:  
   * Service name  
   * Image type (API, worker, batch, offline, etc.)  
   * Licensing model  
   * Visibility rules

At this point, AMS:

* Creates a logical repository mapping  
* Generates a **push credential (PAT or scoped token)**  
* Associates it with this specific service

Under the hood (MVP):  
Repository is created in **Azure Container Registry**

Example internal repo name:

```
ams/merchant123/payment-api
```

Merchant does NOT see raw ACR structure.

---

# **Step 2 — Merchant Builds the Image Locally**

Merchant builds normally:

```shell
docker build -t payment-api:1.0.0 .
```

Nothing AMS-specific yet.

---

# **Step 3 — Merchant Logs Into AMS Registry**

AMS gives Merchant:

* Registry URL (e.g. `registry.ams.io`)  
* Username (token ID)  
* Password (generated secret)

Merchant runs:

```shell
docker login registry.ams.io
```

---

# **Step 4 — Merchant Tags Image Properly**

AMS defines tagging rules.

Example:

```shell
docker tag payment-api:1.0.0 registry.ams.io/merchant123/payment-api:1.0.0
```

This ensures:

* Correct merchant namespace  
* Correct service association  
* Version consistency

---

# **Step 5 — Merchant Pushes Image**

```shell
docker push registry.ams.io/merchant123/payment-api:1.0.0
```

---

# **Step 6 — What Happens Behind the Scenes**

1. Image is stored in private ACR  
2. ACR emits push event (optional via Event Grid)  
3. AMS receives notification  
4. AMS:  
   * Validates repo naming  
   * Validates version format  
   * Links version to Service  
   * Sets status → Pending Validation  
   * Runs optional metadata checks  
5. If valid → Status \= Active

Merchant sees image appear in AMS Portal.

---

# **Important: Registry Is Not Public**

The Merchant:

* Cannot see other merchants’ images  
* Cannot browse registry  
* Only has scoped access to their service repo  
* Cannot push outside allowed namespace

Everything is controlled via scoped tokens.

---

# **From Merchant POV — It Feels Like Normal Docker**

That’s important.

From their perspective:

* Build  
* Login  
* Tag  
* Push

Nothing exotic.

The complexity lives entirely in AMS.

---

# **What If Merchant Pushes Wrong Tag?**

Example:

```
registry.ams.io/merchant123/other-service:latest
```

If token is scoped correctly:

Push fails immediately.

If not:

AMS rejects during validation phase.

---

# **Minimal MVP Flow Summary**

Merchant experience:

1. Register Image Service  
2. Receive push credentials  
3. docker login  
4. docker tag  
5. docker push  
6. See image version in AMS Portal

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH8AAAAoCAYAAADXNiVcAAADdUlEQVR4Xu2aT2oVQRDGB10JnkBIzNsmYF7cC4IInsYzeAQ3LgWXHkWyyxHciMYERARBRE0nr5JvvqnqqZnunjcT+wdFuv50zXR9/WaVpknkfLX+y8Y1lVuGJbYVr9wChojrravMnCGiI2P3VWZCDvHqJVgYItbZ6vA758ZSL8ACKClS/QrMlOtf+976HedyM+EFuMOBBfKUA1mZUIxrJnhm6O3tP6R2KuSdyr3XBCJECc8+3d+/z/FMeM/lHbK3Lgdln7Vt4YU5vIOTsoK0KfusHEPP1cPZRwaCxnHB8sfUemOcF7RYwNpjxfMwYOAm0iO1T8DZg4diGdYKXGPVWuuYH+znhb2nOK8R3IvG+fzkEG2L4nv8WI59bY21AsfZF7R+TIjdJd/TO50w7C+r9XOOB4YIOqQu1teKEzyQmB/Lsc85jFl7NF/AvVr+Q9ONcy37+bCG3SdSCrG+VpzggcT8WI59a30Ka85pPiI5T16rZT8fzmH3MnEfHkjMj+XYx/VL8GN7NB+R3GtObPjV2M8JaLE89A079isN4BfCW8txpC+/QMqJl0rfsFvC7j1+Yea69seqxTjTl18gyxU/oAibZNwf6csvjJLCp/f1DJvFSzXuj/TlK5fIpUqblWfYLF6KcW/GU1O5JH1OnmGzgCnGvRlPTSUTnmGzgCnGvRlPTdP+7GmfQI5LTosJnMOaN7DmvVwf7CSS47jAdZYJYf0E1poJHL8y57CzXQDuy3hqmvYhjmH9W8kL3cPf5NH/qORFfLG9TZx7icXE12xobSCsPeKj/7blh2Gf7R492xSasIhj7OvO0QPuy4Q6jinwIDjWl8eY/NVyEkPxkeD/AP9gE2PxhZgfy1k+i485q+9NTIShZAcWUvZwDOLHWrwPZ519oO5asGLyV8tJDD/7SIh9An9nE/s/xOdcbA/mLJx1ciA+IPsI1lj1lh8TX7M5iq/7zoFHL8q3h49WHBNi+xBvXdM+AB8O84xVr+WwxhL/XtOtDzYn8dFnGzT0ogx4Bz5cCaZ4xrZon23bFyA8+5X/X6xzC9P+NXT9JcNnYf+KbVyAkc/svnw6OJQS/bcJn0s/m4hxYZ85l5uRwldKU1IYuGBF+lcyUEKk3P0qhckhWImLVJmIseKN3VeZIV4xz3cPDzx1lQViXQIrXrmFoNhV9GXxDwzWXleFpZgnAAAAAElFTkSuQmCC>