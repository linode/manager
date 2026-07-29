import { usePreferences } from '@linode/queries';

export const useHasTableStripingEnabled = (): boolean => {
  const { data } = usePreferences();
  const tableStrippingPreference = data?.isTableStripingEnabled;

  /**
   * If the preference is not set, default to enabling table striping.
   */
  if (tableStrippingPreference === undefined) {
    return true;
  }

  return tableStrippingPreference === true;
};
