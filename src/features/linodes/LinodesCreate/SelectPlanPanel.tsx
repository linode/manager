import * as React from 'react';

import { isEmpty } from 'ramda';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import Grid from 'src/components/Grid';
import SelectionCard from '../../../components/SelectionCard';
import TabbedPanel from '../../../components/TabbedPanel';
import { Tab } from '../../../components/TabbedPanel/TabbedPanel';

import RenderGuard from 'src/components/RenderGuard';

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

interface Props {
  types: ExtendedType[];
  error?: string;
  onSelect: (key: string) => void;
  selectedID: string | null;
  selectedDiskSize?: number;
  currentPlanHeading?: string;
}

const getNanodes = (types: ExtendedType[]) =>
  types.filter(t => /nanode/.test(t.class));

const getStandard = (types: ExtendedType[]) =>
  types.filter(t => /standard/.test(t.class));

const getHighMem = (types: ExtendedType[]) =>
  types.filter(t => /highmem/.test(t.class));

export class SelectPlanPanel extends React.Component<Props & WithStyles<ClassNames>> {
  renderCard = (type: ExtendedType) => {
    const { selectedID, onSelect, currentPlanHeading } = this.props;
    const selectedDiskSize = (this.props.selectedDiskSize) ? this.props.selectedDiskSize : 0;
    return <SelectionCard
      key={type.id}
      checked={type.id === String(selectedID)}
      onClick={e => onSelect(type.id)}
      heading={type.heading}
      subheadings={type.subHeadings}
      disabled={selectedDiskSize > type.disk || type.heading === currentPlanHeading}
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
        render: () => {

          return (
            <Grid container spacing={16}>
              {nanodes.map(this.renderCard)}
            </Grid>
          );
        },
        title: 'Nanode',
      });
    }

    if (!isEmpty(standards)) {
      tabs.push({
        render: () => {
          return (
            <Grid container spacing={16}>
              {standards.map(this.renderCard)}
            </Grid>
          );
        },
        title: 'Standard',
      });
    }

    if (!isEmpty(highmem)) {
      tabs.push({
        render: () => {
          return (
            <Grid container spacing={16}>
              {highmem.map(this.renderCard)}
            </Grid>
          );
        },
        title: 'High Memory',
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

export default styled(RenderGuard<Props & WithStyles<ClassNames>>(SelectPlanPanel));
