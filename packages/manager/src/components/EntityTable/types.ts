import { Domain } from '@linode/api-v4/lib/domains/types';
import { Firewall } from '@linode/api-v4/lib/firewalls/types';
import { Image } from '@linode/api-v4/lib/images/types';
import { Linode } from '@linode/api-v4/lib/linodes/types';
import { APIError } from '@linode/api-v4/lib/types';
import { Volume } from '@linode/api-v4/lib/volumes/types';

import { OrderByProps } from 'src/components/OrderBy';
// eslint-disable-next-line
export type Handlers = any;
export type Entity = Domain | Firewall | Image | Linode | Volume; // @todo add more here

export interface HeaderCell {
  dataColumn: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  label: string;
  sortable: boolean;
  visuallyHidden?: boolean;
  widthPercent: number;
}
export interface BaseProps {
  error?: APIError[];
  handlers?: Handlers;
  lastUpdated: number;
  loading: boolean;
}
export interface ListProps extends BaseProps {
  RowComponent: React.ComponentType;
  data: Entity[];
  emptyMessage?: string;
  entity: string;
  headers: HeaderCell[];
  initialOrder?: {
    order: OrderByProps<Entity>['order'];
    orderBy: OrderByProps<Entity>['orderBy'];
  };
  isGroupedByTag?: boolean;
  toggleGroupByTag?: () => boolean;
}

export interface EntityTableRow<T> extends BaseProps {
  Component: React.ComponentType<any>;
  data: T[];
  request?: () => Promise<T[]>;
}

export interface PageyIntegrationProps {
  normalizeData?: (data: Entity[]) => Entity[];
  persistData?: (data: Entity[]) => void;
}
