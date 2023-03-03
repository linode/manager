import { isNil } from 'ramda';

export default <T>(array: (T | null | undefined)[]): T[] =>
  array.filter((el) => !isNil(el)) as T[];
