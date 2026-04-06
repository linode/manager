import { LINODE_CREATE_TIMEOUT } from 'support/constants/linodes';
import { enhanceError, isAxiosError } from 'support/util/api';
import { timeout } from 'support/util/backoff';

/**
 * Describes an object which can contain a label.
 */
export interface Labelable {
  label: string;
}

/**
 * Yields a Cypress Promise that can be used in place of a native Promise.
 *
 * @param promise - Promise with result to await.
 * @param options - Defer options.
 *
 * @returns Promise result.
 */
Cypress.Commands.add(
  'defer',
  { prevSubject: false },
  <T>(
    promiseGenerator: () => Promise<T>,
    labelOrOptions?:
      | Partial<Cypress.Loggable & Cypress.Timeoutable & Labelable>
      | string
  ) => {
    // Gets the label that will used as the description for Cypress's log.
    const commandLabel = (() => {
      if (typeof labelOrOptions === 'string') {
        return labelOrOptions;
      }
      return labelOrOptions?.label ?? 'waiting for promise';
    })();

    // Gets the options object that will be passed to `cy.wrap`.
    const wrapOptions = (() => {
      if (typeof labelOrOptions !== 'string') {
        return {
          ...(labelOrOptions ?? {}),
          log: false,
        };
      }
      return { log: false };
    })();

    const timeoutLength = (() => {
      if (typeof labelOrOptions !== 'string') {
        return labelOrOptions?.timeout ?? LINODE_CREATE_TIMEOUT;
      }
      return LINODE_CREATE_TIMEOUT;
    })();

    const commandLog = Cypress.log({
      autoEnd: false,
      end: false,
      message: commandLabel,
      name: 'defer',
      timeout: timeoutLength,
    });

    // Wraps the given promise in order to update Cypress's log on completion.
    const wrapPromise = async (): Promise<T> => {
      let result: T;
      try {
        result = await promiseGenerator();
      } catch (e: any) {
        commandLog.error(e);
        // If we're getting rate limited, timeout for 15 seconds so that
        // test reattempts do not immediately trigger more 429 responses.
        if (isAxiosError(e) && e.response?.status === 429) {
          await timeout(15000);
        }
        throw enhanceError(e);
      }
      commandLog.end();
      return result;
    };

    return cy.wrap<Promise<T>, T>(wrapPromise(), {
      timeout: timeoutLength,
      ...wrapOptions,
    });
  }
);
