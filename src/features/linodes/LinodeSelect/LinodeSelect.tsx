import { groupBy } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import EnhancedSelect, {
  GroupType,
  Item
} from 'src/components/EnhancedSelect/Select';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import { Props as TextFieldProps } from 'src/components/TextField';
import withLinodes from 'src/containers/withLinodes.container';
import { formatRegion } from 'src/utilities';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

interface WithLinodesProps {
  linodesData: Linode.Linode[];
  linodesLoading: boolean;
  linodesError?: Linode.ApiFieldError[];
}

interface Props {
  generalError?: string;
  linodeError?: string;
  selectedLinode: number | null;
  disabled?: boolean;
  region?: string;
  handleChange: (linode: Linode.Linode) => void;
  textFieldProps?: TextFieldProps;
  label?: string;
  excludedLinodes?: number[];
  groupByRegion?: boolean;
}

type CombinedProps = Props & WithLinodesProps;

const LinodeSelect: React.StatelessComponent<CombinedProps> = props => {
  const {
    disabled,
    generalError,
    handleChange,
    linodeError,
    linodesError,
    linodesLoading,
    linodesData,
    region,
    selectedLinode,
    excludedLinodes,
    label,
    groupByRegion
  } = props;

  let linodes = region
    ? linodesData.filter(thisLinode => thisLinode.region === region)
    : linodesData;

  linodes = excludedLinodes
    ? linodes.filter(thisLinode => !excludedLinodes.includes(thisLinode.id))
    : linodes;

  const options = groupByRegion
    ? linodesToGroupedItems(linodes)
    : linodesToItems(linodes);

  const noOptionsMessage =
    !linodeError && !linodesLoading && options.length === 0
      ? 'You have no Linodes to choose from'
      : 'No Options';

  return (
    <EnhancedSelect
      label={label ? label : 'Linode'}
      placeholder="Select a Linode"
      value={
        groupByRegion
          ? linodeFromGroupedItems(
              options as GroupType<number>[],
              selectedLinode
            )
          : linodeFromItems(options as Item<number>[], selectedLinode)
      }
      options={options}
      disabled={disabled}
      isLoading={linodesLoading}
      onChange={(selected: Item<number>) => {
        return handleChange(selected.data);
      }}
      errorText={getErrorStringOrDefault(
        generalError || linodeError || linodesError || ''
      )}
      isClearable={false}
      textFieldProps={props.textFieldProps}
      noOptionsMessage={() => noOptionsMessage}
    />
  );
};

export default compose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  withLinodes((ownProps, linodesData, linodesLoading, linodesError) => ({
    ...ownProps,
    linodesData,
    linodesLoading,
    linodesError
  }))
)(LinodeSelect);

/**
 * UTILITIES
 */

export const linodesToItems = (linodes: Linode.Linode[]): Item<number>[] =>
  linodes.map(thisLinode => ({
    value: thisLinode.id,
    label: thisLinode.label,
    data: thisLinode
  }));

export const linodeFromItems = (
  linodes: Item<number>[],
  linodeId: number | null
): Item<number> | null => {
  if (!linodeId) {
    return null;
  }
  return linodes.find(thisLinode => thisLinode.value === linodeId) || null;
};

// Grouped by Region
export const linodesToGroupedItems = (linodes: Linode.Linode[]) => {
  const groupedByRegion = groupBy((linode: Linode.Linode) => linode.region)(
    linodes
  );

  const groupedItems = Object.keys(groupedByRegion).map(region => {
    return {
      label: formatRegion(region),
      options: linodesToItems(groupedByRegion[region])
    };
  });

  return groupedItems;
};

export const linodeFromGroupedItems = (
  groupedOptions: GroupType<number>[],
  linodeId: number | null
) => {
  // I wanted to use Ramda's `flatten()` but the typing is not good.
  const flattenedOptions: Item<number>[] = [];
  groupedOptions.forEach(eachGroup => {
    flattenedOptions.push(...eachGroup.options);
  });
  return linodeFromItems(flattenedOptions, linodeId);
};
