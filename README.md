# RAPID-RELIEF: Disaster Resource Relief Allocator

## 📖 Overview
RAPID-RELIEF is a centralized, intelligent platform designed to **optimize disaster relief resource allocation** during emergencies such as floods, earthquakes, cyclones, and landslides.  

The system integrates **AI triage, GIS mapping, and automated allocation algorithms** to minimize delays, reduce duplication of efforts, and improve fairness and transparency in aid distribution.  

It connects **citizens, NGOs, and administrators** through role-based web interfaces, real-time disaster mapping, and AI-driven decision support.

---

## 🎯 Motivation
During large-scale disasters, traditional relief efforts often suffer from:
- Fragmented reporting and duplicate requests  
- Lack of real-time coordination between agencies  
- Delays in allocation and delivery of resources  
- Missing aid in critical severity zones  

RAPID-RELIEF was built to:
- Aggregate SOS needs in real time  
- Verify and prioritize urgent requests  
- Match verified requests with capable NGOs/resources  
- Provide transparent tracking and delivery confirmations  

---

## 🚨 Problem Statement
The absence of a **centralized, intelligent relief coordination system** results in:
- Chaotic allocation and duplication of efforts  
- Delays or missing aid in critical areas  
- Poor situational awareness for responders and administrators  

---

## 🎯 Objectives
**Primary Objective**:  
To build a **smart, centralized platform** for quick, fair, and organized distribution of disaster relief materials.  

**Functional Objectives**:
- Real-time mapping of disaster zones  
- Citizen SOS submission (form + AI chatbot)  
- NGO dashboards for inventory & request management  
- Admin verification workflows  
- Automated resource allocator  
- Notifications & alerts  
- Analytics and public transparency portal  

**Non-Functional Objectives**:
- Low latency (<5s allocation)  
- High availability (99% uptime)  
- Secure role-based access  
- Offline resilience for poor connectivity  

---

## 📍 Scope & Applications
**In Scope**
- Single-incident disasters (floods, earthquakes, landslides, cyclones)  
- NGO and volunteer coordination  
- Resources: food, shelter, medicine, rescue, blankets, water, clothing  

**Applications**
- NGO collaboration & coordination  
- Municipal disaster response (Smart Cities)  
- Refugee/migrant aid operations  
- Rapid first-responder support in urban & rural zones  

---

## 🏗️ System Architecture
- **Citizen Interface**: SOS forms, AI chatbot, disaster maps  
- **NGO Dashboard**: inventory updates, request acceptance, delivery tracking  
- **Admin Panel**: NGO verification, SOS validation, monitoring, analytics  
- **Backend Engine**: AI triage, resource allocator, GIS modules, REST APIs  
- **Database**: citizen/NGO records, SOS logs, inventory  
- **Notifications**: SMS, email, push alerts  
- **Analytics & Monitoring**: dashboards, KPIs, heatmaps, audit logs  
- **Security**: OAuth 2.0, TLS, role-based access  

---


## 🛠️ Tech Stack
**Frontend**
- HTML5, CSS3, JavaScript  
- Leaflet.js (disaster maps)  
- Chart.js (analytics)  
- Formspree (SOS collection)  

**Backend**
- Python (Flask framework)  
- SQL Database (MySQL/PostgreSQL)  
- RESTful APIs  

**Security**
- OAuth 2.0 Authentication  
- TLS Encryption  
- Immutable audit logs  

**Deployment**
- Google Cloud Platform (VM + Cloud SQL)  
- Nginx reverse proxy  

---

## 🧪 Requirements

**Hardware**
- Smartphones/PCs with GPS & internet  
- Server: 4 vCPU, 8–16 GB RAM, 100 GB SSD, 1 Gbps NIC  

**Software**
- Flask (Python)  
- SQL (MySQL/PostgreSQL)  
- Leaflet.js, Chart.js, Formspree  
- OAuth 2.0 authentication  

---

## 🧑‍💻 Installation & Setup

Follow these steps to get RAPID-RELIEF running locally.

---

```bash
git clone https://github.com/JaiDhuria/rapid-relief.git
cd rapid-relief

 Backend Setup
**Create and Activate a Virtual Environment**
python -m venv venv
# Activate the virtual environment
# Linux/macOS
source venv/bin/activate
# Windows (PowerShell)
venv\Scripts\activate

 Install Dependencies
**pip install -r requirements.txt**

Set Environment Variables
# Linux/macOS
export FLASK_APP=app.py
export FLASK_ENV=development
# Windows (PowerShell)
$env:FLASK_APP = "app.py"
$env:FLASK_ENV = "development"


Initialize Database
 flask db init
flask db migrate -m "Initial migration"
flask db upgrade


Run Flask Server
flask run
# or
python app.py

Frontend Setup

# Using Python HTTP server
python -m http.server 8000

**
