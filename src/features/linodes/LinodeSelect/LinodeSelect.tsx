import * as React from 'react';
import { compose } from 'recompose';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import { Props as TextFieldProps } from 'src/components/TextField';
import withLinodes from 'src/containers/withLinodes.container';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

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
}

type CombinedProps = Props & WithLinodesProps & WithStyles<ClassNames>;

const linodesToItems = (linodes: Linode.Linode[]): Item<number>[] =>
  linodes.map(thisLinode => ({
    value: thisLinode.id,
    label: thisLinode.label,
    data: thisLinode
  }));

const linodeFromItems = (linodes: Item<number>[], linodeId: number | null) => {
  if (!linodeId) {
    return;
  }
  return linodes.find(thisLinode => thisLinode.value === linodeId);
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
    selectedLinode
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
      label="Linode"
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

const styled = withStyles(styles);

export default compose<CombinedProps, Props & RenderGuardProps>(
  styled,
  RenderGuard,
  withLinodes((ownProps, linodesData, linodesLoading, linodesError) => ({
    ...ownProps,
    linodesData,
    linodesLoading,
    linodesError
  }))
)(LinodeSelect);
