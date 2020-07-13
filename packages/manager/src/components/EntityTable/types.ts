import { Domain } from '@linode/api-v4/lib/domains/types';
import { Image } from '@linode/api-v4/lib/images/types';
import { Linode } from '@linode/api-v4/lib/linodes/types';

export type Handlers = Record<string, Function>;
export type Entity = Linode | Domain | Image; // @todo add more here

export interface ListProps {
  entity: string;
  data: Entity[];
  RowComponent: React.ComponentType;
  headerCells: JSX.Element[];
  handlers?: Handlers;
}
