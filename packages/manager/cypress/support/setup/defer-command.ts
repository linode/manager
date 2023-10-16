// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

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
    promise: Promise<T>,
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

    const timeout = (() => {
      if (typeof labelOrOptions !== 'string') {
        return labelOrOptions?.timeout;
      }
      return undefined;
    })();

    const commandLog = Cypress.log({
      autoEnd: false,
      end: false,
      message: commandLabel,
      name: 'defer',
      timeout,
    });

    // Wraps the given promise in order to update Cypress's log on completion.
    const wrapPromise = async (): Promise<T> => {
      let result: T;
      try {
        result = await promise;
      } catch (e) {
        commandLog.end();
        throw e;
      }
      commandLog.end();
      return result;
    };

    return cy.wrap<Promise<T>, T>(wrapPromise(), wrapOptions);
  }
);
