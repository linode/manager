import { vi } from 'vitest';
import { PaginationProps } from 'src/components/Pagey';

export const pageyProps: PaginationProps<any> = {
  count: 3,
  error: undefined,
  handlePageChange: vi.fn(),
  handlePageSizeChange: vi.fn(),
  handleOrderChange: vi.fn(),
  onDelete: vi.fn(),
  loading: false,
  order: 'asc' as 'asc' | 'desc',
  orderBy: undefined,
  page: 1,
  pageSize: 25,
  request: vi.fn(),
  handleSearch: vi.fn(),
  filter: {},
  searching: false,
};
