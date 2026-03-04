# Bitespeed Backend Task: Identity Reconciliation

This project is a REST web service built using **Node.js, Express, TypeScript, and Prisma (SQLite)** to tackle the "Identity Reconciliation" challenge.

## Project Explanation
E-commerce stores often have customers who check out using different combinations of emails and phone numbers across various orders. The goal of this application is to act as a backend service that seamlessly connects these separate purchases into a single unified customer profile by identifying overlapping contact information.

When a request comes in:
1. **New Customer**: If no records match, a new `primary` contact is created.
2. **Existing Customer (No New Data)**: If the contact info exactly matches what is on file, the existing primary profile is returned.
3. **Existing Customer (New Data)**: If there is a match on *either* the email or phone number but the other field introduces new data, a new `secondary` contact is created and tethered to the oldest `primary` contact in that cluster.
4. **Consolidation**: If a request comes in with an email belonging to one `primary` contact and a phone number belonging to a *different* `primary` contact, the two distinct profiles are joined! The older one remains `primary`, and the newer one is demoted to `secondary`.

## Hosted Live URL
**Base URL:** [https://bitespeed-identify-ljzg.onrender.com/identify](https://bitespeed-identify-ljzg.onrender.com/identify)

This API accepts HTTP `POST` requests formatted as JSON payloads containing an `email` and/or `phoneNumber`. It returns the consolidated profile cluster showcasing the main ID, a deduplicated array of all associated emails/phones, and any linked secondary IDs.

## Tech Stack
- **Node.js**: Backend JavaScript runtime. Chosen for efficient asynchronous I/O required in web servers.
- **Express**: Fast web framework to handle HTTP routes and JSON parsing.
- **TypeScript**: Used for robust type safety and catching variable assignment errors before deployment.
- **Prisma**: Next-generation Object-Relational Mapper (ORM) for TypeScript to cleanly map TypeScript models to our database.
- **SQLite**: A lightweight relational database that stores the data locally in `dev.db` without needing an external cloud DB layer. Handled securely by Prisma.

## Requirements to Run Locally
- Node.js (>= 18.x)
- npm (Node Package Manager)

## Setup & Run Local Server

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   This project uses SQLite. Sync the schema by running:
   ```bash
   npx prisma db push
   ```

3. **Run the Application**

   *For local development auto-reloading:*
   ```bash
   npm run dev
   ```

   *For production build:*
   ```bash
   npm run build
   npm start
   ```

By default, the local application runs on **http://localhost:3000**

## API Endpoint Reference

### `POST /identify`

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
