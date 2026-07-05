import type { AppType } from "src/router/app-type";

export interface MenuItem {
  id: string;
  icon: string;
  label: string;
  to?: string | undefined;
  expanded?: boolean | null | undefined;
  children?: MenuItem[] | undefined;
  appType?: AppType | undefined;
}
