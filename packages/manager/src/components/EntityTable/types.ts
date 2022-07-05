import { Domain } from '@linode/api-v4';
import { Image } from '@linode/api-v4';
import { Firewall } from '@linode/api-v4';
import { Linode } from '@linode/api-v4';
import { Volume } from '@linode/api-v4';
import { APIError } from '@linode/api-v4';
import { OrderByProps } from 'src/components/OrderBy';
// eslint-disable-next-line
export type Handlers = Record<string, Function>;
export type Entity = Linode | Domain | Firewall | Image | Volume; // @todo add more here

export interface HeaderCell {
  sortable: boolean;
  label: string;
  dataColumn: string;
  widthPercent: number;
  visuallyHidden?: boolean;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
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
  toggleGroupByTag?: () => boolean;
  isGroupedByTag?: boolean;
  emptyMessage?: string;
}

export interface EntityTableRow<T> extends BaseProps {
  Component: React.ComponentType<any>;
  data: T[];
  request?: () => Promise<T[]>;
}

export interface PageyIntegrationProps {
  persistData?: (data: Entity[]) => void;
  normalizeData?: (data: Entity[]) => Entity[];
}
