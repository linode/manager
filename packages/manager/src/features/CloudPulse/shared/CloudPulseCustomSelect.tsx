import { Autocomplete } from '@linode/ui';
import React from 'react';

import { useGetCustomFiltersQuery } from 'src/queries/cloudpulse/customfilters';

import {
  getInitialDefaultSelections,
  handleCustomSelectionChange,
} from './CloudPulseCustomSelectUtils';

import type { FilterValueType } from '../Dashboard/CloudPulseDashboardLanding';
import type {
  CloudPulseServiceTypeFiltersOptions,
  QueryFunctionAndKey,
} from '../Utils/models';
import type { AclpConfig, FilterValue } from '@linode/api-v4';

/**
 * These are the properties requires for CloudPulseCustomSelect Components
 *
 */
export interface CloudPulseCustomSelectProps {
  /**
   * The id field of the response returned from the API
   */
  apiResponseIdField?: string;

  /**
   * The label field of the response returned from the API
   */
  apiResponseLabelField?: string;

  /**
   * The api query key factory which contains the queries to fetch the list of filters, passed when the select type is dynamic
   */
  apiV4QueryKey?: QueryFunctionAndKey;

  /**
   * The dependent selections to be cleared on this filter update
   */
  clearDependentSelections?: string[];

  /**
   * Last selected values from user preferences
   */
  defaultValue?: FilterValue;

  /**
   * This property says, whether or not to disable the selection component
   */
  disabled?: boolean;

  /**
   * The errorText that needs to be displayed
   */
  errorText?: string;

  /**
   * The filterKey that needs to be used
   */
  filterKey: string;
  /**
   * The type of the filter like string, number etc.,
   */
  filterType: string;

  /**
   * The callback function , that will be called on a filter change
   * @param filterKey - The filterKey of the component
   * @param value - The selected filter value
   * @param labels - Labels of the selected filter value
   */
  handleSelectionChange: (
    filterKey: string,
    value: FilterValueType,
    labels: string[],
    savePref?: boolean,
    updatedPreferenceData?: AclpConfig
  ) => void;

  /**
   * If true, multiselect is allowed, otherwise false
   */
  isMultiSelect?: boolean;

  label: string;

  /**
   * The maximum selections that the user can make incase of multiselect
   */
  maxSelections?: number;

  /**
   * The options to be listed down in the autocomplete if the select type is static
   */
  options?: CloudPulseServiceTypeFiltersOptions[];

  /**
   * The placeholder that needs to displayed
   */
  placeholder?: string;

  preferences?: AclpConfig;

  /**
   * This property controls whether to save the preferences or not
   */
  savePreferences?: boolean;

  /**
   * The cloud pulse select types, it can be static or dynamic depending on the use case
   */
  type: CloudPulseSelectTypes;
}

export enum CloudPulseSelectTypes {
  dynamic,
  // eslint-disable-next-line sonarjs/future-reserved-words
  static,
}

export const CloudPulseCustomSelect = React.memo(
  (props: CloudPulseCustomSelectProps) => {
    const {
      apiResponseIdField,
      apiResponseLabelField,
      apiV4QueryKey,
      clearDependentSelections,
      defaultValue,
      disabled,
      filterKey,
      handleSelectionChange,
      isMultiSelect,
      label,
      maxSelections,
      options,
      placeholder,
      preferences,
      savePreferences,
      type,
    } = props;

    const [selectedResource, setResource] = React.useState<
      | CloudPulseServiceTypeFiltersOptions
      | CloudPulseServiceTypeFiltersOptions[]
      | undefined
    >();

    const {
      data: queriedResources,
      isError,
      isLoading,
    } = useGetCustomFiltersQuery({
      apiV4QueryKey,
      enabled: Boolean(apiV4QueryKey && !disabled),
      filter: {},
      idField: apiResponseIdField ?? 'id',
      labelField: apiResponseLabelField ?? 'label',
    });

    React.useEffect(() => {
      if (!selectedResource) {
        setResource(
          getInitialDefaultSelections({
            defaultValue,
            filterKey,
            handleSelectionChange,
            isMultiSelect: isMultiSelect ?? false,
            options: options || queriedResources || [],
            preferences,
            savePreferences: savePreferences ?? false,
          })
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [savePreferences, options, apiV4QueryKey, queriedResources]); // only execute this use efffect one time or if savePreferences or options or dataApiUrl changes

    const handleChange = (
      _: React.SyntheticEvent,
      value:
        | CloudPulseServiceTypeFiltersOptions
        | CloudPulseServiceTypeFiltersOptions[]
        | null
    ) => {
      const filteredValue = handleCustomSelectionChange({
        clearSelections: clearDependentSelections ?? [],
        filterKey,
        handleSelectionChange,
        maxSelections,
        savePreferences,
        value,
      });
      setResource(
        Array.isArray(filteredValue)
          ? [...filteredValue]
          : (filteredValue ?? undefined)
      );
    };

    let staticErrorText = '';
    // check for input prop errors
    if (
      (CloudPulseSelectTypes.static === type &&
        (!options || options.length === 0)) ||
      (CloudPulseSelectTypes.dynamic === type && !apiV4QueryKey)
    ) {
      staticErrorText = 'Pass either options or API query key';
    }

    const isAutoCompleteDisabled =
      disabled ||
      ((isLoading || isError) && type === CloudPulseSelectTypes.dynamic) ||
      (!queriedResources && !(options && options.length)) ||
      staticErrorText.length > 0;

    staticErrorText =
      staticErrorText.length > 0
        ? staticErrorText
        : isError
          ? 'Error while loading from API'
          : '';

    return (
      <Autocomplete
        autoHighlight
        disabled={isAutoCompleteDisabled}
        errorText={staticErrorText}
        isOptionEqualToValue={(option, value) => option.label === value.label}
        label={label || 'Select a Value'}
        multiple={isMultiSelect}
        noMarginTop
        onChange={handleChange}
        options={
          type === CloudPulseSelectTypes.static
            ? (options ?? [])
            : (queriedResources ?? [])
        }
        placeholder={
          selectedResource &&
          (!Array.isArray(selectedResource) || selectedResource.length)
            ? ''
            : placeholder || 'Select a Value'
        }
        slotProps={{
          popper: {
            placement: 'bottom',
          },
        }}
        value={selectedResource ?? (isMultiSelect ? [] : null)}
      />
    );
  },
  compareProps
);

function compareProps(
  prevProps: CloudPulseCustomSelectProps,
  nextProps: CloudPulseCustomSelectProps
): boolean {
  // these properties can be extended going forward
  const keysToCompare: (keyof CloudPulseCustomSelectProps)[] = [
    'apiV4QueryKey',
    'disabled',
  ];

  for (const key of keysToCompare) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  // Ignore function props in comparison
  return true;
}
