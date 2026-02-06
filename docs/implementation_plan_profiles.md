# Implementation Plan - Profiles Management (Perfis)

## Goal
Implement a "Profiles" (Perfis) management module allowing administrators to create custom access groups with specific permissions and dashboard access.

## Database Changes
1.  **Create Table `organization_roles`**:
    *   `id` (UUID, PK)
    *   `organization_id` (UUID, FK)
    *   `name` (Text)
    *   `description` (Text, nullable)
    *   `pbi_roles` (Text, nullable - comma separated)
    *   `can_export_data` (Boolean, default false)
    *   `is_active` (Boolean, default true)
    *   Timestamps
2.  **Create Table `role_dashboards`** (Junction):
    *   `organization_role_id` (UUID, FK)
    *   `dashboard_id` (UUID, FK)
    *   PK: (role_id, dashboard_id)

## UI Components
1.  **`RoleList.tsx`**:
    *   Table displaying roles.
    *   Columns: Name, Description, Dashboard Count, Status toggle, Edit/Delete buttons.
2.  **`RoleForm.tsx`**:
    *   Modal/Form for creating/editing roles.
    *   Fields: Name, Description, Multi-select for Dashboards, Power BI Roles (text), Export Data (switch).

## Pages
1.  **`src/pages/admin/perfis/index.astro`**:
    *   Main admin page for profiles.
    *   Embeds `RoleList`.

## Navigation
1.  Update `AdminSidebar.astro` to include "Perfis".
