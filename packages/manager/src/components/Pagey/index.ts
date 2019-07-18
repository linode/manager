import Pagey, {
  HandleOrderChange as _HandleOrderChange,
  Order as _Order,
  OrderBy as _OrderBy,
  PaginationProps as _PaginationProps
} from './Pagey';

/* tslint:disable */
export interface HandleOrderChange extends _HandleOrderChange {}
export type Order = _Order;
export type OrderBy = _OrderBy;
export interface PaginationProps<T> extends _PaginationProps<T> {}
export default Pagey;
