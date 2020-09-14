import * as React from 'react';
import { compose } from 'recompose';
import Select, { BaseSelectProps, Item } from 'src/components/EnhancedSelect';
import withLinodes, {
  Props as LinodeProps
} from 'src/containers/withLinodes.container';

export interface Props extends Partial<BaseSelectProps> {
  allowedRegions?: string[];
  filteredLinodes?: number[];
  helperText?: string;
  showAllOption?: boolean;
  handleChange: (selected: number[]) => void;
}

export type CombinedProps = Props & LinodeProps;

export const LinodeMultiSelect: React.FC<CombinedProps> = props => {
  const {
    allowedRegions,
    errorText,
    filteredLinodes,
    helperText,
    linodesData,
    linodesError,
    linodesLoading,
    handleChange,
    showAllOption,
    ...selectProps
  } = props;

  const _filteredLinodes = filteredLinodes ?? [];

  const filteredLinodesData = React.useMemo(
    () =>
      linodesData.filter(
        thisLinode =>
          !_filteredLinodes.includes(thisLinode.id) &&
          // If allowedRegions wasn't passed, don't use region as a filter.
          (!allowedRegions || allowedRegions.includes(thisLinode.region))
      ),
    [allowedRegions, _filteredLinodes, linodesData]
  );

  const linodeError = linodesError && linodesError[0]?.reason;

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
      ? filteredLinodesData.map(eachLinode => eachLinode.id)
      : selectedLinodes.map(eachValue => eachValue.value);
    handleChange(newSelectedLinodes);
  };

  return (
    <Select
      label="Linodes"
      name="linodes"
      isLoading={linodesLoading}
      errorText={linodeError || errorText}
      isMulti
      options={generateOptions(
        selectAll,
        !!showAllOption,
        filteredLinodesData,
        linodesError
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
        helperText
      }}
      hideSelectedOptions={true}
      {...selectProps}
    />
  );
};

export const generateOptions = (
  allLinodesAreSelected: boolean,
  showAllOption: boolean,
  linodesData: LinodeProps['linodesData'],
  linodeError: LinodeProps['linodesError']
): Item<any>[] => {
  /** if there's an error, don't show any options */
  if (linodeError) {
    return [];
  }

  if (linodesData.length === 0) {
    return [];
  }

  const items = linodesData.map(eachLinode => ({
    value: eachLinode.id,
    label: eachLinode.label
  }));

  /** If there's no show all, just return the list of Items. */
  if (!showAllOption) {
    return items;
  }

  return allLinodesAreSelected
    ? [
        {
          value: 'ALL',
          label: 'All Linodes'
        }
      ]
    : [
        {
          value: 'ALL',
          label: 'All Linodes'
        },
        ...items
      ];
};

export const userSelectedAllLinodes = (values: Item<string | number>[]) =>
  values.some(eachValue => eachValue.value === 'ALL');

const enhanced = compose<CombinedProps, Props>(React.memo, withLinodes());

export default enhanced(LinodeMultiSelect);
