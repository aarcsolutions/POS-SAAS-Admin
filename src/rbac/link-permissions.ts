import { ENTITY_PERMS } from './permissions-map';

/**
 * Mapping of dashboard routes to their required permission strings.
 */
export const ADMIN_LINK_PERM: Record<string, string> = {
  '/dashboard':            ENTITY_PERMS.dashboard.overview,
  '/business-settings':    ENTITY_PERMS.business_settings.list,
  '/branches':             ENTITY_PERMS.branches.list,
  '/users':                ENTITY_PERMS.users.list,
  '/categories':           ENTITY_PERMS.categories.list,
  '/products':             ENTITY_PERMS.products.list,
  '/recipes':              ENTITY_PERMS.recipes.list,
  '/inventory':            ENTITY_PERMS.inventory.list,
  '/reports':              ENTITY_PERMS.reports.list,
  '/customers':            ENTITY_PERMS.customers.list,
  '/orders':               ENTITY_PERMS.orders.list,
  '/kds':                  ENTITY_PERMS.kds.list,
  '/drivers':              ENTITY_PERMS.drivers.list,
  '/promo-codes':          ENTITY_PERMS.promo_codes.list,
  '/raw-materials':        ENTITY_PERMS.raw_materials.list,
  '/suppliers':            ENTITY_PERMS.suppliers.list,
  '/payments':             ENTITY_PERMS.payments.list,
  '/transactions':         ENTITY_PERMS.payments.list,
  '/reservations':         ENTITY_PERMS.reservations.list,
  '/reviews':              ENTITY_PERMS.reviews.list,
  '/catering':             ENTITY_PERMS.catering.list,
  '/roles':                ENTITY_PERMS.roles.list,
  '/permissions':          ENTITY_PERMS.permissions.list,
  '/modules':              ENTITY_PERMS.modules.list,
};
