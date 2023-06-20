export type CypressPlugin = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
) =>
  | void
  | Cypress.PluginConfigOptions
  | Promise<void | Cypress.PluginConfigOptions>;
