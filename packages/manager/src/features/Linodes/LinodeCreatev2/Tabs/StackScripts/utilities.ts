export type StackScriptTabType = 'Account' | 'Community';

export const tabs = ['Account', 'Community'] as const;

/**
 * Returns the index of the currently selected StackScripts tab
 *
 * @param tab the current tab. Currently, this value comes from 'subtype' query param on the Linode Create flow.
 * @returns the index of the selected tab
 */
export const getStackScriptTabIndex = (tab: StackScriptTabType | undefined) => {
  if (tab === undefined) {
    return 0;
  }

  const tabIndex = tabs.indexOf(tab);

  if (tabIndex === -1) {
    return 0;
  }

  return tabIndex;
};

/**
 * API filter for fetching community StackScripts
 *
 * We omit some usernames so that Marketplace StackScripts don't show up.
 */
export const communityStackScriptFilter = {
  '+and': [
    { username: { '+neq': 'linode' } },
    { username: { '+neq': 'linode-stackscripts' } },
  ],
  mine: false,
};

/**
 * API filter for fetching account StackScripts
 */
export const accountStackScriptFilter = { mine: true };
