import { s as supabase } from './supabase_C4p1dVZL.mjs';

const DEFAULT_PERMISSIONS = {
  users: { view: false, create: false, edit: false, delete: false },
  processes: { view: false, create: false, edit: false, delete: false },
  indicators: { view: false, create: false, edit: false, delete: false },
  profiles: { view: false, create: false, edit: false, delete: false },
  contracts: { view: false, create: false, edit: false, delete: false },
  organization: { manage_settings: false }
};
function hasPermission(permissions, resource, action, isOrgAdmin = false) {
  if (isOrgAdmin) return true;
  if (!permissions) return false;
  const resourcePermissions = permissions[resource];
  if (!resourcePermissions) return false;
  if (resource === "organization") {
    return resourcePermissions[action] === true;
  }
  return resourcePermissions[action] === true;
}
function mergePermissions(storedPermissions) {
  if (!storedPermissions) return DEFAULT_PERMISSIONS;
  return {
    users: { ...DEFAULT_PERMISSIONS.users, ...storedPermissions.users },
    processes: { ...DEFAULT_PERMISSIONS.processes, ...storedPermissions.processes },
    indicators: { ...DEFAULT_PERMISSIONS.indicators, ...storedPermissions.indicators },
    profiles: { ...DEFAULT_PERMISSIONS.profiles, ...storedPermissions.profiles },
    contracts: { ...DEFAULT_PERMISSIONS.contracts, ...storedPermissions.contracts },
    organization: { ...DEFAULT_PERMISSIONS.organization, ...storedPermissions.organization }
  };
}
async function fetchUserPermissions(userId) {
  try {
    const { data: profile, error } = await supabase.from("profiles").select(`
                role,
                organization_roles (
                    permissions
                )
            `).eq("id", userId).single();
    if (error || !profile) return { permissions: DEFAULT_PERMISSIONS, isOrgAdmin: false };
    const isOrgAdmin = profile.role === "admin";
    const roleData = Array.isArray(profile.organization_roles) ? profile.organization_roles[0] : profile.organization_roles;
    const permissions = roleData?.permissions ? mergePermissions(roleData.permissions) : DEFAULT_PERMISSIONS;
    return { permissions, isOrgAdmin };
  } catch (e) {
    console.error("Error fetching permissions:", e);
    return { permissions: DEFAULT_PERMISSIONS, isOrgAdmin: false };
  }
}

export { DEFAULT_PERMISSIONS, fetchUserPermissions, hasPermission, mergePermissions };
