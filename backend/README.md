# VyapaarMitra AI - Backend

This is the Express.js backend for the VyapaarMitra AI hackathon MVP.

## Setup Instructions

1. Ensure you have Node.js installed.
2. Navigate to this `backend` directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   node server.js
   ```

The server will start on `http://localhost:3000`.

## API Endpoints

- `GET /` - Health check. Returns "VyapaarMitra Backend Running".
- `POST /analyze-business` - Takes `{ businessType, turnover, state }` and returns compliance score, risk level, checklist, schemes, and deadlines.
- `POST /ask-ai` - Takes `{ question }` and returns simulated AI response.
- `GET /consultants` - Returns a list of verified compliance consultants.
- `POST /book-consultant` - Takes `{ consultantId, date, time }` and returns a booking confirmation.
