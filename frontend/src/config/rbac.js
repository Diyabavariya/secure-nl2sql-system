/* src/config/rbac.js
 * Frontend RBAC configuration — controls navigation visibility and query access.
 *
 * IMPORTANT: This file controls UI-level access only (which sidebar pages are
 * visible). Table-level data access is enforced exclusively by the backend.
 * The security panel on the dashboard reflects backend RBAC decisions — it is
 * NOT gated here.
 *
 * Roles match backend canonical keys (lowercase): admin, finance, sales, marketing, inventory.
 */

export const ROLE_CATALOG = [
  {
    role: 'admin',
    label: 'Admin',
    description: 'Full operational access across dashboards, security, and account tools.',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    pages: ['dashboard', 'security', 'history', 'connections', 'apikeys'],
    canExecuteQuery: true,
  },
  {
    role: 'finance',
    label: 'Finance',
    description: 'Financial reporting and payment analytics.',
    badgeClass: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
    pages: ['dashboard', 'history'],
    canExecuteQuery: true,
  },
  {
    role: 'sales',
    label: 'Sales',
    description: 'Pipeline and revenue analysis for sales operations.',
    badgeClass: 'bg-sky-500/15 text-sky-200 border-sky-500/30',
    pages: ['dashboard', 'history'],
    canExecuteQuery: true,
  },
  {
    role: 'marketing',
    label: 'Marketing',
    description: 'Campaign and performance analysis for customer-facing decisions.',
    badgeClass: 'bg-cyan-500/15 text-cyan-200 border-cyan-500/30',
    pages: ['dashboard', 'history'],
    canExecuteQuery: true,
  },
  {
    role: 'inventory',
    label: 'Inventory',
    description: 'Product catalogue, seller data, and order item management.',
    badgeClass: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
    pages: ['dashboard', 'history'],
    canExecuteQuery: true,
  },
];

// PAGE_ACCESS controls sidebar navigation only — not data access.
// 'security' nav page is admin-only; the security STATUS PANEL on the dashboard
// is shown to all query-capable roles (controlled in DashboardPage.jsx).
export const PAGE_ACCESS = {
  dashboard:   ['admin', 'finance', 'sales', 'marketing', 'inventory'],
  security:    ['admin'],
  history:     ['admin', 'finance', 'sales', 'marketing', 'inventory'],
  connections: ['admin'],
  apikeys:     ['admin'],
};

export const NAV_ITEMS = [
  { key: 'dashboard',   label: 'Dashboard',           icon: 'dashboard' },
  { key: 'security',    label: 'Security Rules',       icon: 'admin_panel_settings' },
  { key: 'history',     label: 'Query History',        icon: 'history' },
  { key: 'connections', label: 'Database Connections', icon: 'database' },
  { key: 'apikeys',     label: 'API Keys',             icon: 'key' },
];

export const DEFAULT_ROLE = 'sales';

const ROLE_LOOKUP = new Map(ROLE_CATALOG.map((entry) => [entry.role.toLowerCase(), entry]));

/** Normalise an arbitrary role string to the canonical lowercase key. Returns null if unrecognised. */
export function normalizeRole(role) {
  if (!role) return null;
  const normalized = String(role).trim();
  return normalized ? (ROLE_LOOKUP.get(normalized.toLowerCase())?.role ?? null) : null;
}

export function getRoleDefinition(role, catalog = ROLE_CATALOG) {
  const key = String(role ?? '').trim().toLowerCase();
  return key ? (catalog.find((entry) => entry.role.toLowerCase() === key) ?? null) : null;
}

export function hasRole(role, expectedRole) {
  return normalizeRole(role) === normalizeRole(expectedRole);
}

/** Returns true if the role may navigate to the given page (sidebar-level only). */
export function canAccess(role, pageKey) {
  const key = String(role ?? '').trim().toLowerCase();
  return key ? (PAGE_ACCESS[pageKey]?.includes(key) ?? false) : false;
}

export function canExecuteQuery(role) {
  return getRoleDefinition(role)?.canExecuteQuery ?? false;
}

export function getAccessibleNavItems(role) {
  return NAV_ITEMS.filter((item) => canAccess(role, item.key));
}

export function getRoleLabel(role) {
  return getRoleDefinition(role)?.label ?? (role ? String(role) : 'Unknown role');
}

export function getRoleBadgeClass(role) {
  return getRoleDefinition(role)?.badgeClass ?? 'bg-slate-500/15 text-slate-200 border-slate-500/30';
}

export function getRoleOptions(catalog = ROLE_CATALOG) {
  return catalog.map((entry) => ({ value: entry.role, label: entry.label, description: entry.description }));
}

export function getDefaultRole(catalog = ROLE_CATALOG) {
  return catalog.find((entry) => entry.role === DEFAULT_ROLE)?.role ?? catalog[0]?.role ?? DEFAULT_ROLE;
}
