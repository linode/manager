import { adjust } from 'ramda';
import { reportException } from 'src/exceptionReporting';

export default <T extends { id: string | number }>(
  updater: (v: T) => T,
  id: number,
  list: T[]
) => {
  if (list.length === 0) {
    return list;
  }

  const foundIndex = list.findIndex(l => l.id === id);
  if (foundIndex < 0) {
    return list;
  }

  /**
   * the current Ramda docs tell you that the
   * foundIndex should be the first argument, but
   * our version of ramda has these switched
   *
   * At the time of this comment, we have:
   *
   * ramda: ^0.25.0
   * @types/ramda: 0.25.16 (0.25.17 switches the argument order)
   */
  try {
    return adjust(updater, foundIndex, list);
  } catch (e) {
    /**
     * we have logic in place to not bomb the app, but we should throw an error
     * here and not fail silently.
     *
     * this will most likely be invoked whenever we upgrade ramda
     */

    reportException(`Error with running ramda adjust: ${e}`);
    /* tslint:disable */
    console.error(`Error with running ramda adjust: ${e}`);
    console.error(`Check the ramda docs and make sure you are invoking the function
    with the arguments in the correct order.`);
    return list;
  }
};
