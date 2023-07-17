import { PaginationProps } from 'src/components/Pagey';

export const pageyProps: PaginationProps<any> = {
  count: 3,
  error: undefined,
  filter: {},
  handleOrderChange: jest.fn(),
  handlePageChange: jest.fn(),
  handlePageSizeChange: jest.fn(),
  handleSearch: jest.fn(),
  loading: false,
  onDelete: jest.fn(),
  order: 'asc' as 'asc' | 'desc',
  orderBy: undefined,
  page: 1,
  pageSize: 25,
  request: jest.fn(),
  searching: false,
};
