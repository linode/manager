import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useGetCustomFiltersQuery } from 'src/queries/cloudpulse/customfilters';

import {
  getUserPreferenceObject as fetchUserPrefObject,
  updateGlobalFilterPreference,
} from '../Utils/UserPreference';

import type { FilterValueType } from '../Dashboard/CloudPulseDashboardLanding';
import type { CloudPulseServiceTypeFiltersOptions } from '../Utils/models';
import type { AclpWidget } from '@linode/api-v4';

export interface CloudPulseCustomSelectProps {
  apiResponseIdField?: string;
  apiResponseLabelField?: string;
  clearSelections?: string[];
  dataApiUrl?: string;
  disabled?: boolean;
  errorText?: string;
  filterKey: string;
  filterType: string;
  handleSelectionChange: (filterKey: string, value: FilterValueType) => void;
  isMultiSelect?: boolean;
  maxSelections?: number;
  options?: CloudPulseServiceTypeFiltersOptions[];
  placeholder?: string;
  savePreferences?: boolean;
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
    } = useGetCustomFiltersQuery(
      dataApiUrl ?? '',
      dataApiUrl !== undefined && (disabled !== undefined ? !disabled : true), // enable the query only if we have a valud api URL
      filterKey,
      apiResponseIdField ? apiResponseIdField : 'id',
      apiResponseLabelField ? apiResponseLabelField : 'label'
    );

    let staticErrorText = '';

    const getDefaultSelectionsFromPreferences = React.useCallback(
      (
        defaultValue:
          | { [key: string]: AclpWidget }
          | number
          | number[]
          | string
          | string[]
          | undefined,
        options: CloudPulseServiceTypeFiltersOptions[] | undefined
      ):
        | CloudPulseServiceTypeFiltersOptions
        | CloudPulseServiceTypeFiltersOptions[]
        | undefined => {
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
          const selectedValues = options.filter((option) =>
            (Array.isArray(defaultValue)
              ? defaultValue
              : [defaultValue]
            ).includes(option.id.toString())
          );
          handleSelectionChange(
            filterKey,
            selectedValues.map((option) => option.id)
          );
          return selectedValues;
        }

        // Handle single selection
        const selectedValue = options.find(
          (option) => option.id === defaultValue
        );
        if (selectedValue) {
          handleSelectionChange(filterKey, selectedValue.id);
        }
        return selectedValue;
      },
      [filterKey, handleSelectionChange, isMultiSelect, savePreferences]
    );

    React.useEffect(() => {
      if (!selectedResource) {
        const defaultValue = savePreferences
          ? fetchUserPrefObject()[filterKey]
          : undefined;
        setResource(
          getDefaultSelectionsFromPreferences(
            defaultValue,
            type === CloudPulseSelectTypes.static ? options : queriedResources
          )
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
      if (Array.isArray(value)) {
        handleSelectionChange(
          filterKey,
          value.map((obj) => obj.id.toString())
        );
        updateGlobalFilterPreference({
          [filterKey]: value.map((obj) => obj.id.toString()),
        });
        if (clearSelections) {
          clearSelections.forEach((selection) =>
            updateGlobalFilterPreference({ [selection]: undefined })
          );
        }
        if (maxSelections && value.length > maxSelections) {
          value = value.slice(0, maxSelections);
        }
      } else {
        handleSelectionChange(
          filterKey,
          value ? value.id.toString() : undefined
        );
        updateGlobalFilterPreference({
          [filterKey]: value ? value.id.toString() : null,
        });
      }

      if (!value) {
        updateGlobalFilterPreference({
          [filterKey]: null,
        });
      }

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
  oldProps: CloudPulseCustomSelectProps,
  newProps: CloudPulseCustomSelectProps
) {
  return (
    oldProps.options?.length === newProps.options?.length &&
    oldProps.dataApiUrl === newProps.dataApiUrl
  );
}
