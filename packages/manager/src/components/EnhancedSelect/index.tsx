import EnhancedSelect, {
  GroupType as _GroupType,
  Item as _Item,
} from './Select';
/* tslint:disable */
export interface Item<T> extends _Item<T> {}
export interface GroupType<T> extends _GroupType<T> {}
export type { BaseSelectProps } from './Select';
export default EnhancedSelect;
