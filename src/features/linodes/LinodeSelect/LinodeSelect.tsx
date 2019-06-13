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

interface Props {
  generalError?: string;
  linodeError?: string;
  selectedLinode: number | null;
  disabled?: boolean;
  region?: string;
  handleChange: (linode: Linode.Linode) => void;
  textFieldProps?: TextFieldProps;
  label?: string;
}

type CombinedProps = Props & WithLinodesProps;

const linodesToItems = (linodes: Linode.Linode[]): Item<number>[] =>
  linodes.map(thisLinode => ({
    value: thisLinode.id,
    label: thisLinode.label,
    data: thisLinode
  }));

const linodeFromItems = (
  linodes: Item<number>[],
  linodeId: number | null
): Item<number> | null => {
  if (!linodeId) {
    return null;
  }
  return linodes.find(thisLinode => thisLinode.value === linodeId) || null;
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
    label
  } = props;

  const linodes = region
    ? linodesData.filter(thisLinode => thisLinode.region === region)
    : linodesData;
  const options = linodesToItems(linodes);

  const noOptionsMessage =
    !linodeError && !linodesLoading && options.length === 0
      ? 'You have no Linodes to choose from'
      : 'No Options';

  return (
    <EnhancedSelect
      label={label ? label : 'Linode'}
      placeholder="Select a Linode"
      value={linodeFromItems(options, selectedLinode)}
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
