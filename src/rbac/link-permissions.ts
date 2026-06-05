import { ENTITY_PERMS } from './permissions-map';

/**
 * Mapping of dashboard routes to their required permission strings.
 */
export const ADMIN_LINK_PERM: Record<string, string> = {
  '/dashboard':            ENTITY_PERMS.dashboard.overview,
  '/business-settings':    ENTITY_PERMS.business_settings.list,
  '/branches':             ENTITY_PERMS.branches.list,
  '/users':                ENTITY_PERMS.users.list,
  '/products':             ENTITY_PERMS.products.list,
  '/inventory':            ENTITY_PERMS.inventory.list,
  '/reports':              ENTITY_PERMS.reports.list,
  '/customers':            ENTITY_PERMS.customers.list,
  '/suppliers':            ENTITY_PERMS.suppliers.list,
  '/transactions':         ENTITY_PERMS.transactions.list,
  '/roles':                ENTITY_PERMS.roles.list,
  '/permissions':          ENTITY_PERMS.permissions.list,
  '/modules':              ENTITY_PERMS.modules.list,
};
