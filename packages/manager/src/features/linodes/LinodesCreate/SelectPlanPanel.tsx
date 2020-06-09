import * as classnames from 'classnames';
import { LinodeType, LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import { isEmpty, pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Chip from 'src/components/core/Chip';
import FormControlLabel from 'src/components/core/FormControlLabel';
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
import Currency from 'src/components/Currency';
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
import { dcDisplayNames } from 'src/constants';
import withRegions, {
  DefaultProps as RegionsProps
} from 'src/containers/regions.container';
import arrayToList from 'src/utilities/arrayToCommaSeparatedList';
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
  | 'headingCellContainer'
  | 'currentPlanChipCell'
  | 'radioCell';

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
      cursor: 'not-allowed',
      opacity: 0.4
    },
    headingCellContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    chip: {
      backgroundColor: theme.color.green,
      color: '#fff',
      textTransform: 'uppercase',
      marginLeft: theme.spacing(2)
    },
    currentPlanChipCell: {
      width: '13%'
    },
    radioCell: {
      width: '5%',
      height: 55
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
  disabledClasses?: LinodeTypeClass[];
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

type CombinedProps = Props & WithStyles<ClassNames> & RegionsProps;

export class SelectPlanPanel extends React.Component<CombinedProps> {
  onSelect = (id: string) => () => this.props.onSelect(id);

  getDisabledClass = (thisClass: LinodeTypeClass) => {
    const disabledClasses = this.props.disabledClasses ?? [];
    return disabledClasses.includes(thisClass);
  };

  getRegionsWithGPU = () => {
    const regions = this.props.regionsData ?? [];
    const withGPU = regions
      .filter(thisRegion => thisRegion.capabilities.includes('GPU Linodes'))
      .map(thisRegion => dcDisplayNames[thisRegion.id]);
    return arrayToList(withGPU);
  };

  renderSelection = (type: ExtendedType, idx: number) => {
    const { selectedID, currentPlanHeading, disabled, classes } = this.props;
    const selectedDiskSize = this.props.selectedDiskSize
      ? this.props.selectedDiskSize
      : 0;
    let tooltip;
    const planTooSmall = selectedDiskSize > type.disk;
    const isSamePlan = type.heading === currentPlanHeading;
    const isGPU = type.class === 'gpu';
    const isDisabledClass = this.getDisabledClass(type.class);

    if (planTooSmall) {
      tooltip = `This plan is too small for the selected image.`;
    }

    const rowAriaLabel =
      type && type.label && isSamePlan
        ? `${type.label} this is your current plan`
        : planTooSmall
        ? `${type.label} this plan is too small for resize`
        : type.label;

    return (
      <React.Fragment key={`tabbed-panel-${idx}`}>
        {/* Displays Table Row for larger screens */}
        <Hidden smDown>
          <TableRow
            data-qa-plan-row={type.label}
            aria-label={rowAriaLabel}
            key={type.id}
            onClick={
              !isSamePlan && !isDisabledClass
                ? this.onSelect(type.id)
                : undefined
            }
            rowLink={this.onSelect ? this.onSelect(type.id) : undefined}
            aria-disabled={isSamePlan || planTooSmall || isDisabledClass}
            className={classnames({
              [classes.disabledRow]:
                isSamePlan || planTooSmall || isDisabledClass
            })}
          >
            <TableCell className={classes.radioCell}>
              {!isSamePlan && (
                <FormControlLabel
                  label={type.heading}
                  aria-label={type.heading}
                  className={'label-visually-hidden'}
                  control={
                    <Radio
                      checked={!planTooSmall && type.id === String(selectedID)}
                      onChange={this.onSelect(type.id)}
                      disabled={planTooSmall || disabled || isDisabledClass}
                      id={type.id}
                    />
                  }
                />
              )}
            </TableCell>
            <TableCell data-qa-plan-name>
              <div className={classes.headingCellContainer}>
                {type.heading}{' '}
                {isSamePlan && (
                  <Chip
                    data-qa-current-plan
                    label="Current Plan"
                    aria-label="This is your current plan"
                    className={classes.chip}
                  />
                )}
                {tooltip && (
                  <HelpIcon
                    text={tooltip}
                    tooltipPosition="right-end"
                    className="py0"
                  />
                )}
              </div>
            </TableCell>
            <TableCell data-qa-monthly> ${type.price.monthly}</TableCell>
            <TableCell data-qa-hourly>
              {isGPU ? (
                <Currency quantity={type.price.hourly} />
              ) : (
                `$` + type.price.hourly
              )}
            </TableCell>
            <TableCell data-qa-cpu>{type.vcpus}</TableCell>
            <TableCell data-qa-storage>
              {convertMegabytesTo(type.disk, true)}
            </TableCell>
            <TableCell data-qa-ram>
              {convertMegabytesTo(type.memory, true)}
            </TableCell>
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
            disabled={planTooSmall || isSamePlan || disabled || isDisabledClass}
            tooltip={tooltip}
            variant={'check'}
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
          <TableCell data-qa-plan-header>Linode Plan</TableCell>
          <TableCell data-qa-monthly-header>Monthly</TableCell>
          <TableCell data-qa-hourly-header>Hourly</TableCell>
          <TableCell data-qa-cpu-header>CPUs</TableCell>
          <TableCell data-qa-storage-header>Storage</TableCell>
          <TableCell data-qa-ram-header>Ram</TableCell>
        </TableRow>
      </TableHead>
    );

    return (
      <Grid container>
        <Hidden mdUp>{plans.map(this.renderSelection)}</Hidden>
        <Hidden smDown>
          <Grid item xs={12} lg={10}>
            <Table
              isResponsive={false}
              border
              spacingBottom={16}
              aria-label="List of Linode Plans"
            >
              {tableHeader}
              <TableBody role="radiogroup">
                {plans.map(this.renderSelection)}
              </TableBody>
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
              <Typography data-qa-nanode className={classes.copy}>
                Nanode instances are good for low-duty workloads, where
                performance isn&#39;t critical.
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
              <Typography data-qa-standard className={classes.copy}>
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
              <Typography data-qa-dedicated className={classes.copy}>
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
              <Typography data-qa-highmem className={classes.copy}>
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
      const programInfo = this.getDisabledClass('gpu') ? (
        <Typography>
          GPU instances are not available in the selected region. Currently
          these plans are only available in {this.getRegionsWithGPU()}.
        </Typography>
      ) : (
        <Typography>
          This is a pilot program for Linode GPU Instances.
          <a
            href="https://www.linode.com/docs/platform/linode-gpu/getting-started-with-gpu/"
            target="_blank"
            aria-describedby="external-site"
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
              <Typography data-qa-gpu className={classes.copy}>
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
    const {
      classes,
      copy,
      error,
      header,
      types,
      currentPlanHeading
    } = this.props;

    const [tabs, tabOrder] = this.createTabs();

    // Determine initial plan category tab based on current plan selection
    // (if there is one).
    const selectedTypeClass: LinodeTypeClass = pathOr(
      'standard', // Use `standard` by default
      ['class'],
      types.find(type => type.heading === currentPlanHeading)
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
        data-qa-select-plan
      />
    );
  }
}

const styled = withStyles(styles);

export default compose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  styled,
  withRegions()
)(SelectPlanPanel);
