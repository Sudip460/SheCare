# SheCare AI

Full-stack women&apos;s health assistant with Firebase Auth, Firestore-scoped sessions, Firebase Storage uploads, Flask analysis endpoints, and reportlab PDF generation.

## Local Setup

1. Copy `.env.example` to `.env` and fill in Firebase web app values.
2. Install frontend dependencies:

```bash
npm install
```

3. Install backend dependencies:

```bash
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

4. Start Flask:

```bash
cd server
python app.py
```

5. Start React:

```bash
npm run dev
```

The app runs at `http://localhost:5173` and the API at `http://localhost:5000`.

## Gemini Assistant

The left-side SheCare assistant can use the Gemini API for more natural, conversational replies while still grounding answers in the user's latest PCOS assessment result.

Add these environment variables before starting Flask:

```bash
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

If `GEMINI_API_KEY` is missing, the assistant falls back to a simple rule-based reply mode.

## Firebase

Enable Email/Password Authentication in Firebase. Deploy `firestore.rules` and `storage.rules` so each authenticated user can only read and write paths under `users/{uid}`.

If local file uploads fail with a Firebase Storage CORS or preflight error from `http://localhost:5173`, apply the included [cors.json](/d:/programmingCode/vs%20code/Full%20Stack/sheCare/SheCare/cors.json:1) to your bucket:

```bash
gcloud storage buckets update gs://shecare-8015f.appspot.com --cors-file=cors.json
```

or:

```bash
gsutil cors set cors.json gs://shecare-8015f.appspot.com
```

Make sure Firebase Storage is enabled for the project, the correct bucket is configured, and your app user is signed in before uploading reports.

For local development, report uploads go through the Flask backend and are stored under:

```text
server/uploaded_reports/{uid}/
```

The backend exposes them at:

```text
/uploads/{uid}/{filename}
```

If you later want browser-direct Firebase uploads in production, keep the Storage bucket configured and CORS-enabled.

Historical Firebase upload path used by the app:

```text
users/{uid}/reports/
```

Assessment sessions are stored at:

```text
users/{uid}/sessions/{sessionId}
```

Doctor profiles are manually managed by your team. Create a Firebase Auth user for the doctor, then create:

```text
users/{doctorAuthUid}
```

with:

```json
{
  "profile": {
    "email": "doctor@example.com",
    "role": "doctor",
    "displayName": "Dr. Example",
    "doctorId": "dr-example"
  }
}
```

Then create the public selectable doctor profile:

```text
doctors/dr-example
```

with:

```json
{
  "name": "Dr. Example",
  "specialty": "Gynecologist and PCOS care",
  "city": "Bengaluru",
  "rating": 4.9,
  "experience": "12 years",
  "bio": "Cycle health and PCOS care"
}
```

Patients who request consultancy store:

```text
users/{patientUid}.profile.doctorId
users/{patientUid}.profile.doctorStatus
```

`doctorStatus` is `pending`, `accepted`, `rejected`, or `none`. Doctors see pending requests first, and accepted patients only appear in the doctor dashboard/history. Doctors can read reports and sessions only after accepting the patient.

## Backend Notes

`POST /chat` uses a deterministic state machine. `POST /analyze` performs basic scoring for irregular cycles, symptoms, stress, and sleep. `POST /generate-report` creates a PDF report in `generated_reports/` and returns a local download URL.

For optional Firebase Admin writes from Flask, provide a service account JSON at `server/serviceAccountKey.json` or set `GOOGLE_APPLICATION_CREDENTIALS`.

## Medical Disclaimer

This MVP provides educational guidance only. It is not a diagnosis or replacement for care from a qualified clinician.
