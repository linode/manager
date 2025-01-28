import { CypressPlugin } from './plugin';
import { updateUserPreferences } from '@linode/api-v4';

const envVarName = 'CY_TEST_RESET_PREFERENCES';

/**
 * Resets test account user preferences to expected state when
 * `CY_TEST_RESET_PREFERENCES` is set.
 */
export const resetUserPreferences: CypressPlugin = async (_on, config) => {
  if (config.env[envVarName]) {
    await updateUserPreferences({
      // Sidebar categories are fully expanded.
      collapsedSideNavProductFamilies: [],

      // Sidebar is not pinned.
      desktop_sidebar_open: false,

      // Type-to-confirm is enabled.
      type_to_confirm: true,
    });

    console.info('Reset test account user preferences');
  }
};
