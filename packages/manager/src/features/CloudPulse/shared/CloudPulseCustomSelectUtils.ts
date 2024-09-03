import type { FilterValueType } from '../Dashboard/CloudPulseDashboardLanding';
import type { CloudPulseServiceTypeFiltersOptions } from '../Utils/models';
import type { AclpConfig } from '@linode/api-v4';

/**
 * The interface for selecting the default value from the user preferences
 */
interface CloudPulseCustomSelectDefaultValueProps {
  /**
   * The filter Key of the current rendered custom select component
   */
  filterKey: string;
  /**
   * The callback for the selection changes happening in the custom select component
   */
  handleSelectionChange: (filterKey: string, value: FilterValueType) => void;

  /**
   * Indicates whether we need multiselect for the component or not
   */
  isMultiSelect: boolean;

  /**
   * The current listed options in the custom select component
   */
  options: CloudPulseServiceTypeFiltersOptions[];

  /**
   * Last selected values from user preference
   */
  preferences?: AclpConfig;

  /**
   * Indicates whether we need to save preferences or not
   */
  savePreferences?: boolean;

  /**
   * Function to update the user preference
   * @param data Data to be updated in the preferences
   */
  updatePreferences?: (data: {}) => void;
}

/**
 * The interface of publishing the selection change and updating the user preferences accordingly
 */
interface CloudPulseCustomSelectionChangeProps {
  /**
   * The list of filters needs to be cleared on selections
   */
  clearSelections: string[];
  /**
   * The current filter key of the rendered custom select component
   */
  filterKey: string;
  /**
   * The callback for the selection changes happening in the custom select component
   */
  handleSelectionChange: (filterKey: string, value: FilterValueType) => void;

  /**
   * The maximum number of selections that needs to be allowed
   */
  maxSelections?: number;

  /**
   * Last selected values from user preference
   */
  preferences?: AclpConfig;

  /**
   * boolean variable to check whether preferences should be saved or not
   */
  savePreferences?: boolean;

  /**
   * Function to update the user preference
   * @param data Data to be updated in the preferences
   */
  updatePreferences?: (data: {}) => void;

  /**
   * The listed options in the custom select component
   */
  value:
    | CloudPulseServiceTypeFiltersOptions
    | CloudPulseServiceTypeFiltersOptions[]
    | null;
}

/**
 * This function returns the default selections based on the user preference and options listed
 * @param defaultSelectionProps - The props needed for getting the default selections
 */
export const getInitialDefaultSelections = (
  defaultSelectionProps: CloudPulseCustomSelectDefaultValueProps
):
  | CloudPulseServiceTypeFiltersOptions
  | CloudPulseServiceTypeFiltersOptions[]
  | undefined => {
  const {
    filterKey,
    handleSelectionChange,
    isMultiSelect,
    options,
    preferences,
    savePreferences,
  } = defaultSelectionProps;

  const defaultValue = savePreferences ? preferences?.[filterKey] : undefined;
  if (!options || options.length === 0) {
    return isMultiSelect ? [] : undefined;
  }

  // Handle the case when there is no default value and preferences are not saved
  if (!defaultValue && !savePreferences) {
    const initialSelection = isMultiSelect ? [options[0]] : options[0];
    handleSelectionChange(
      filterKey,
      isMultiSelect ? [options[0].id] : options[0].id
    );
    return initialSelection;
  }

  const selectedValues = options.filter(({ id }) =>
    (Array.isArray(defaultValue) ? defaultValue : [defaultValue]).includes(
      String(id)
    )
  );

  handleSelectionChange(
    filterKey,
    selectedValues && selectedValues.length > 0
      ? isMultiSelect
        ? selectedValues.map(({ id }) => id)
        : selectedValues[0].id
      : undefined // if this is multiselect, return list of ids, otherwise return single id
  );
  return selectedValues?.length
    ? isMultiSelect
      ? selectedValues
      : selectedValues[0]
    : undefined;
};

/**
 * This functions calls the selection change callback and updates the latest selected filter in the preferences
 * @param selectionChangeProps - The props needed for selecting the new filter and updating the global preferences
 */

export const handleCustomSelectionChange = (
  selectionChangeProps: CloudPulseCustomSelectionChangeProps
):
  | CloudPulseServiceTypeFiltersOptions
  | CloudPulseServiceTypeFiltersOptions[]
  | null => {
  const {
    clearSelections,
    filterKey,
    handleSelectionChange,
    maxSelections,
    savePreferences,
    updatePreferences,
  } = selectionChangeProps;

  let { value } = selectionChangeProps;

  if (Array.isArray(value) && maxSelections && value.length > maxSelections) {
    value = value.slice(0, maxSelections);
  }

  const result = value
    ? Array.isArray(value)
      ? value.map(({ id }) => String(id)) // if array publish list of ids, else only id
      : String(value.id)
    : undefined;

  // publish the selection change
  handleSelectionChange(filterKey, result);

  // update the preferences
  if (savePreferences && updatePreferences) {
    updatePreferences({
      [filterKey]: result,
    });
  }

  // update the clear selections in the preference
  if (clearSelections && savePreferences && updatePreferences) {
    clearSelections.forEach((selection) =>
      updatePreferences({ [selection]: undefined })
    );
  }

  return value;
};
