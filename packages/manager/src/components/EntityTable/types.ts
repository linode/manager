import { Domain } from '@linode/api-v4/lib/domains/types';
import { Image } from '@linode/api-v4/lib/images/types';
import { Firewall } from '@linode/api-v4/lib/firewalls/types';
import { Linode } from '@linode/api-v4/lib/linodes/types';
import { Volume } from '@linode/api-v4/lib/volumes/types';
import { APIError } from '@linode/api-v4/lib/types';
import { OrderByProps } from 'src/components/OrderBy';
export type Handlers = Record<string, Function>;
export type Entity = Linode | Domain | Firewall | Image | Volume; // @todo add more here

export interface HeaderCell {
  sortable: boolean;
  label: string;
  dataColumn: string;
  widthPercent: number;
  visuallyHidden?: boolean;
  hideOnMobile?: boolean;
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
  readOnly?: boolean;
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
