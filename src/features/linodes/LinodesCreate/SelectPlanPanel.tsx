import { isEmpty } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
// import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import SelectionCard from 'src/components/SelectionCard';
import TabbedPanel from 'src/components/TabbedPanel';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';

export interface ExtendedType extends Linode.LinodeType {
  heading: string;
  subHeadings: [string, string];
}

type ClassNames = 'root' | 'copy';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    marginTop: theme.spacing.unit * 3
  },
  copy: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 3
  }
});

interface Props {
  types: ExtendedType[];
  error?: string;
  onSelect: (key: string) => void;
  selectedID?: string;
  selectedDiskSize?: number;
  currentPlanHeading?: string;
  disabled?: boolean;
  noHeader?: boolean;
}

const getNanodes = (types: ExtendedType[]) =>
  types.filter(t => /nanode/.test(t.class));

const getStandard = (types: ExtendedType[]) =>
  types.filter(t => /standard/.test(t.class));

const getHighMem = (types: ExtendedType[]) =>
  types.filter(t => /highmem/.test(t.class));

const getDedicated = (types: ExtendedType[]) =>
  types.filter(t => /dedicated/.test(t.class));

export class SelectPlanPanel extends React.Component<
  Props & WithStyles<ClassNames>
> {
  onSelect = (id: string) => () => this.props.onSelect(id);

  renderCard = (type: ExtendedType) => {
    const { selectedID, currentPlanHeading, disabled } = this.props;
    const selectedDiskSize = this.props.selectedDiskSize
      ? this.props.selectedDiskSize
      : 0;
    let tooltip;
    const planTooSmall = selectedDiskSize > type.disk;
    const isSamePlan = type.heading === currentPlanHeading;

    if (planTooSmall) {
      tooltip = `This plan is too small for the selected image.`;
    }

    if (isSamePlan) {
      tooltip = `This is your current plan. Please select another to resize.`;
    }

    return (
      <SelectionCard
        key={type.id}
        checked={type.id === String(selectedID)}
        onClick={this.onSelect(type.id)}
        heading={type.heading}
        subheadings={type.subHeadings}
        disabled={planTooSmall || isSamePlan || disabled}
        tooltip={tooltip}
      />
    );
  };

  createTabs = () => {
    const { types } = this.props;
    const tabs: Tab[] = [];
    const nanodes = getNanodes(types);
    const standards = getStandard(types);
    const highmem = getHighMem(types);
    const dedicated = getDedicated(types);

    if (!isEmpty(nanodes)) {
      tabs.push({
        render: () => {
          return (
            <>
              {/* <Typography className={classes.copy}>The Nanode is Linode's smallest plan, offering enough resources to host static web sites, small blogs, self-hosted utilities, and hobby projects.</Typography> */}
              <Grid container spacing={16}>
                {nanodes.map(this.renderCard)}
              </Grid>
            </>
          );
        },
        title: 'Nanode'
      });
    }

    if (!isEmpty(standards)) {
      tabs.push({
        render: () => {
          return (
            <>
              {/* <Typography className={classes.copy}>The Standard plans represent different tiers of service suitable for hosting applications, databases, and web sites.</Typography> */}
              <Grid container spacing={16}>
                {standards.map(this.renderCard)}
              </Grid>
            </>
          );
        },
        title: 'Standard'
      });
    }

    if (!isEmpty(dedicated)) {
      tabs.push({
        render: () => {
          return (
            <>
              {/* <Typography className={classes.copy}>Dedicated CPU plans are tailored for consistently-high CPU workloads like, as data analytics services, CI/CD toolchains and build servers, and other CPU-bound tasks.</Typography> */}
              <Grid container spacing={16}>
                {dedicated.map(this.renderCard)}
              </Grid>
            </>
          );
        },
        title: 'Dedicated CPU'
      });
    }

    if (!isEmpty(highmem)) {
      tabs.push({
        render: () => {
          return (
            <>
              {/* <Typography className={classes.copy}>The High Memory Linode plans are perfect for running memory intensive applications, like in-memory databases.</Typography> */}
              <Grid container spacing={16}>
                {highmem.map(this.renderCard)}
              </Grid>
            </>
          );
        },
        title: 'High Memory'
      });
    }

    return tabs;
  };

  render() {
    return (
      <TabbedPanel
        rootClass={this.props.classes.root}
        error={this.props.error}
        header={this.props.noHeader ? "" : "Linode Plan"}
        tabs={this.createTabs()}
        initTab={1}
      />
    );
  }
}

const styled = withStyles(styles);

export default compose<
  Props & WithStyles<ClassNames>,
  Props & RenderGuardProps
>(
  RenderGuard,
  styled
)(SelectPlanPanel);
