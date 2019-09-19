import * as classnames from 'classnames';
import { LinodeType, LinodeTypeClass } from 'linode-js-sdk/lib/linodes';
import { isEmpty, pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Chip from 'src/components/core/Chip';
import Hidden from 'src/components/core/Hidden';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import HelpIcon from 'src/components/HelpIcon';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import SelectionCard from 'src/components/SelectionCard';
import TabbedPanel from 'src/components/TabbedPanel';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { convertMegabytesTo } from 'src/utilities/unitConversions';

export interface ExtendedType extends LinodeType {
  heading: string;
  subHeadings: [string, string];
}

type ClassNames =
  | 'root'
  | 'copy'
  | 'disabledRow'
  | 'chip'
  | 'currentPlanChipCell';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(3),
      width: '100%'
    },
    copy: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(3)
    },
    disabledRow: {
      backgroundColor: theme.bg.tableHeader,
      cursor: 'not-allowed'
    },
    chip: {
      backgroundColor: theme.color.green,
      color: '#fff',
      textTransform: 'uppercase'
    },
    currentPlanChipCell: {
      width: '13%'
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

const getGPU = (types: ExtendedType[]) =>
  types.filter(t => /gpu/.test(t.class));

export class SelectPlanPanel extends React.Component<
  Props & WithStyles<ClassNames>
> {
  onSelect = (id: string) => () => this.props.onSelect(id);

  renderSelection = (type: ExtendedType) => {
    const { selectedID, currentPlanHeading, disabled, classes } = this.props;
    const selectedDiskSize = this.props.selectedDiskSize
      ? this.props.selectedDiskSize
      : 0;
    let tooltip;
    const planTooSmall = selectedDiskSize > type.disk;
    const isSamePlan = type.heading === currentPlanHeading;

    if (planTooSmall) {
      tooltip = `This plan is too small for the selected image.`;
    }

    return (
      <React.Fragment>
        {/* Displays Table Row for larger screens */}
        <Hidden smDown>
          <TableRow
            key={type.id}
            onClick={!isSamePlan ? this.onSelect(type.id) : undefined}
            rowLink={this.onSelect ? this.onSelect(type.id) : undefined}
            className={classnames({
              [classes.disabledRow]: isSamePlan || planTooSmall
            })}
          >
            {isSamePlan ? (
              <TableCell className={classes.currentPlanChipCell}>
                <Chip label="Current Plan" className={classes.chip} />
              </TableCell>
            ) : (
              <TableCell>
                <Radio
                  checked={!planTooSmall && type.id === String(selectedID)}
                  onChange={this.onSelect(type.id)}
                  disabled={planTooSmall || disabled}
                  id={type.id}
                />
              </TableCell>
            )}
            <TableCell>
              {type.heading}{' '}
              {tooltip && (
                <HelpIcon text={tooltip} tooltipPosition="right-end" />
              )}
            </TableCell>
            <TableCell>${type.price.monthly}</TableCell>
            <TableCell>${type.price.hourly}</TableCell>
            <TableCell>{type.vcpus}</TableCell>
            <TableCell>{convertMegabytesTo(type.disk, true)}</TableCell>
            <TableCell>{convertMegabytesTo(type.memory, true)}</TableCell>
          </TableRow>
        </Hidden>
        {/* Displays SelectionCard for small screens */}
        <Hidden mdUp>
          <SelectionCard
            key={type.id}
            checked={type.id === String(selectedID)}
            onClick={this.onSelect(type.id)}
            heading={type.heading}
            subheadings={type.subHeadings}
            disabled={planTooSmall || isSamePlan || disabled}
            tooltip={tooltip}
            variant="check"
          />
        </Hidden>
      </React.Fragment>
    );
  };

  renderPlanContainer = (plans: ExtendedType[]) => {
    const tableHeader = (
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell>Linode Plan</TableCell>
          <TableCell>Monthly</TableCell>
          <TableCell>Hourly</TableCell>
          <TableCell>CPUs</TableCell>
          <TableCell>Storage</TableCell>
          <TableCell>Ram</TableCell>
        </TableRow>
      </TableHead>
    );

    return (
      <Grid container>
        <Hidden mdUp>{plans.map(this.renderSelection)}</Hidden>
        <Hidden smDown>
          <Grid item xs={12} lg={10}>
            <Table isResponsive={false} border spacingBottom={16}>
              {tableHeader}
              <TableBody>{plans.map(this.renderSelection)}</TableBody>
            </Table>
          </Grid>
        </Hidden>
      </Grid>
    );
  };

  createTabs = (): [Tab[], LinodeTypeClass[]] => {
    const { classes, types } = this.props;
    const tabs: Tab[] = [];
    const nanodes = getNanodes(types);
    const standards = getStandard(types);
    const highmem = getHighMem(types);
    const dedicated = getDedicated(types);
    const gpu = getGPU(types);

    const tabOrder: LinodeTypeClass[] = [];

    if (!isEmpty(nanodes)) {
      tabs.push({
        render: () => {
          return (
            <>
              <Typography className={classes.copy}>
                Nanode instances are good for low-duty workloads, where
                performance isn't critical.
              </Typography>
              {this.renderPlanContainer(nanodes)}
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
              {this.renderPlanContainer(standards)}
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
              {this.renderPlanContainer(dedicated)}
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
              {this.renderPlanContainer(highmem)}
            </>
          );
        },
        title: 'High Memory'
      });
      tabOrder.push('highmem');
    }

    if (!isEmpty(gpu)) {
      const programInfo = (
        <Typography>
          This is a pilot program for Linode GPU Instances.
          <a
            href="https://www.linode.com/docs/platform/linode-gpu/getting-started-with-gpu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {` `}Here is a guide
          </a>{' '}
          with more information. This program has finite resources and may not
          be available at the time of your request. Some additional verification
          may be required to access these services.
        </Typography>
      );
      tabs.push({
        render: () => {
          return (
            <>
              <Notice warning text={programInfo} />
              <Typography className={classes.copy}>
                Linodes with dedicated GPUs accelerate highly specialized
                applications such as machine learning, AI, and video
                transcoding.
              </Typography>
              {this.renderPlanContainer(gpu)}
            </>
          );
        },
        title: 'GPU'
      });
      tabOrder.push('gpu');
    }

    return [tabs, tabOrder];
  };

  render() {
    const { classes, copy, error, header, types, selectedID } = this.props;

    const [tabs, tabOrder] = this.createTabs();
    // Determine initial plan category tab based on selectedTypeID
    // (if there is one).
    const selectedTypeClass: LinodeTypeClass = pathOr(
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
