# Job Tracker Hub

Job Tracker Hub is **not a job board**. It does not list openings or help you find a job.

It is a hub for logging jobs you already applied to and tracking what happens next. Applicants keep every application in one place. Recruiters who are coaching them can follow the same record, add private notes, and stay aligned without spreadsheets.

## Who it is for

**Applicants** record each role they applied to: where they found it, the posting link, who they spoke with, which resume they sent, and the current status. They can archive closed roles, update a profile, and connect to a recruiter with a shareable recruiter ID.

**Recruiters** follow assigned candidates’ application history, review a timeline of activity, leave internal notes that the applicant never sees, and keep account settings (recruiter ID, sessions, profile) in one console.

## What you can do

### Applicants

- Sign up, verify email, and sign in (optional remember-this-device checkbox)
- See what needs attention today (interviews, assessments, offers)
- Add or edit an application with date applied, organization, location, phone, contact, position, notes, status, source, posting URL, resume, and cover letter
- Open a full-screen timeline of that application’s journey
- Archive applications that are no longer active
- Link to a recruiter from the profile page using their ID

### Recruiters

- Share a recruiter ID so applicants can connect
- View follow-ups, upcoming interviews, and quick actions
- Browse managed applicants on desktop as a table and on mobile as cards
- Open an applicant’s profile (journey, fit, experience, relationship timeline)
- Open a specific logged application and add internal notes
- Manage profile, password, and active sessions

## Application statuses

Planning → Applied → Screening → Assessment → Interview → Offer, plus Rejected, Withdrawn, and Archived.

## Data

- **MongoDB** database: `jobtrackerhub` (includes an existing `user` collection)
- **Cloudinary** root folder: `jobtrackerhub`
- Application files are stored as `jobtrackerhub/{person-name}/{jobtitle-dd-mm-yyyy}`  
  Example: `jobtrackerhub/alex-johnson/customerservice-18-08-2026`

## Stack

- Next.js, React, TypeScript
- Tailwind CSS and DaisyUI
- MongoDB Atlas with Mongoose
- Auth.js for sign-in
- Cloudinary for documents
- Resend for email

Authentication is wired to MongoDB. Application records in the UI still use mock data until that layer is connected.

## Local setup

```bash
npm install
```

Copy `.env.example` to `.env` and fill in MongoDB Atlas, Cloudinary, Resend, and `AUTH_SECRET`. Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
