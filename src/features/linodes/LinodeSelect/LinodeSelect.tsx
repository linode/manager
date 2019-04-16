import * as React from 'react';
import { compose } from 'recompose';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import withLinodes from 'src/containers/withLinodes.container';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface WithLinodesProps {
  linodesData: Linode.Linode[];
  linodesLoading: boolean;
  linodesError?: string;
}

interface Props {
  generalError?: string;
  linodeError?: string;
  selectedLinode: number | null;
  disabled?: boolean;
  region?: string;
  handleChange: (linodeId: number | null) => void;
}

type CombinedProps = Props & WithLinodesProps & WithStyles<ClassNames>;

const linodesToItems = (linodes: Linode.Linode[]): Item<number>[] =>
  linodes.map(thisLinode => ({
    value: thisLinode.id,
    label: thisLinode.label
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

  return (
    <EnhancedSelect
      label="Linode"
      placeholder="Select a Linode"
      value={linodeFromItems(options, selectedLinode)}
      options={options}
      disabled={disabled}
      isLoading={linodesLoading}
      onChange={(selected: Item<number> | null) =>
        handleChange(selected ? selected.value : null)
      }
      errorText={generalError || linodeError || linodesError}
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
