import { PaginationProps } from 'src/components/Pagey';

export const pageyProps: PaginationProps<any> = {
  count: 3,
  error: undefined,
  filter: {},
  handleOrderChange: vi.fn(),
  handlePageChange: vi.fn(),
  handlePageSizeChange: vi.fn(),
  handleSearch: vi.fn(),
  loading: false,
  onDelete: vi.fn(),
  order: 'asc' as 'asc' | 'desc',
  orderBy: undefined,
  page: 1,
  pageSize: 25,
  request: vi.fn(),
  searching: false,
};
