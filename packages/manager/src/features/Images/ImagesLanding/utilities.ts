export type ImagesSubTabType = 'custom' | 'recovery' | 'shared';

export const tabs = ['custom', 'shared', 'recovery'] as const;

/**
 * Returns the index of the currently selected Images sub-tab
 *
 * @param tab the current tab. Currently, this value comes from 'subtype' query param on the Images Landing Page.
 * @returns the index of the selected tab
 */
export const getImagesSubTabIndex = (tab: ImagesSubTabType | undefined) => {
  if (tab === undefined) {
    return 0;
  }

  const tabIndex = tabs.indexOf(tab);

  if (tabIndex === -1) {
    return 0;
  }

  return tabIndex;
};
