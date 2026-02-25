# Power121 - 1:1 Round Robin & Mesh Scheduler

Power121 is a frontend-only React application to generate and schedule 1-on-1 meetings with automatic Google Meet integration.

## Features

*   **Scheduling Modes:**
    *   **Quick Pair:** Pair everyone up once in a single time slot (Parallel meetings).
    *   **Round Robin:** Generate a tournament-style schedule where everyone meets everyone (Mesh Topology), spread across sequential time slots.
*   **Google Integration:**
    *   Sign in with Google.
    *   Automatically creates Calendar events on your primary calendar.
    *   Adds Google Meet conference links to every event.
    *   Sends email invites to all participants.
*   **Flexible Input:**
    *   Paste CSV data or upload a CSV file.
    *   Supports `Name, Email` or `Name <email>` formats.
*   **Privacy Focused:**
    *   Client-side logic only. No backend server stores your data.

## Prerequisites

*   Node.js (v18 or later recommended)
*   A Google Cloud Project with Calendar API enabled.

## Setup Guide

### 1. Google Cloud Setup

To allow the app to create meetings on your behalf, you need a Google Cloud Client ID.

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  Navigate to **APIs & Services > Library** and enable **Google Calendar API**.
4.  Navigate to **APIs & Services > OAuth consent screen**.
    *   Select **External** (or Internal if you have a Workspace).
    *   Fill in required fields.
    *   Add Scopes: `.../auth/calendar.events`, `email`, `profile`.
    *   Add Test Users (if External and in Testing mode).
5.  Navigate to **APIs & Services > Credentials**.
    *   Click **Create Credentials > OAuth client ID**.
    *   Application type: **Web application**.
    *   **Authorized JavaScript origins**: Add `http://localhost:5173` (or your production URL).
    *   Click Create and copy the **Client ID**.

### 2. Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

### 3. Configuration

Create a `.env` file in the root directory (copy from example if available, or just create new):

```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

*Alternatively, you can enter the Client ID directly in the application UI settings panel.*

### 4. Running the App

Start the development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Usage

1.  **Add Participants:** Paste a list of names and emails (e.g., `John Doe, john@example.com`) or upload a CSV file.
2.  **Configure:**
    *   Select **Mode** (Quick Pair or Round Robin).
    *   Set **Start** and **End** dates. The scheduler will try to fit meetings within this window.
3.  **Generate:** Click "Generate Preview" to see the proposed schedule.
4.  **Sign In:** Click "Sign in with Google" (top right) to authorize Calendar access.
5.  **Send Invites:** Click "Schedule & Send Invites". The app will create events one by one.

## Troubleshooting

*   **"Origin not allowed" error:** Ensure `http://localhost:5173` is added to "Authorized JavaScript origins" in your Google Cloud Console Credentials.
*   **"Popup blocked":** Allow popups for the sign-in window.
*   **Rate Limits:** The app adds a small delay between requests to avoid hitting Google API rate limits.

## Built With

*   React + Vite
*   Tailwind CSS
*   Google Identity Services (GIS) & GAPI
*   date-fns
*   PapaParse
