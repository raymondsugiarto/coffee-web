import type { QTableProps } from 'quasar';

export interface PageDto<T> {
  content: T[];
  pageNumber: number;
  offset: number;
  size: number;
  totalElements: number;
  totalPages: number;
  pagination: QTableProps['pagination']
  data: []
}

export interface PageTableDto<T> {
  content: T[];
  pageNumber: number;
  size: number;
  totalElements: number;
  totalPages: number;
  pagination: QTableProps['pagination']
}

export interface QTablePropsOnRequestPagination {
  /**
   * Column name (from column definition)
   */
  sortBy: string;
  /**
   * Is sorting in descending order?
   */
  descending: boolean;
  /**
   * Page number (1-based)
   */
  page: number;
  /**
   * How many rows per page? 0 means Infinite
   */
  rowsPerPage: number;
}

export interface QTablePropsOnRequest {
  /**
   * Pagination object
   */
  pagination: QTablePropsOnRequestPagination;
  /**
   * String/Object to filter table with (the 'filter' prop)
   */
  filter?: string;
  /**
   * Function to get a cell value
   * @param col Column name from column definitions
   * @param row The row object
   * @returns Parsed/Processed cell value
   */
  getCellValue: (col: unknown, row: unknown) => unknown;

  params?: URLSearchParams | undefined;

  appFilter?: Record<string, string | string[] | undefined>;
}
