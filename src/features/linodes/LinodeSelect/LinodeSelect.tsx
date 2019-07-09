import * as React from 'react';
import { compose } from 'recompose';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import { Props as TextFieldProps } from 'src/components/TextField';
import withLinodes from 'src/containers/withLinodes.container';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

interface WithLinodesProps {
  linodesData: Linode.Linode[];
  linodesLoading: boolean;
  linodesError?: Linode.ApiFieldError[];
}

type Override = keyof Linode.Linode | ((linode: Linode.Linode) => any);

interface Props {
  generalError?: string;
  linodeError?: string;
  className?: string;
  selectedLinode: number | null;
  disabled?: boolean;
  region?: string;
  handleChange: (linode: Linode.Linode) => void;
  textFieldProps?: TextFieldProps;
  placeholder?: string;
  valueOverride?: Override;
  labelOverride?: Override;
  filterCondition?: (linode: Linode.Linode) => boolean;
  label?: string;
  noOptionsMessage?: string;
  small?: boolean;
  noMarginTop?: boolean;
  value?: Item<any> | null;
}

type CombinedProps = Props & WithLinodesProps;

const linodesToItems = (
  linodes: Linode.Linode[],
  valueOverride?: Override,
  labelOverride?: Override,
  filterCondition?: (linodes: Linode.Linode) => boolean
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

const linodeFromItems = (linodes: Item<number>[], linodeId: number | null) => {
  if (!linodeId) {
    return undefined;
  }

  return linodes.find(thisLinode => {
    return (thisLinode.data as Linode.Linode).id === linodeId;
  });
};

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
  const options = linodesToItems(
    linodes,
    valueOverride,
    labelOverride,
    filterCondition
  );

  const noOptionsMessage =
    !linodeError && !linodesLoading && options.length === 0
      ? 'You have no Linodes to choose from'
      : 'No Options';

  return (
    <EnhancedSelect
      label={props.label || 'Linode'}
      className={className}
      noMarginTop={props.noMarginTop}
      placeholder={placeholder || 'Select a Linode'}
      /**
       * react-select wants you to pass null to clear out the value so we need
       * to allow the parent to pass that. This solves for the situiation where
       *
       * 1. Navigate to Create NodeBalancer Form
       * 2. Select region
       * 3. Select Node Config Node IP Address
       * 4. Click different region
       * 5. IP Address _should_ be cleared
       */
      value={
        typeof value === 'undefined'
          ? linodeFromItems(options, selectedLinode)
          : value
      }
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
    ...ownProps,
    linodesData,
    linodesLoading,
    linodesError
  }))
)(LinodeSelect);
