import * as React from 'react';
import Select, { BaseSelectProps, Item } from 'src/components/EnhancedSelect';
import { useAllLinodesQuery } from 'src/queries/linodes';
import { Linode } from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';

export interface Props extends Partial<BaseSelectProps> {
  selectedLinodes?: number[];
  allowedRegions?: string[];
  filteredLinodes?: number[];
  helperText?: string;
  showAllOption?: boolean;
  handleChange: (selected: number[]) => void;
}

export const LinodeMultiSelect: React.FC<Props> = (props) => {
  const {
    allowedRegions,
    errorText,
    filteredLinodes,
    selectedLinodes,
    helperText,
    handleChange,
    showAllOption,
    ...selectProps
  } = props;

  const { data, isLoading, error } = useAllLinodesQuery();

  const linodes = data ?? [];

  const _filteredLinodes = filteredLinodes ?? [];

  const filteredLinodesData = React.useMemo(
    () =>
      linodes.filter(
        (thisLinode) =>
          !_filteredLinodes.includes(thisLinode.id) &&
          // If allowedRegions wasn't passed, don't use region as a filter.
          (!allowedRegions || allowedRegions.includes(thisLinode.region))
      ),
    [allowedRegions, _filteredLinodes, linodes]
  );

  const linodeError = error?.[0]?.reason;

  const [selectAll, toggleSelectAll] = React.useState<boolean>(false);

  /**
   * Update the current list of selected Linodes.
   *
   * This will call whatever state management function is passed as the
   * handleChange prop.
   *
   * - If the user has clicked the "All Linodes" option, we will short circuit
   * and call the handler with a list of all Linodes.
   *
   * - In some cases, such as Firewall devices, we don't want to submit with
   * all Linodes even if the user has selected this option, since the API will
   * return an error if you try to re-add an existing Device. We provide the
   * filteredLinodes prop to allow this. When selectAll is true and filteredLinodes
   * is provided, we will call the handler with a list of all Linodes *except* those
   * in the filteredLinodes array.
   *
   */
  const handleSelectLinodes = (selectedLinodes: Item<number>[]) => {
    const hasSelectedAll =
      !!showAllOption && userSelectedAllLinodes(selectedLinodes);
    toggleSelectAll(hasSelectedAll);
    const newSelectedLinodes = hasSelectedAll
      ? filteredLinodesData.map((eachLinode) => eachLinode.id)
      : selectedLinodes.map((eachValue) => eachValue.value);
    handleChange(newSelectedLinodes);
  };

  const value = selectedLinodes
    ? selectedLinodes.map((thisLinodeID) => {
        const thisLinode = linodes.find(
          (eachLinode) => eachLinode.id === thisLinodeID
        );
        return {
          value: thisLinodeID,
          label: thisLinode?.label ?? thisLinodeID,
        };
      })
    : undefined;

  return (
    <Select
      label="Linodes"
      name="linodes"
      value={value}
      isLoading={isLoading}
      errorText={linodeError || errorText}
      isMulti
      options={generateOptions(
        selectAll,
        !!showAllOption,
        filteredLinodesData,
        error
      )}
      noOptionsMessage={() =>
        filteredLinodesData.length === 0 || selectAll
          ? 'No Linodes available.'
          : 'No results.'
      }
      onChange={handleSelectLinodes}
      placeholder="Select a Linode or type to search..."
      aria-label="Select one or more Linodes"
      textFieldProps={{
        helperTextPosition: 'top',
        helperText,
      }}
      hideSelectedOptions={true}
      {...selectProps}
    />
  );
};

export const generateOptions = (
  allLinodesAreSelected: boolean,
  showAllOption: boolean,
  linodesData: Linode[],
  linodeError: APIError[] | null | undefined
): Item<any>[] => {
  /** if there's an error, don't show any options */
  if (linodeError) {
    return [];
  }

  if (linodesData.length === 0) {
    return [];
  }

  const items = linodesData.map((eachLinode) => ({
    value: eachLinode.id,
    label: eachLinode.label,
  }));

  /** If there's no show all, just return the list of Items. */
  if (!showAllOption) {
    return items;
  }

  return allLinodesAreSelected
    ? [
        {
          value: 'ALL',
          label: 'All Linodes',
        },
      ]
    : [
        {
          value: 'ALL',
          label: 'All Linodes',
        },
        ...items,
      ];
};

export const userSelectedAllLinodes = (values: Item<string | number>[]) =>
  values.some((eachValue) => eachValue.value === 'ALL');

export default React.memo(LinodeMultiSelect);
