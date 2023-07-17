export type CypressPlugin = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
) =>
  | Cypress.PluginConfigOptions
  | Promise<Cypress.PluginConfigOptions | void>
  | void;
