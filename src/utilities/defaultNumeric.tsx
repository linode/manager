import { compose, defaultTo, isEmpty, not, when } from 'ramda';

export default (defaultValue: number) => compose(
  defaultTo(defaultValue),
  when(compose(not, isEmpty), (v: string) => +v),
);
