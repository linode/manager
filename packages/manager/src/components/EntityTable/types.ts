export type Handlers = Record<string, Function>;

export interface ListProps {
  entity: string;
  data: any[];
  RowComponent: React.ComponentType;
  headerCells: JSX.Element[];
  handlers?: Handlers;
}
