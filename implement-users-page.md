# Task: Implement Users Page

**Status**: In Progress
**Agent**: frontend-specialist

## 1. Analysis
- **Goal**: Create a paginated users list page for the "Users Module".
- **Route**: `/users` (src/pages/users/index.astro).
- **Features**:
  - List all users for the logged-in company.
  - Pagination.
  - "Add User" button (Global).
  - "Edit", "Inactivate" buttons (Per user).
- **Tech Stack**: Astro, Supabase, TailwindCSS (v4 @theme).
- **Design System**: "Microsoft Fluent" inspired (from global.css).

## 2. Design Strategy
- **Layout**: `AppLayout` (src/layouts/AppLayout.astro).
- **Styling**: Use `var(--color-brand)`, `var(--radius-card)`, etc.
- **Topological Hypothesis**: A clean, "surface-card" container for the list.
- **Components**:
  - `src/pages/users/index.astro`: Main entry point. Fetches data serverside.
  - `src/modules/users/components/UserList.astro`: The table/list presentation.
  - `src/modules/users/components/UserActions.astro`: Dropdown or button group for Edit/Inactivate.
- **Data Fetching**:
  - Supabase `auth.getUser()` to get current user/company.
  - Query `profiles` table joined with `company_associates` or strictly `profiles` depending on schema.
  - **Schema Check Needed**: I need to confirm how users are linked to companies. Usually `profile.company_id` or a join table. I will assume `company_id` on profile based on typical simple SaaS schemas, but will verify.

## 3. Implementation Steps

### Step 1: Schema Verification
- [ ] Check Supabase schema for `profiles` table and company relationship.

### Step 2: Create Components
- [ ] Create `UserList.astro` in `src/modules/users/components`.
- [ ] Create `UserActions.astro` (if needed for complexity).

### Step 3: Create Page
- [ ] Create `src/pages/users/index.astro`.
- [ ] Implement Server-Side Data Fetching (Supabase).
- [ ] Implement Pagination logic (e.g., `?page=X`).

### Step 4: Add Interactivity
- [ ] "Add User" button -> Redirect to `/users/new` or open Query param modal? User asked for "buttons", I'll likely create the page `/users/new` later, but for now just the button.
- [ ] "Edit" -> Link to `/users/[id]`.
- [ ] "Inactivate" -> Server Action (if using experimental Astro actions) or a client-side call. Since it's Astro, a simple form POST to an API endpoint or client-side fetch is common. I'll stick to simple client-side fetch or form for now.

## 4. Design Commitment (Frontend Specialist)
- **Style**: Modern Enterprise (Fluent).
- **Geometry**: Soft corners (12px cards), standard buttons (6px).
- **Palette**: Brand Blue (#0078D4) + Neutral Grays.
- **Avoid**: Generic Tailwind tables. I will use a semantic HTML table with styled rows and proper spacing.
