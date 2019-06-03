import { isEmpty, pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { WithStyles } from '@material-ui/core/styles';
import {
  createStyles,
  Theme,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
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

const styles = (theme: Theme) =>
  createStyles({
  root: {
    marginTop: theme.spacing(3)
  },
  copy: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3)
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
  header?: string;
  copy?: string;
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

  createTabs = (): [Tab[], Linode.LinodeTypeClass[]] => {
    const { classes, types } = this.props;
    const tabs: Tab[] = [];
    const nanodes = getNanodes(types);
    const standards = getStandard(types);
    const highmem = getHighMem(types);
    const dedicated = getDedicated(types);

    const tabOrder: Linode.LinodeTypeClass[] = [];

    if (!isEmpty(nanodes)) {
      tabs.push({
        render: () => {
          return (
            <>
              <Typography className={classes.copy}>
                Nanode instances are good for low-duty workloads, where
                performance isn't critical.
              </Typography>
              <Grid container spacing={16}>
                {nanodes.map(this.renderCard)}
              </Grid>
            </>
          );
        },
        title: 'Nanode'
      });
      tabOrder.push('nanode');
    }

    if (!isEmpty(standards)) {
      tabs.push({
        render: () => {
          return (
            <>
              <Typography className={classes.copy}>
                Standard instances are good for medium-duty workloads and are a
                good mix of performance, resources, and price.
              </Typography>
              <Grid container spacing={16}>
                {standards.map(this.renderCard)}
              </Grid>
            </>
          );
        },
        title: 'Standard'
      });
      tabOrder.push('standard');
    }

    if (!isEmpty(dedicated)) {
      tabs.push({
        render: () => {
          return (
            <>
              <Typography className={classes.copy}>
                Dedicated CPU instances are good for full-duty workloads where
                consistent performance is important.
              </Typography>
              <Grid container spacing={16}>
                {dedicated.map(this.renderCard)}
              </Grid>
            </>
          );
        },
        title: 'Dedicated CPU'
      });
      tabOrder.push('dedicated');
    }

    if (!isEmpty(highmem)) {
      tabs.push({
        render: () => {
          return (
            <>
              <Typography className={classes.copy}>
                High Memory instances favor RAM over other resources, and can be
                good for memory hungry use cases like caching and in-memory
                databases.
              </Typography>
              <Grid container spacing={16}>
                {highmem.map(this.renderCard)}
              </Grid>
            </>
          );
        },
        title: 'High Memory'
      });
      tabOrder.push('highmem');
    }

    return [tabs, tabOrder];
  };

  render() {
    const { classes, copy, error, header, types, selectedID } = this.props;

    const [tabs, tabOrder] = this.createTabs();
    // Determine initial plan category tab based on selectedTypeID
    // (if there is one).
    const selectedTypeClass: Linode.LinodeTypeClass = pathOr(
      'standard', // Use `standard` by default
      ['class'],
      types.find(type => type.id === selectedID)
    );
    const initialTab = tabOrder.indexOf(selectedTypeClass);

    return (
      <TabbedPanel
        rootClass={`${classes.root} tabbedPanel`}
        error={error}
        header={header || 'Linode Plan'}
        copy={copy}
        tabs={tabs}
        initTab={initialTab}
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
