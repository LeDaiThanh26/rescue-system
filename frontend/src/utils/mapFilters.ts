import { Report, ReportFilter } from '@/types/report';

export function applyClientFilters(reports: Report[], filters: ReportFilter): Report[] {
  let result = reports;
  if (filters.province) result = result.filter((r) => r.province === filters.province);
  if (filters.priority) result = result.filter((r) => r.priority === filters.priority);
  if (filters.status) result = result.filter((r) => r.status === filters.status);
  if (filters.category) result = result.filter((r) => r.category === filters.category);
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase();
    result = result.filter(
      (r) =>
        r.caseCode.toLowerCase().includes(kw) ||
        r.fullName.toLowerCase().includes(kw) ||
        r.address.toLowerCase().includes(kw)
    );
  }
  return result;
}
