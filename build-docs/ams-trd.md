# Ministry Of Programming TRD Template

![mop-logo.png][image1]

**Ministry Of Programming TRD** 

**AMS**

---

Version 0.1

February 20, 2026,

| Date | Ver. | Authors | Comments |
| :---: | :---: | :---: | :---: |
| 20/02/2026 | 0.1 | Adnan Bucalović | Initial version |

# Table of contents {#table-of-contents}

---

[**Table of contents	2**](#table-of-contents)

[**General information	4**](#general-information)

[**Document Purpose	4**](#document-purpose)

[**Overview	4**](#overview)

[**Technical summary	5**](#heading=h.j7d8ylsub0j3)

[**Acronyms and Abbreviations (Example)	5**](#acronyms-and-abbreviations-\(example\))

[**System overview	5**](#system-overview)

[**Current State of the System	5**](#current-state-of-the-system)

[**Target State of the System	6**](#target-state-of-the-system)

[**Functional Requirements	6**](#functional-requirements)

[**FR1: Authentication	6**](#fr1:-authentication)

[Overview	6](#overview-1)

[Consumer	7](#consumer)

[Design	7](#design)

[Acceptance Criteria	8](#acceptance-criteria)

[Open Questions	8](#open-questions)

[FR2: Merchant	8](#fr2:-merchant)

[FR2-MERCH-01: API Service configuration	8](#fr2-merch-01:-api-service-configuration)

[Overview	8](#overview-2)

[Service Configuration	8](#service-configuration)

[API-Specific Configuration	9](#api-specific-configuration)

[Service Metadata Requirements	9](#service-metadata-requirements)

[Design	9](#design-1)

[Acceptance Criteria	9](#acceptance-criteria-1)

[Open Questions	9](#open-questions-1)

[FR2-MERCH-02: Image Storage & Lifecycle Management	10](#fr2-merch-02:-image-storage-&-lifecycle-management)

[Overview	10](#overview-3)

[Image Service Onboarding	10](#heading=h.4subhvfujcjy)

[Standardized Image Publishing Process	10](#heading=h.862o0f82zf3c)

[Image Configuration & Management	10](#heading=h.2og9qwkizqbe)

[Design	11](#design-2)

[Acceptance Criteria	11](#acceptance-criteria-2)

[Open Questions	11](#open-questions-2)

[FR2-MERCH-03: Consumption	11](#fr2-merch-03:-consumption)

[Overview	11](#overview-4)

[Design	12](#design-3)

[Acceptance Criteria	12](#acceptance-criteria-3)

[Open Questions	12](#open-questions-3)

[FR2-MERCH-04: Invoicing	12](#fr2-merch-04:-invoicing)

[Overview	12](#overview-5)

[Design	13](#design-4)

[Acceptance Criteria	13](#acceptance-criteria-4)

[Open Questions	13](#open-questions-4)

[FR2-MERCH-05: Consumer Management & Monitoring	13](#fr2-merch-05:-consumer-management-&-monitoring)

[Overview	13](#overview-6)

[Design	14](#design-5)

[Acceptance Criteria	14](#acceptance-criteria-5)

[Open Questions	14](#open-questions-5)

[FR3: Consumer	14](#fr3:-consumer)

[FR3-CONS-01: Api Key Management	15](#fr3-cons-01:-api-key-management)

[Overview	15](#overview-7)

[Design	15](#design-6)

[Acceptance Criteria	16](#acceptance-criteria-6)

[Open Questions	16](#open-questions-6)

[FR3-CONS-02: Service overview	16](#fr3-cons-02:-service-overview)

[Overview	16](#overview-8)

[Design	16](#design-7)

[Acceptance Criteria	16](#acceptance-criteria-7)

[Open Questions	16](#open-questions-7)

[FR3-CONS-03: Usage overview	17](#fr3-cons-03:-usage-overview)

[Overview	17](#overview-9)

[Design	17](#design-8)

[Acceptance Criteria	17](#acceptance-criteria-8)

[Open Questions	17](#open-questions-8)

[FR3-CONS-04: Project & Teams	18](#fr3-cons-04:-project-&-teams)

[Overview	18](#overview-10)

[Design	18](#design-9)

[Acceptance Criteria	18](#acceptance-criteria-9)

[Open Questions	18](#open-questions-9)

[FR3-CONS-05: Image & container menagment	18](#fr3-cons-05:-image-&-container-menagment)

[Overview	19](#overview-11)

[Key Capabilities	19](#key-capabilities)

[Design	19](#design-10)

[Acceptance Criteria	19](#acceptance-criteria-10)

[Open Questions	19](#open-questions-10)

[FR4: Ahoy Admin	20](#fr4:-ahoy-admin)

[FR4-ADMIN-01: Merchant Management	20](#fr4-admin-01:-merchant-management)

[Overview	20](#overview-12)

[Design	20](#design-11)

[Acceptance Criteria	20](#acceptance-criteria-11)

[Open Questions	20](#open-questions-11)

[FR4-ADMIN-02: Consumer Management	20](#fr4-admin-02:-consumer-management)

[Overview	20](#overview-13)

[Design	20](#design-12)

[Acceptance Criteria	20](#acceptance-criteria-12)

[Open Questions	20](#open-questions-12)

[FR3-CONS-04: Project & Teams	20](#fr3-cons-04:-project-&-teams-1)

[Overview	21](#overview-14)

[Design	21](#design-13)

[Acceptance Criteria	21](#acceptance-criteria-13)

[Open Questions	21](#open-questions-13)

[**Non-Functional Requirements	21**](#non-functional-requirements)

[**NFR1-PERF-001: API Response Time for Content Retrieval	21**](#nfr1-perf-001:-api-response-time-for-content-retrieval)

[Overview	21](#overview-15)

[Design	21](#design-14)

[Acceptance Criteria	22](#acceptance-criteria-14)

[Open Questions	22](#open-questions-14)

[**Platform Infrastructure	23**](#platform-infrastructure)

[**Infrastructure Overview	23**](#infrastructure-overview)

[AWS Infrastructure	23](#aws-infrastructure)

[**Infrastructure Pricing	24**](#infrastructure-pricing)

[Amazon RDS	25](#amazon-rds)

[**Software Development Lifecycle (SDLC)	26**](#software-development-lifecycle-\(sdlc\))

[**Code repositories	26**](#code-repositories)

[**Environments	26**](#environments)

[**Continuous Integration (CI)	27**](#continuous-integration-\(ci\))

# **General information** {#general-information}

## **Document Purpose** {#document-purpose}

This document serves as the Technical Requirements Document (TRD) for the AMS platform, specifically addressing its MVP phase. It delineates the comprehensive technical specifications, architectural design, system constituents, and infrastructural prerequisites for the platform's development and deployment.

## **Overview** {#overview}

The **AMS (Application Management & Service) Platform** is a centralized service marketplace and management system that enables organizations to publish, distribute, monetize, and consume digital services in a controlled and observable manner.

The platform connects three primary roles:

* **Ahoy Administrators** – platform-level operators with full oversight and governance.

* **Merchants** – service providers who publish APIs, Docker images, and, in future phases, SDKs and packages.

* **Consumers (End Users)** – individuals or systems that discover, access, and use services provided through AMS.

### **Core Purpose**

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

This section will provide a high-level overview of the system with the [C4 model](https://c4model.com/). This model provides different levels of granularity starting from the most abstract (system context) to more detailed ones (container, component and code).

In this document, we will cover system context and system container diagrams without diving into component diagrams.

## **Current State of the System** {#current-state-of-the-system}

This section should describe the existing state of the system, module, or feature. If no prior system exists, this section should be excluded. If content is provided, it should include a context or container diagram, followed by a concise outline of the diagram's components and their explanations.

## **Target State of the System**  {#target-state-of-the-system}

This section should delineate the desired outcome of the system, module, or feature. It should encompass a context/container diagram, followed by a concise outline of the diagram's components. (If existing system components are being reused, detailed re-explanation of those components is not required.)

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

---

### **Acceptance Criteria** {#acceptance-criteria}

---

### **Open Questions** {#open-questions}

## **FR2: Merchant** {#fr2:-merchant}

A **Merchant** is a service provider that exists on the AMS platform.

Through AMS, Merchants provide various types of services, including:

* **APIs**  
* **Docker images**  
* In the future, **packages** and **SDKs**

Merchants manage, configure, and distribute their services entirely through AMS, while maintaining control over access, usage tracking, pricing, and service metadata.

## **FR2-MERCH-01: API Service configuration** {#fr2-merch-01:-api-service-configuration}

### **Overview** {#overview-2}

Merchants should be able to configure their APIs for platform access.

### **Service Configuration** {#service-configuration}

For each API, the Merchant should be able to:

* Define a usage pricing model (e.g., per request, per MB, etc.)  
* Configure the billing unit and pricing logic  
* Set usage limits (optional, depending on business rules)

### **API-Specific Configuration** {#api-specific-configuration}

For REST APIs, the Merchant should be able to configure:

* **Request tracing options:**

  * Request count  
  * Request payload size  
  * Response payload size

### **Service Metadata Requirements** {#service-metadata-requirements}

Each API added to the platform must include structured metadata to make it clear, discoverable, and usable for consumers. Required metadata includes:

* Service name  
* Service description (clear explanation of what the API does)  
* API base URL  
* Relevant documentation link  
* Version information  
* Usage and pricing model  
* Additional relevant information (e.g., rate limits, authentication method, supported formats, SLAs)

This information should be visible to End Users when browsing or requesting access to APIs.

---

### **Design** {#design-1}

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

### **Acceptance Criteria** {#acceptance-criteria-1}

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

#### **Key Design Principles:**

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

#### **Step 1 – Authorization**

AMS issues a **PAT (Personal Access Token)** or API key:

* Scoped to a **single Image Service**  
* Permission-controlled (push-only, versioned, revocable)  
* Time-bound (optional)

This token is:

* Associated with the Merchant  
* Linked to a specific service  
* Auditable and revocable

---

#### **Step 2 – Image Push**

For MVP, images are stored in **Azure Container Registry**.

However:

* The container registry **must not be publicly accessible**  
* End users must never pull images directly from the registry  
* All access must go through AMS validation logic

---

#### **Step 3 – Validation Pipeline (Handled by AMS)**

Upon image upload:

AMS triggers a validation workflow:

* Verify image signature (future enhancement)  
* Validate naming and tagging conventions  
* Check service association  
* Scan metadata (optional future: security scan)  
* Validate licensing model configuration

Only after validation:

* Image is marked as **Active**  
* It becomes eligible for consumer access

If validation fails:

* Image is marked as **Rejected**  
* Merchant receives feedback

---

**3\. Abstraction Layer for Registry**

Even though MVP uses **Azure Container Registry**, AMS must implement a **Registry Abstraction Layer**.

#### **Interface Example:**

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

---

### **Open Questions** {#open-questions-2}

## **FR2-MERCH-03: Consumption**  {#fr2-merch-03:-consumption}

### **Overview** {#overview-4}

Merchants should have a **consumption endpoint** provided from AMS side, to which they can send usage data.

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

### **Design** {#design-3}

---

### **Acceptance Criteria** {#acceptance-criteria-3}

---

### **Open Questions** {#open-questions-3}

## **FR2-MERCH-04: Invoicing** {#fr2-merch-04:-invoicing}

### **Overview** {#overview-5}

Merchants should have the ability to **generate invoices** based on usage of their services.

**Key Capabilities**

1. **Invoice Generation**

   * Generate invoices for a **specific consumer** or group of consumers.  
   * Include usage-based calculations according to the **service’s pricing model**.

2. **Consumption-Based Pricing**

   * Calculate total cost based on:

     * Number of API requests or image executions  
     * Payload size or resource usage  
     * Any other configurable usage metric

3. **Reporting**

   * Generate **usage reports** per consumer or per service.  
   * Reports should be **exportable** and sharable with consumers.  
   * Include historical data for monthly or custom billing periods.

4. **Forwarding to Consumers**

   * Allow Merchants to **send invoices and reports** to consumers directly.  
   * Include relevant metadata for transparency (service used, usage stats, pricing details).

---

### **Design** {#design-4}

---

### **Acceptance Criteria** {#acceptance-criteria-4}

---

### **Open Questions** {#open-questions-4}

## 

## 

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

---

### **Acceptance Criteria** {#acceptance-criteria-5}

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

Consumers should have full control over their **API keys** to access services on the AMS platform.

**Key Capabilities**

1. **Generate API Keys**  
   * Consumers can generate API keys to access one or multiple services.

2. **Service Access Configuration**  
   * Assign specific services to each API key.  
   * One API key can be configured to access **multiple services**.

3. **Time-to-Live (TTL) & Expiration**  
   * API keys can be assigned a **time-to-live** (expiration date/time).  
   * API keys automatically become invalid after the TTL expires.

4. **Disabling & Revoking Keys**  
   * Consumers can **disable or revoke** API keys at any time.

5. **Metadata & Description**  
   * Add metadata to each API key, such as **description, notes, or purpose**.  
   * Metadata helps consumers manage multiple keys efficiently.

---

### **Design** {#design-6}

---

### **Acceptance Criteria** {#acceptance-criteria-6}

---

### **Open Questions** {#open-questions-6}

## **FR3-CONS-02: Service overview** {#fr3-cons-02:-service-overview}

### **Overview** {#overview-8}

End Users should be able to **search and discover services** available on the AMS platform and request access as needed.

**Key Capabilities**

1. **Service Discovery**  
   * Search for available services provided by Merchants.  
   * Filter and browse services based on type (API, Docker image, etc.), category, or metadata.

2. **Access Requests**  
   * Request access to a selected service.  
   * Generate **API keys** or configure other access credentials as required.

---

### **Design** {#design-7}

---

### **Acceptance Criteria** {#acceptance-criteria-7}

---

### **Open Questions** {#open-questions-7}

## 

## **FR3-CONS-03: Usage overview** {#fr3-cons-03:-usage-overview}

### **Overview** {#overview-9}

End Users should have access to a **usage dashboard** that provides clear visibility into their service consumption and spending.

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

---

### **Acceptance Criteria** {#acceptance-criteria-8}

---

### **Open Questions** {#open-questions-8}

## 

## **FR3-CONS-04: Project & Teams**  {#fr3-cons-04:-project-&-teams}

### **Overview** {#overview-10}

End Users should be able to create **logical groupings** for collaboration, such as **teams or projects**, within the AMS platform.

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

---

### **Acceptance Criteria** {#acceptance-criteria-9}

---

### **Open Questions** {#open-questions-9}

## **FR3-CONS-05: Image & container menagment** {#fr3-cons-05:-image-&-container-menagment}

### **Overview** {#overview-11}

End Users should be able to **pull and use Docker images** provided on the AMS platform, with proper access controls based on the image type.

### **Key Capabilities** {#key-capabilities}

1. **Image Discovery & Categorization**  
   * Browse and search Docker images by **category**, service type, or metadata.  
   * Images should include relevant descriptions, version information, and usage instructions.

2. **Access Control**  
   * For images that require **internet access**, the container must present a **valid API key** at startup.  
   * For offline or time-limited images, the platform should enforce **time-to-live (TTL) configurations** to control access duration.

3. **Image Pulling & Updates**  
   * End Users can pull images to their environment or workspace.  
   * Refresh API keys for images when necessary (e.g., when keys expire or are rotated).

4. **Usage & Licensing Compliance**  
   * Ensure that each pulled image respects the **merchant-defined licensing model**, including usage limits, TTL, and access rights.  
   * Track image usage for reporting, billing, and auditing purposes.

5. **Integration with Teams / Projects**  
   * Assign pulled images to specific **teams or projects**, with controlled access per team member.

---

### **Design** {#design-10}

---

### **Acceptance Criteria** {#acceptance-criteria-10}

---

### **Open Questions** {#open-questions-10}

## **FR4: Ahoy Admin** {#fr4:-ahoy-admin}

## **FR4-ADMIN-01: Merchant Management** {#fr4-admin-01:-merchant-management}

### **Overview** {#overview-12}

---

### **Design** {#design-11}

---

### **Acceptance Criteria** {#acceptance-criteria-11}

---

### **Open Questions** {#open-questions-11}

## **FR4-ADMIN-02: Consumer Management** {#fr4-admin-02:-consumer-management}

### **Overview** {#overview-13}

---

### **Design** {#design-12}

---

### **Acceptance Criteria** {#acceptance-criteria-12}

---

### **Open Questions** {#open-questions-12}

## **FR3-CONS-04: Project & Teams**  {#fr3-cons-04:-project-&-teams-1}

### **Overview** {#overview-14}

---

### **Design** {#design-13}

---

### **Acceptance Criteria** {#acceptance-criteria-13}

---

### **Open Questions** {#open-questions-13}

# 

# **Non-Functional Requirements** {#non-functional-requirements}

Non-functional requirements for all systems, modules, and features needed to complete the target phases of this document.

They should adhere to the same format as functional requirements. 

## **NFR1-PERF-001: API Response Time for Content Retrieval** {#nfr1-perf-001:-api-response-time-for-content-retrieval}

### **Overview** {#overview-15}

This non-functional requirement specifies the maximum acceptable response time for API requests that retrieve content from the CMS, ensuring a responsive experience for consuming applications.

---

### **Design** {#design-14}

To meet this requirement, the system design will incorporate several elements:

* **Efficient Database Indexing:** Critical fields in content types will be properly indexed to optimize query performance.  
* **Caching Mechanism:** A caching layer (e.g., Redis) will be implemented for frequently accessed content to reduce direct database hits.  
* **Optimized API Endpoints:** API endpoints for content retrieval will be designed to minimize data transfer and processing overhead.  
* **Content Delivery Network (CDN):** For publicly accessible content, a CDN will be used to cache and deliver content closer to the end-users.

---

### **Acceptance Criteria** {#acceptance-criteria-14}

* GIVEN an authenticated API request for a single content entry (e.g., /api/articles/123), WHEN executed under normal load (e.g., 100 concurrent requests per second), THEN the **response time shall not exceed 200 milliseconds** for 95% of requests.  
* GIVEN an authenticated API request for a collection of content entries (e.g., /api/articles?limit=10\&page=1), WHEN executed under normal load (e.g., 50 concurrent requests per second), THEN the **response time shall not exceed 500 milliseconds** for 90% of requests.  
* GIVEN the CMS is serving content via a CDN, WHEN a static asset (e.g., an image) is requested, THEN its **delivery time shall not exceed 100 milliseconds** for 99% of requests globally.

---

### **Open Questions** {#open-questions-14}

* What defines "normal load" quantitatively for each type of content retrieval (e.g., specific RPS figures for single vs. collection)?  
* Are there specific geographical regions where performance is more critical?  
* What tools will be used for performance monitoring and load testing to verify this NFR?  
* Should separate performance targets be set for cached vs. uncached content retrieval?

# 

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