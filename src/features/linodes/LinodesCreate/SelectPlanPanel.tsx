import * as React from 'react';
import { isEmpty } from 'ramda';

import { withStyles, StyleRulesCallback, WithStyles, Theme } from 'material-ui';

import Grid from 'src/components/Grid';

import TabbedPanel from '../../../components/TabbedPanel';
import { Tab } from '../../../components/TabbedPanel/TabbedPanel';
import SelectionCard from '../../../components/SelectionCard';

export interface ExtendedType extends Linode.LinodeType {
  heading: string;
  subHeadings: [string, string];
}

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    marginTop: theme.spacing.unit * 3,
  },
});

export interface Props {
  types: ExtendedType[];
  error?: string;
  onSelect: (key: string) => void;
  selectedID: string | null;
  selectedDiskSize?: number;
}

const getNanodes = (types: ExtendedType[]) =>
  types.filter(t => /nanode/.test(t.class));

const getStandard = (types: ExtendedType[]) =>
  types.filter(t => /standard/.test(t.class));

const getHighMem = (types: ExtendedType[]) =>
  types.filter(t => /highmem/.test(t.class));


class SelectPlanPanel extends React.Component<Props & WithStyles<ClassNames>> {
  renderCard = (type: ExtendedType) => {
    const { selectedID, onSelect } = this.props;
    const selectedDiskSize = (this.props.selectedDiskSize) ? this.props.selectedDiskSize : 0;
    return <SelectionCard
      key={type.id}
      checked={type.id === String(selectedID)}
      onClick={e => onSelect(type.id)}
      heading={type.heading}
      subheadings={type.subHeadings}
      disabled={selectedDiskSize > type.disk}
    />;
  }

  createTabs = () => {
    const { types } = this.props;
    const tabs: Tab[] = [];
    const nanodes = getNanodes(types);
    const standards = getStandard(types);
    const highmem = getHighMem(types);

    if (!isEmpty(nanodes)) {
      tabs.push({
        title: 'Nanode',
        render: () => {

          return (
            <Grid container spacing={16}>
              {nanodes.map(this.renderCard)}
            </Grid>
          );
        },
      });
    }

    if (!isEmpty(standards)) {
      tabs.push({
        title: 'Standard',
        render: () => {
          return (
            <Grid container spacing={16}>
              {standards.map(this.renderCard)}
            </Grid>
          );
        },
      });
    }

    if (!isEmpty(highmem)) {
      tabs.push({
        title: 'High Memory',
        render: () => {
          return (
            <Grid container spacing={16}>
              {highmem.map(this.renderCard)}
            </Grid>
          );
        },
      });
    }

    return tabs;
  }

  render() {
    return (
      <TabbedPanel
        rootClass={this.props.classes.root}
        error={this.props.error}
        header="Linode Plan"
        tabs={this.createTabs()}
        initTab={1}
      />
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(SelectPlanPanel);
