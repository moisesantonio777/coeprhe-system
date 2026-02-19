# Handover Guide: Rhema Admin

This guide explains how to set up and continue developing the project on any machine.

## Prerequisites
- **Node.js**: v18 or newer.
- **Supabase Account**: Accessible via Supabase Dashboard.

## Local Setup
1. **Clone/Download** the project folder.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   - Copy `.env.example` to `.env`.
   - Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase Project Settings (API tab).

## Database Setup
If you are starting a fresh database:
1. Go to the **SQL Editor** in your Supabase Dashboard.
2. Run the following scripts in order:
   - `supabase_setup.sql` (Core tables)
   - `setup_membros_table.sql` (Specific member fields)
   - `setup_dept_pastores.sql` (Departments and Pastors)
   - `setup_congregacoes.sql` (Smart flow/Congregations)

## Development
To start the local development server:
```bash
npm run dev
```

## Production
To build for production:
```bash
npm run build
```
The output will be in the `dist/` folder.
