# Anchorpoint — Job Portal (Java + React + MySQL)

A fullstack job portal: employers post jobs and review applicants, candidates
search jobs and track their applications.

**Stack**
- Backend: Spring Boot 3, Spring Security (JWT), Spring Data JPA / Hibernate
- Database: MySQL
- Frontend: React 18 + Vite, React Router, Axios

```
job-portal/
├── backend/    Spring Boot API (port 4000)
└── frontend/   React app (port 5173)
```

---

## 1. Prerequisites

Install these before you start:

| Tool | Version | Check with |
|---|---|---|
| Java JDK | 17+ | `java -version` |
| Maven | 3.9+ (or use the included `mvnw` if present) | `mvn -version` |
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| MySQL Server | 8.x | `mysql --version` |

If you don't want to install MySQL locally, you can run it in Docker instead (see step 2b).

---

## 2. Set up the database

### 2a. Using a local MySQL install
Start MySQL, then log in and create the database (the app can also auto-create it, but
creating it yourself avoids permission surprises):

```bash
mysql -u root -p
```

```sql
CREATE DATABASE job_portal;
EXIT;
```

### 2b. Or using Docker (no local MySQL install needed)
```bash
docker run --name job-portal-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=job_portal \
  -p 3306:3306 -d mysql:8
```

### Set your credentials
Open `backend/src/main/resources/application.properties` and update these two lines
to match your MySQL username/password:

```properties
spring.datasource.username=root
spring.datasource.password=root
```

You don't need to create any tables by hand — Hibernate creates/updates them
automatically on startup (`spring.jpa.hibernate.ddl-auto=update`).

---

## 3. Run the backend

```bash
cd backend
mvn spring-boot:run
```

Wait for a log line like `Started JobPortalApplication in X seconds`.
The API is now live at **http://localhost:4000**.

To sanity-check it's up:
```bash
curl http://localhost:4000/api/jobs
```
You should get back `[]` (an empty list, since no jobs exist yet).

**Common issues**
- `Communications link failure` → MySQL isn't running, or the port/credentials in
  `application.properties` are wrong.
- `Access denied for user` → fix `spring.datasource.username` / `password`.
- Port 4000 already in use → change `server.port` in `application.properties`.

---

## 4. Run the frontend

Open a **new terminal window** (keep the backend running in the first one):

```bash
cd frontend
npm install
npm run dev
```

Vite will print a local URL, typically **http://localhost:5173**. Open it in your browser.

The frontend is already configured to call the backend at `http://localhost:4000/api`
(see `frontend/src/api/axios.js`) — no extra config needed if you kept the default ports.

---

## 5. Try it out

1. Go to **http://localhost:5173** → you'll land on the job listings page.
2. Click **Sign up**, choose **"I'm hiring"**, and create an employer account.
3. Once logged in, click **Post a job** and fill in the details.
4. Log out, sign up again with **"I'm looking for a job"** to create a candidate account.
5. Browse jobs, open the one you posted, and submit an application with a cover letter.
6. Log back in as the employer → **My postings** → click the job → see the applicant
   and change their status (Applied / Shortlisted / Rejected / Hired).
7. Log back in as the candidate → **My applications** → see the status update live.

---

## 6. Project structure (backend)

```
backend/src/main/java/com/jobportal/
├── config/          SecurityConfig, GlobalExceptionHandler
├── controller/       AuthController, JobController, ApplicationController
├── dto/              Request/response objects
├── model/            User, Job, Application (JPA entities) + enums
├── repository/       Spring Data JPA repositories
├── security/         JwtUtil, JwtAuthFilter
└── service/           AuthService, JobService, ApplicationService, UserDetailsServiceImpl
```

### Key API endpoints

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an account (CANDIDATE or EMPLOYER) |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| GET | `/api/jobs?keyword=&location=&experience=` | No | Search/browse active jobs. `experience` (years) returns only jobs whose experience range fits that value |
| GET | `/api/jobs/{id}` | No | Job details |
| POST | `/api/jobs` | Employer | Post a new job (now includes `minExperienceYears` / `maxExperienceYears`) |
| GET | `/api/jobs/mine` | Employer | List your own postings |
| DELETE | `/api/jobs/{id}` | Employer (owner) | Close a job posting |
| POST | `/api/applications` (multipart/form-data: `jobId`, `coverLetter`, `resume`) | Candidate | Apply to a job with an attached resume (PDF/DOC/DOCX, max 5MB) |
| GET | `/api/applications/mine` | Candidate | Your application history |
| GET | `/api/applications/job/{jobId}` | Employer (owner) | Applicants for a job |
| GET | `/api/applications/{id}/resume` | Candidate (own) or Employer (owner) | Download the attached resume |
| PUT | `/api/applications/{id}/status` | Employer (owner) | Update applicant status |

Send the JWT from login/register as `Authorization: Bearer <token>` on protected calls.

Resumes are stored on disk under `backend/uploads/resumes` (configurable via
`app.upload.dir` in `application.properties`) — this folder is git-ignored and
created automatically on first upload.

---
