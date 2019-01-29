import { PaginationProps } from 'src/components/Pagey';

export const pageyProps: PaginationProps<any> = {
  count: 3,
  error: undefined,
  handlePageChange: jest.fn(),
  handlePageSizeChange: jest.fn(),
  handleOrderChange: jest.fn(),
  onDelete: jest.fn(),
  loading: false,
  order: 'asc' as 'asc' | 'desc',
  orderBy: undefined,
  page: 1,
  pageSize: 25,
  request: jest.fn(),
  handleSearch: jest.fn(),
  filter: {},
  searching: false
};
