# HMIS — Basic Hospital Management (Node.js + MySQL)

A small hospital management web app built for a student capstone. It keeps things simple: login, patients, appointments, and billing. Plain HTML/CSS/JS on the frontend, Express + MySQL on the backend.

## Stack
- Frontend: HTML, CSS, vanilla JS
- Backend: Node.js (Express)
- Database: MySQL
- Auth: JSON Web Tokens (JWT), bcrypt

## What’s inside
- Login (JWT), basic roles (admin/doctor/receptionist/pharmacist)
- Patients: add/search/edit/delete
- Appointments: create, list, mark completed/cancelled
- Billing: create bill with line items, mark as paid, view items
- Minimal UI (no frameworks), no code comments

## Quick start

**Prereqs**: Node 18+, MySQL

1. Clone and enter the project:
   ```bash
   git clone https://github.com/<your-username>/HMIS.git
   cd HMIS
