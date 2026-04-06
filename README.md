# 🏋️ IFRMS — Integrated Fitness & Resource Management System

> A web application to manage gym memberships, resources, staff, and fitness tracking — built as a DBMS course project.

---

## 📖 About the Project

This project was developed as a **team project for the DBMS (CS2011E) course** at the **National Institute of Technology Calicut (NITC)**, under the guidance of **Dr. A. Sudarshan Chakravarthy**.

### 💡 The Inspiration

The idea came from a real problem faced by some of our gym-going friends — including one of our own team members. At our college gym, members are required to **physically visit the gym every month just to renew their membership**, and all money transactions are recorded manually in a notebook. There's no digital record, no convenience, and no accountability.

We decided to take on this problem as our DBMS project and build a dedicated web application to address it.

> **Note:** The current version of IFRMS focuses on **membership management and resource management** only. It is not a complete solution to the problem we described. We are planning to integrate **online payment for membership renewal** directly within the application in a future version.

---

## 🎯 Aim

To design and develop a **complete, working web application** dedicated to managing:
- Gym resources (equipment, scheduling)
- Customer memberships and fitness tracking
- Staff (trainers and admins)

---

## 👥 Team

**Group:** DBCREW — DBMS Course Project

 K.D. Karun Lakshman, 
 N. Jatin,
 A.N.S. Thanush Reddy, 
 J. Manish Reddy,

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js |
| Backend | Node.js + Express |
| Database | PostgreSQL/MYSQL |
| Auth | JWT (JSON Web Tokens) |
| Payments *(planned)* | Stripe / PayPal |

---

## ✨ Features

### Member
- Register and log in securely
- View and update profile
- Enroll in fitness programs
- View assigned workout plans
- Track fitness progress

### Trainer
- Create and assign workout plans to members
- Record and monitor member progress
- Schedule training sessions

### Admin
- Manage gym equipment and maintenance status
- Assign trainers to members
- Generate reports on facility usage and member activity

---

## 📁 Project Structure

```
IFRMS/
├── README.md
├── docs/
│   ├── SRS.pdf                  # Software Requirements Specification
│   ├── SDD.docx                 # System Design Document
│   └── ER_Diagram.drawio        # Chen's ER Diagram
├── code_base/
    ├── frontend/                    # Next.js app
    └── backend/                     # Node.js + Express API
└── database/
    └── schema.sql               # PostgreSQL schema
```

## 📄 Documentation

All project documentation is available in the [`docs/`](./docs) folder:

- 📋 [Software Requirements Specification (SRS)](./docs/SRS.pdf)
- 🏗️ [System Design Document (SDD)](./docs/SDD.docx)
- 🗂️ [ER Diagram (Chen's Notation)](./docs/ER_Diagram.drawio)

---

---

## 🗺️ Roadmap

- [x] SRS Documentation
- [x] System Design Document
- [x] ER Diagram
- [x] Database schema (PostgreSQL)
- [x] Backend REST API
- [x] Frontend UI
- [x] Member registration & login
- [x] Trainer & admin dashboards
- [x] Equipment management module
- [x] Progress tracking module
- [ ] Report generation
- [ ] **Online payment for membership renewal** *(planned for v2.0)*
 
---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone  https://github.com/Karunlk/IFRMS
   cd IFRMS
   ```

2. **Set up the database**
   ```bash
   psql -U postgres -f database/schema.sql
   ```
   also read the read me file for other .sql files

3. **Configure environment variables**

  Update  `.env` file in the `ifrmsweb/` directory:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ifrms
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. **Install and run the website**
   ```bash
   cd ifrmsweb
   npm install
   npm run dev
   ```
5. Open your browser at `http://localhost:3000`

---

---

## 📜 License

This project is developed for academic purposes as part of the DBMS course (CS2011E) at NIT Calicut.
This is licensed under MIT license.
---

> *"Built to solve a real problem, one query at a time."* 💪
