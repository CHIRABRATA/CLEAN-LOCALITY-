<div align="center">

# 🚀 CivicPulse
### AI-Powered Community Issue Resolution Platform

Turning citizen voices into actionable governance ⚡

[🌐 Live Demo](https://helping-2hand.netlify.app/#/)

<br/>

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Google_Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white" />

</div>

---

# 🧠 Overview

**CivicPulse** is a hyperlocal civic-tech platform that connects **citizens and authorities** through a transparent issue reporting and verification system.

Instead of just allowing complaints, CivicPulse creates a complete accountability loop:

- 🟥 Citizens report issues
- 🟧 Authorities take action
- 🟩 Public verifies resolution

This prevents fake “resolved” claims and builds trust between citizens and governance systems.

---

# 💡 Problem We Solve

Traditional civic complaint systems often suffer from:

- ❌ Fake resolved statuses
- ❌ No transparency
- ❌ Duplicate complaints
- ❌ Low citizen engagement
- ❌ Poor prioritization

CivicPulse solves this using community validation + hyperlocal governance.

---

# 🚀 Key Features

## 👥 Citizen Layer

- 📸 Upload issues with images
- 👍 Upvote important problems
- 📍 View issues within 5 km radius
- ✅ Approve or reject resolved issues

---

## 🏛️ Authority Layer

- 🗺️ Map-based issue tracking
- 🎯 Priority-driven dashboard
- ✔️ Mark issues as resolved
- 📊 Community feedback visibility

---

## 🤖 AI Integration

### 🔍 Image Similarity Detection

- Detect duplicate complaints
- Reduce spam reports
- Cluster similar issues automatically

### 🚀 Planned AI Features

- Severity prediction
- Auto-tagging using image + text
- Smart recommendations for authorities
- Area-wise analytics

---

# 🌍 Hyperlocal Governance

- 📍 Google Maps API integration
- 🎯 5 km radius-based issue visibility
- ⚡ Localized civic issue management

This ensures authorities focus only on nearby and relevant issues.

---
<div align="center">
✅ Transparency	✅ Accountability	✅ Civic Engagement
Public verification system	Reduces fake resolutions	Encourages community participation
</div>


# 🧱 System Architecture

```mermaid

graph TD

A[📸 Citizen Uploads Issue] --> B[🗂️ Supabase Storage]
A --> C[(🛢️ PostgreSQL Database)]

C --> D[👍 Upvote Engine]
C --> E[🤖 AI Duplicate Detection]

D --> F[🎯 Priority System]
E --> F

F --> G[🏛️ Authority Dashboard]

G --> H[✔️ Mark as Resolved]

H --> I[👥 Public Verification]

I --> J{Verified?}

J -->|✅ Yes| K[Issue Closed]
J -->|❌ No| L[Issue Reopened]
