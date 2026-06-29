export interface TableSearchParams {
  order?: 'asc' | 'desc';
  orderBy?: string;
  page?: number;
  pageSize?: number;
}

export type OrderSetWithPrefix<P extends string> = {
  [K in `${P}-order` | `${P}-orderBy`]: K extends `${P}-order` ? Order : string;
};

export type Order = 'asc' | 'desc';
