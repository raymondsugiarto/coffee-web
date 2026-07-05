export interface DefaultResponse<T> {
  code: string;
  message: string;
  data: T;
  errors: ErrorResponse[];
  timestamp: string;
}

export interface ErrorResponse {
  field: string;
  tag: string;
  value: unknown;
  params: string;
}
