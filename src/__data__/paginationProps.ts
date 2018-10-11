import { PaginationProps } from 'src/components/Pagey';

export const paginationProps: PaginationProps<any> = {
  count: 0,
  data: [],
  loading: false,
  order: 'asc',
  page: 1,
  pageSize: 100,
  handlePageChange: jest.fn(),
  handlePageSizeChange: jest.fn(),
  request: jest.fn(),
  updateOrderBy: jest.fn(),
};