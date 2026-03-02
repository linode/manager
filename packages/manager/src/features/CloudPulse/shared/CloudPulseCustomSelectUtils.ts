import { clearChildPreferences } from '../Utils/UserPreference';

import type { FilterValueType } from '../Dashboard/CloudPulseDashboardLanding';
import type { CloudPulseServiceTypeFiltersOptions } from '../Utils/models';
import type { AclpConfig, FilterValue } from '@linode/api-v4';

interface CloudPulseCustomSelectProps {
  /**
   * The current filter key of the rendered custom select component
   */
  filterKey: string;

  /**
   * The callback for the selection changes happening in the custom select component
   */
  handleSelectionChange: (
    filterKey: string,
    value: FilterValueType,
    labels: string[],
    savePref?: boolean,
    updatedPreferenceData?: AclpConfig
  ) => void;

  /**
   * Last selected values from user preference
   */
  preferences?: AclpConfig;

  /**
   * boolean variable to check whether preferences should be saved or not
   */
  savePreferences?: boolean;
}

/**
 * The interface for selecting the default value from the user preferences
 */
interface CloudPulseCustomSelectDefaultValueProps
  extends CloudPulseCustomSelectProps {
  /**
   * Default selected value from the drop down
   */
  defaultValue?: FilterValue;

  /**
   * boolean variable to check whether the component is optional or not
   */
  isOptional?: boolean;

  /**
   * Last selected values from user preference
   */
  preferences?: AclpConfig;

  /**
   * boolean variable to check whether preferences should be saved or not
   */
  savePreferences?: boolean;
}

/**
 * The interface for selecting the default value from the user preferences
 */
interface CloudPulseCustomSelectDefaultValueProps
  extends CloudPulseCustomSelectProps {
  /**
   * Default selected value from the drop down
   */
  defaultValue?: FilterValue;

  /**
   * Last selected values from user preference
   */
  preferences?: AclpConfig;

  /**
   * boolean variable to check whether preferences should be saved or not
   */
  savePreferences?: boolean;
}

/**
 * The interface for selecting the default value from the user preferences
 */
interface CloudPulseCustomSelectDefaultValueProps
  extends CloudPulseCustomSelectProps {
  /**
   * Indicates whether we need multiselect for the component or not
   */
  isMultiSelect: boolean;

  /**
   * The current listed options in the custom select component
   */
  options: CloudPulseServiceTypeFiltersOptions[];
}

/**
 * The interface of publishing the selection change and updating the user preferences accordingly
 */
interface CloudPulseCustomSelectionChangeProps
  extends CloudPulseCustomSelectProps {
  /**
   * The list of filters needs to be cleared on selections
   */
  clearSelections: string[];

  /**
   * Id of the selected dashboard
   */
  dashboardId: number;

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
 */
export const getInitialDefaultSelections = (
  defaultSelectionProps: CloudPulseCustomSelectDefaultValueProps
):
  | CloudPulseServiceTypeFiltersOptions
  | CloudPulseServiceTypeFiltersOptions[]
  | undefined => {
  const {
    defaultValue,
    filterKey,
    handleSelectionChange,
    isMultiSelect,
    options,
    savePreferences,
    isOptional,
  } = defaultSelectionProps;

  if (!options || options.length === 0) {
    return isMultiSelect ? [] : undefined;
  }

  // Handle the case when there is no default value and preferences are not saved
  if (!defaultValue && !savePreferences && !isOptional) {
    const initialSelection = isMultiSelect ? [options[0]] : options[0];
    handleSelectionChange(
      filterKey,
      isMultiSelect ? [options[0].id] : options[0].id,
      [options[0].label]
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
      : undefined, // if this is multiselect, return list of ids, otherwise return single id
    selectedValues && selectedValues.length > 0
      ? isMultiSelect
        ? selectedValues.map(({ label }) => label)
        : [selectedValues[0].label]
      : []
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
    dashboardId,
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

  const labels = value
    ? Array.isArray(value)
      ? value.map(({ label }) => label)
      : [value.label]
    : [];

  let updatedPreferenceData: AclpConfig = {};

  // update the preferences
  if (savePreferences) {
    updatedPreferenceData = {
      ...clearChildPreferences(dashboardId, filterKey),
      [filterKey]: result,
    };
  }

  // update the clear selections in the preference
  if (clearSelections && savePreferences) {
    clearSelections.forEach(
      (selection) =>
        (updatedPreferenceData = {
          ...updatedPreferenceData,
          [selection]: undefined,
        })
    );
  }
  // publish the selection change
  handleSelectionChange(
    filterKey,
    result,
    labels,
    savePreferences,
    updatedPreferenceData
  );
  return value;
};
