export enum AppType {
  ADMIN = 'ADMIN',
  COMPANY = 'COMPANY',
}

const adminPublicMeta = { public: true, appType: AppType.ADMIN };
const adminPrivateMeta = { public: false, appType: AppType.ADMIN };
const companyPublicMeta = { public: true, appType: AppType.COMPANY };
const companyPrivateMeta = { public: false, appType: AppType.COMPANY };

export const ADMIN_ACCESS_TOKEN = 'cf-adm-access-token';
export const COMPANY_ACCESS_TOKEN = 'cf-comp-access-token';

const appTypeAccessTokens = {
  [AppType.ADMIN]: ADMIN_ACCESS_TOKEN,
  [AppType.COMPANY]: COMPANY_ACCESS_TOKEN,
};

const appTypeDefaultRoutes = {
  [AppType.ADMIN]: '/sign-in',
  [AppType.COMPANY]: '/sign-in',
};

const appTypeHomePage = {
  [AppType.ADMIN]: '/dashboard',
  [AppType.COMPANY]: '/company/dashboard',
};

const appTypePrefixApiUrl = {
  [AppType.ADMIN]: '/api-admin/',
  [AppType.COMPANY]: '/api-company/',
};

export {
  adminPublicMeta,
  adminPrivateMeta,
  companyPublicMeta,
  companyPrivateMeta,
  appTypeAccessTokens,
  appTypeDefaultRoutes,
  appTypeHomePage,
  appTypePrefixApiUrl,
};
