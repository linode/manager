import { Domain } from '@linode/api-v4/lib/domains/types';
import { Firewall } from '@linode/api-v4/lib/firewalls/types';
import { Linode } from '@linode/api-v4/lib/linodes/types';
import { APIError } from '@linode/api-v4/lib/types';
import { OrderByProps } from 'src/components/OrderBy';
export type Handlers = Record<string, Function>;
export type Entity = Linode | Domain | Firewall; // @todo add more here

export interface HeaderCell {
  sortable: boolean;
  label: string;
  dataColumn: string;
  widthPercent: number;
  visuallyHidden?: boolean;
}
export interface BaseProps {
  error?: APIError[];
  loading: boolean;
  lastUpdated: number;
  handlers?: Handlers;
}
export interface ListProps extends BaseProps {
  entity: string;
  data: Entity[];
  RowComponent: React.ComponentType;
  headers: HeaderCell[];
  initialOrder?: {
    order: OrderByProps['order'];
    orderBy: OrderByProps['orderBy'];
  };
}

export interface EntityTableRow<T> extends BaseProps {
  Component: React.ComponentType<any>;
  data: T[];
  request?: () => Promise<T[]>;
}
