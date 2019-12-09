import { Linode } from 'linode-js-sdk/lib/linodes';
import { APIError } from 'linode-js-sdk/lib/types';
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
  linodesData: Linode[];
  linodesLoading: boolean;
  linodesError?: APIError[];
}

type Override = keyof Linode | ((linode: Linode) => any);

interface Props {
  generalError?: string;
  linodeError?: string;
  className?: string;
  selectedLinode: number | null;
  disabled?: boolean;
  region?: string;
  handleChange: (linode: Linode) => void;
  textFieldProps?: Omit<TextFieldProps, 'label'>;
  groupByRegion?: boolean;
  placeholder?: string;
  valueOverride?: Override;
  labelOverride?: Override;
  filterCondition?: (linode: Linode) => boolean;
  label?: string;
  noOptionsMessage?: string;
  small?: boolean;
  noMarginTop?: boolean;
  value?: Item<any> | null;
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
    groupByRegion,
    className,
    placeholder,
    valueOverride,
    labelOverride,
    filterCondition,
    value
  } = props;

  const linodes = region
    ? linodesData.filter(thisLinode => thisLinode.region === region)
    : linodesData;

  const options = groupByRegion
    ? linodesToGroupedItems(
        linodes,
        valueOverride,
        labelOverride,
        filterCondition
      )
    : linodesToItems(linodes, valueOverride, labelOverride, filterCondition);

  const noOptionsMessage =
    !linodeError && !linodesLoading && options.length === 0
      ? 'You have no Linodes to choose from'
      : 'No Options';

  return (
    <EnhancedSelect
      value={
        // Use the `value` prop if provided.
        typeof value === 'undefined'
          ? groupByRegion
            ? linodeFromGroupedItems(
                options as GroupType<number>[],
                selectedLinode
              )
            : linodeFromItems(options as Item<number>[], selectedLinode)
          : value
      }
      label={props.label || 'Linode'}
      className={className}
      noMarginTop={props.noMarginTop}
      placeholder={placeholder || 'Select a Linode'}
      options={options}
      disabled={disabled}
      small={props.small}
      isLoading={linodesLoading}
      onChange={(selected: Item<number>) => {
        return handleChange(selected.data);
      }}
      errorText={getErrorStringOrDefault(
        generalError || linodeError || linodesError || ''
      )}
      isClearable={false}
      textFieldProps={props.textFieldProps}
      noOptionsMessage={() => props.noOptionsMessage || noOptionsMessage}
    />
  );
};

export default compose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  withLinodes((ownProps, linodesData, linodesLoading, linodesError) => ({
    linodesData,
    linodesLoading,
    linodesError
  }))
)(LinodeSelect);

/**
 * UTILITIES
 */

export const linodesToItems = (
  linodes: Linode[],
  valueOverride?: Override,
  labelOverride?: Override,
  filterCondition?: (linodes: Linode) => boolean
): Item<any>[] => {
  const maybeFilteredLinodes = filterCondition
    ? linodes.filter(filterCondition)
    : linodes;

  return maybeFilteredLinodes.map(thisLinode => ({
    value:
      typeof valueOverride === 'function'
        ? valueOverride(thisLinode)
        : !!valueOverride
        ? thisLinode[valueOverride]
        : thisLinode.id,
    label:
      typeof labelOverride === 'function'
        ? labelOverride(thisLinode)
        : !!labelOverride
        ? labelOverride
        : thisLinode.label,
    data: thisLinode
  }));
};

export const linodeFromItems = (
  linodes: Item<number>[],
  linodeId: number | null
): Item<number> | null => {
  if (!linodeId) {
    return null;
  }

  return (
    linodes.find(thisLinode => {
      return (thisLinode.data as Linode).id === linodeId;
    }) || null
  );
};

// Grouped by Region
export const linodesToGroupedItems = (
  linodes: Linode[],
  valueOverride?: Override,
  labelOverride?: Override,
  filterCondition?: (linodes: Linode) => boolean
) => {
  // We need to filter Linode BEFORE grouping by region, since some regions
  // may become irrelevant when Linodes are filtered.
  const maybeFilteredLinodes = filterCondition
    ? linodes.filter(filterCondition)
    : linodes;

  const groupedByRegion = groupBy((linode: Linode) => linode.region)(
    maybeFilteredLinodes
  );

  const groupedItems = Object.keys(groupedByRegion).map(region => {
    return {
      label: formatRegion(region),
      options: linodesToItems(
        groupedByRegion[region],
        valueOverride,
        labelOverride
      )
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
