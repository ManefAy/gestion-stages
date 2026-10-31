
# DevTec — Système de Gestion des Stages

Web application for managing internships at DevTec: project catalogue, online applications,
automatic ranking by score, mentors, and internship agreements (conventions).

Academic project — Génie Logiciel, FSEGS (2026/2027).

## Features (by actor)

| Actor          | Features                                                                   |
| -------------- | -------------------------------------------------------------------------- |
| Candidat       | Browse the catalogue, submit an application                                |
| Administrateur | Manage accounts and roles                                                  |
| Mentor         | Manage projects: objectives, weighted skills, tasks                        |
| Service RH     | Rank applications by score, manage mentors, generate and print conventions |

Role-based access: each actor only sees their own use cases.

## Tech stack

- **Frontend:** React (Vite), React Router, Lucide icons
- **Backend:** Spring Boot *(coming soon)*

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173

## Demo accounts (fake data, frontend only)

| Role           | Login      | Password  |
| -------------- | ---------- | --------- |
| Administrateur | admin      | admin123  |
| Service RH     | a.trabelsi | rh123     |
| Mentor         | a.karray   | mentor123 |
