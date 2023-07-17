import { groupBy } from 'ramda';
import * as React from 'react';

import EnhancedSelect, {
  GroupType,
  Item,
} from 'src/components/EnhancedSelect/Select';
import { TextFieldProps } from 'src/components/TextField';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useRegionsQuery } from 'src/queries/regions';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import type { Linode } from '@linode/api-v4/lib/linodes';
import type { Region } from '@linode/api-v4/lib/regions';

type Override = ((linode: Linode) => any) | keyof Linode;

interface Props {
  className?: string;
  disabled?: boolean;
  filterCondition?: (linode: Linode) => boolean;
  generalError?: string;
  groupByRegion?: boolean;
  handleChange: (linode: Linode | null) => void;
  inputId?: string;
  isClearable?: boolean;
  label?: string;
  labelOverride?: Override;
  linodeError?: string;
  name?: string;
  noMarginTop?: boolean;
  noOptionsMessage?: string;
  // Formik stuff to be passed down to the inner Select
  onBlur?: (e: any) => void;
  placeholder?: string;
  region?: string;
  required?: boolean;
  selectedLinode: null | number;
  small?: boolean;
  textFieldProps?: Omit<TextFieldProps, 'label'>;
  value?: Item<any> | null;
  valueOverride?: Override;
  width?: number;
}

export const LinodeSelect = (props: Props) => {
  const {
    className,
    disabled,
    filterCondition,
    generalError,
    groupByRegion,
    handleChange,
    inputId,
    isClearable,
    labelOverride,
    linodeError,
    noOptionsMessage,
    placeholder,
    region,
    selectedLinode,
    value,
    valueOverride,
    width,
    ...rest
  } = props;

  const { data: allLinodes, error, isLoading } = useAllLinodesQuery();

  const { data: regions } = useRegionsQuery();

  const onChange = React.useCallback(
    (selected: Item<number> | null) => {
      if (selected === null) {
        handleChange(null);
        return;
      }
      return handleChange(selected.data);
    },
    [handleChange]
  );

  const linodesData = allLinodes ?? [];

  const linodes = region
    ? linodesData.filter((thisLinode) => thisLinode.region === region)
    : linodesData;

  const options = groupByRegion
    ? linodesToGroupedItems(
        linodes,
        regions ?? [],
        valueOverride,
        labelOverride,
        filterCondition
      )
    : linodesToItems(linodes, valueOverride, labelOverride, filterCondition);

  const defaultNoOptionsMessage =
    !linodeError && !isLoading && options.length === 0
      ? 'You have no Linodes to choose from'
      : 'No Options';

  return (
    <div style={{ width: width ? width : '100%' }}>
      <EnhancedSelect
        errorText={getErrorStringOrDefault(
          generalError || linodeError || error || ''
        )}
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
        className={className}
        disabled={disabled}
        inputId={inputId}
        isClearable={isClearable}
        isLoading={isLoading}
        label={props.label || 'Linode'}
        noMarginTop={props.noMarginTop}
        noOptionsMessage={() => noOptionsMessage || defaultNoOptionsMessage}
        onChange={onChange}
        options={options}
        placeholder={placeholder || 'Select a Linode'}
        small={props.small}
        textFieldProps={props.textFieldProps}
        {...rest}
      />
    </div>
  );
};

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

  return maybeFilteredLinodes.map((thisLinode) => ({
    data: thisLinode,
    label:
      typeof labelOverride === 'function'
        ? labelOverride(thisLinode)
        : !!labelOverride
        ? labelOverride
        : thisLinode.label,
    value:
      typeof valueOverride === 'function'
        ? valueOverride(thisLinode)
        : !!valueOverride
        ? thisLinode[valueOverride]
        : thisLinode.id,
  }));
};

export const linodeFromItems = (
  linodes: Item<number>[],
  linodeId: null | number
): Item<number> | null => {
  if (!linodeId) {
    return null;
  }

  return (
    linodes.find((thisLinode) => {
      return (thisLinode.data as Linode).id === linodeId;
    }) || null
  );
};

// Grouped by Region
export const linodesToGroupedItems = (
  linodes: Linode[],
  regions: Region[],
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

  return Object.keys(groupedByRegion).map((region) => {
    return {
      label: regions.find((r) => r.id === region)?.label ?? region,
      options: linodesToItems(
        groupedByRegion[region],
        valueOverride,
        labelOverride
      ),
    };
  });
};

export const linodeFromGroupedItems = (
  groupedOptions: GroupType<number>[],
  linodeId: null | number
) => {
  // I wanted to use Ramda's `flatten()` but the typing is not good.
  const flattenedOptions: Item<number>[] = [];
  groupedOptions.forEach((eachGroup) => {
    flattenedOptions.push(...eachGroup.options);
  });
  return linodeFromItems(flattenedOptions, linodeId);
};
