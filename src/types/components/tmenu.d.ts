import type { RouteRecordRaw } from 'vue-router';
import type { AxiosInstance } from 'axios';

export interface TMenuConfig {
  label: string;
  code?: string;
  isPage: boolean;
  icon?: string;
  hasDivider?: boolean;
  children?: TMenuConfig[];
}

export interface TLeftMenuProps {
  menuConfig: TMenuConfig[];
  routes: RouteRecordRaw[];
  module: string | undefined;
  api: AxiosInstance;
}

export interface TMenuItemProps {
  menu: TMenuConfig;
  isChild?: boolean;
  routes: RouteRecordRaw[];
}
