import deepEqual from 'fast-deep-equal';
import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useGetCustomFiltersQuery } from 'src/queries/cloudpulse/customfilters';

import {
  callSelectionChangeAndUpdateGlobalFilters,
  getDefaultSelectionsFromPreferences,
} from '../Utils/CustomSelectUtils';
import { getUserPreferenceObject as fetchUserPrefObject } from '../Utils/UserPreference';

import type { FilterValueType } from '../Dashboard/CloudPulseDashboardLanding';
import type { CloudPulseServiceTypeFiltersOptions } from '../Utils/models';

/**
 * This is the properties requires for CloudPulseCustomSelect Components
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
   * The selections to be cleared on some filter updates
   */
  clearSelections?: string[];

  /**
   * The api URL which contains the list of filters, passed when the select type is dynamic
   */
  dataApiUrl?: string;

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
   */
  handleSelectionChange: (filterKey: string, value: FilterValueType) => void;

  /**
   * If true, multiselect is allowed, otherwise false
   */
  isMultiSelect?: boolean;
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
  static,
}

export const CloudPulseCustomSelect = React.memo(
  (props: CloudPulseCustomSelectProps) => {
    const {
      apiResponseIdField,
      apiResponseLabelField,
      clearSelections,
      dataApiUrl,
      disabled,
      filterKey,
      handleSelectionChange,
      isMultiSelect,
      maxSelections,
      options,
      placeholder,
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
      enabled:
        dataApiUrl !== undefined && (disabled !== undefined ? !disabled : true), // enable the query only if we have a valid api URL
      filter: {},
      idField: apiResponseIdField ? apiResponseIdField : 'id',
      labelField: apiResponseLabelField ? apiResponseLabelField : 'label',
      url: dataApiUrl ?? '',
    });

    let staticErrorText = '';

    React.useEffect(() => {
      if (!selectedResource) {
        const defaultValue = savePreferences
          ? fetchUserPrefObject()[filterKey]
          : undefined;
        setResource(
          getDefaultSelectionsFromPreferences(defaultValue, {
            filterKey,
            handleSelectionChange,
            isMultiSelect: isMultiSelect ?? false,
            options: options ?? [],
            savePreferences: savePreferences ?? false,
          })
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [savePreferences, options, dataApiUrl]); // only execute this use efffect one time or if savePreferences or options or dataApiUrl changes

    const handleChange = (
      _: React.SyntheticEvent,
      value:
        | CloudPulseServiceTypeFiltersOptions
        | CloudPulseServiceTypeFiltersOptions[]
        | null
    ) => {
      callSelectionChangeAndUpdateGlobalFilters({
        clearSelections: clearSelections ?? [],
        filterKey,
        handleSelectionChange,
        maxSelections,
        value,
      });
      setResource(Array.isArray(value) ? [...value] : value ?? undefined);
    };

    // check for input prop errors
    if (
      CloudPulseSelectTypes.static === type &&
      (!options || options.length === 0)
    ) {
      staticErrorText = 'Pass predefined options for static select type';
    }

    if (CloudPulseSelectTypes.dynamic === type && !dataApiUrl) {
      staticErrorText = 'Pass API Url for dynamic select type';
    }

    return (
      <Autocomplete
        disabled={
          ((isLoading || isError) && type === CloudPulseSelectTypes.dynamic) ||
          (!queriedResources && !(options && options.length)) ||
          staticErrorText.length > 0
        }
        errorText={
          staticErrorText.length > 0
            ? staticErrorText
            : isError
            ? 'Error while loading from API'
            : ''
        }
        options={
          type === CloudPulseSelectTypes.static
            ? options || []
            : queriedResources || []
        }
        textFieldProps={{
          hideLabel: true,
        }}
        getOptionLabel={(option) => option.label ?? ''}
        isOptionEqualToValue={(option, value) => option.label === value.label}
        label="Select a Value"
        multiple={isMultiSelect}
        onChange={handleChange}
        placeholder={placeholder ? placeholder : 'Select a Value'}
        value={selectedResource ? selectedResource : isMultiSelect ? [] : null}
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
    'dataApiUrl',
    'disabled',
  ];

  for (const key of keysToCompare) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  // Deep comparison for options
  if (!deepEqual(prevProps.options, nextProps.options)) {
    return false;
  }

  // Ignore function props in comparison
  return true;
}
