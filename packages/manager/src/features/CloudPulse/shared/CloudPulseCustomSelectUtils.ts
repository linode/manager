import {
  getUserPreferenceObject,
  updateGlobalFilterPreference,
} from '../Utils/UserPreference';

import type { FilterValueType } from '../Dashboard/CloudPulseDashboardLanding';
import type { CloudPulseServiceTypeFiltersOptions } from '../Utils/models';

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
   * This indicates whether we need multiselect for the component or not
   */
  isMultiSelect: boolean;

  /**
   * The current listed options in the custom select component
   */
  options: CloudPulseServiceTypeFiltersOptions[];

  /**
   * This indicates whether we need to save preferences or not
   */
  savePreferences: boolean;
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
 * @returns
 */
export const getDefaultSelectionsFromPreferencesAndPublishSelectionChanges = (
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
    savePreferences,
  } = defaultSelectionProps;

  const defaultValue = savePreferences
    ? getUserPreferenceObject()[filterKey]
    : undefined;
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

  if (isMultiSelect) {
    // Handle multiple selections
    const selectedValues = options.filter(({ id }) =>
      (Array.isArray(defaultValue) ? defaultValue : [defaultValue]).includes(
        String(id)
      )
    );
    handleSelectionChange(
      filterKey,
      selectedValues.map(({ id }) => id)
    );
    return selectedValues;
  }

  // Handle single selection
  const selectedValue = options.find(({ id }) => id === defaultValue);
  if (selectedValue) {
    handleSelectionChange(filterKey, selectedValue.id);
  }
  return selectedValue;
};

/**
 * This functions calls the selection change callback and updates the latest selected filter in the preferences
 * @param selectionChangeProps - The props needed for selecting the new filter and updating the global preferences
 */

export const callSelectionChangeAndUpdateGlobalFilters = (
  selectionChangeProps: CloudPulseCustomSelectionChangeProps
) => {
  const {
    clearSelections,
    filterKey,
    handleSelectionChange,
    maxSelections,
  } = selectionChangeProps;

  let { value } = selectionChangeProps;
  if (Array.isArray(value)) {
    // in multi select case, it will be an array, apply maxselections if provided
    if (maxSelections && value.length > maxSelections) {
      value = value.slice(0, maxSelections);
    }

    // pubish the selection change
    handleSelectionChange(
      filterKey,
      value.map(({ id }) => id.toString())
    );

    // update the preferences
    updateGlobalFilterPreference({
      [filterKey]: value.map(({ id }) => id.toString()),
    });

    // update the clear selections in the preference
    if (clearSelections) {
      clearSelections.forEach((selection) =>
        updateGlobalFilterPreference({ [selection]: undefined })
      );
    }
  } else {
    // in case of non multi select, just publish the changes and update the preferences
    handleSelectionChange(filterKey, value ? value.id.toString() : undefined);
    updateGlobalFilterPreference({
      [filterKey]: value ? value.id.toString() : null,
    });
  }

  if (!value) {
    updateGlobalFilterPreference({
      [filterKey]: null,
    });
  }
};
