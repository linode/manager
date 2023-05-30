export type CypressPlugin = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
) => Promise<void | Cypress.PluginConfigOptions>;

export const plugins = [];
