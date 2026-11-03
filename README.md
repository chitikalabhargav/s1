# Budget Planner

A React + Vite college project with Admin and User modules. Data is stored in browser Local Storage for demonstration.

## Run locally
1. Install Node.js LTS and VS Code.
2. Open this folder in VS Code.
3. Open Terminal > New Terminal.
4. Run:
   ```bash
   npm install
   npm run dev
   ```
5. Open the local URL printed in the terminal (usually http://localhost:5173).

## Demo admin login
- Email: admin@budgetplanner.com
- Password: Admin@123

## User
Use Create account on the login page, then sign in with that account.

## Build
```bash
npm run build
```

## Deploy to Vercel
Push the folder to GitHub, import the repository in Vercel, and deploy with:
- Framework: Vite
- Build command: npm run build
- Output directory: dist

## Important security note
Local Storage authentication is for a classroom/demo project only. It is not secure for real accounts or real financial information. Do not use real passwords or sensitive financial data. For production, use a backend and secure authentication.
