import type { CypressPlugin } from './plugin';

export const setupPlugins = async (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
  plugins: CypressPlugin[]
): Promise<Cypress.PluginConfigOptions> => {
  let modifiedConfig = config;
  for (const plugin of plugins) {
    // We want to run plugins sequentially to ensure configuration is modified
    // in the correct order.
    // eslint-disable-next-line no-await-in-loop
    const result = await plugin(on, modifiedConfig);
    if (result) {
      modifiedConfig = result;
    }
  }
  return modifiedConfig;
};
