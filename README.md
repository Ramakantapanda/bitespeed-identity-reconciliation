# Bitespeed Backend Task: Identity Reconciliation

This is a web service that implements the Identity Reconciliation task. It exposes a single endpoint `/identify` that allows compiling distinct orders with overlapping contact information into a single customer profile.

## Tech Stack
- **Node.js**: Backend JavaScript runtime
- **Express**: Fast, unopinionated web framework
- **TypeScript**: Static typing for JavaScript
- **Prisma**: Next-generation ORM for Node.js and TypeScript
- **SQLite**: Lightweight database (easy to set up; configurable as needed)

## Requirements to Run
- Node.js (>= 18.x)
- npm (Node Package Manager)

## Setup & Run Local Server

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   This project uses SQLite for simplicity and no external database dependencies. Initialize it by running:
   ```bash
   npx prisma db push
   ```

3. **Run the Application**

   *For development (auto-reloading):*
   ```bash
   npm run dev
   ```

   *For production build:*
   ```bash
   npm run build
   npm start
   ```

By default, the application runs on **http://localhost:3000**

## API Endpoint Reference

### `POST /identify`

Consolidates contact entries based on matching `email` or `phoneNumber`.

**Request Body Example:**
```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
```

**Response Body Example:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": [
      "lorraine@hillvalley.edu",
      "mcfly@hillvalley.edu"
    ],
    "phoneNumbers": [
      "123456"
    ],
    "secondaryContactIds": [
      23
    ]
  }
}
```

## Hosted Live URL
*(Please deploy this project to platforms like Render, Railway, or Heroku, and place the live URL here)*
Live URL: **[YOUR_DEPLOYED_APP_URL_HERE]/identify**

## Further Information
- The `linkedId` tracks primary relationships logically to build a unified data cluster.
- The `linkPrecedence` defines the hierarchy where `primary` nodes unify the different instances of a user identity, and `secondary` nodes signify distinct but linked identities.
