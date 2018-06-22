import { curry, compose, defaultTo, isEmpty, not, when } from 'ramda';

export default curry((defaultValue: number, v?: null | string | number) =>
  compose<
    string | number | null | undefined,
    number | null | undefined,
    number>(
      defaultTo(defaultValue),
      when(compose(not, isEmpty), (v: string) => +v),
  )(v));
