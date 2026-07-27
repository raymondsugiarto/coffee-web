// Wire shape for /api-admin/employees (filtered to admin_type='EMPLOYEE'
// by the driver service). We only carry the fields the payroll page
// actually displays.
export interface EmployeeResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
