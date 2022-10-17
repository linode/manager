import {
  LinodeTypeClass,
  BaseType,
  PriceObject,
  LinodeType,
} from '@linode/api-v4/lib/linodes';
import { Capabilities } from '@linode/api-v4/lib/regions/types';
import classNames from 'classnames';
import { LDClient } from 'launchdarkly-js-client-sdk';
import { isEmpty, pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Chip from 'src/components/core/Chip';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
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
import { dcDisplayNames, LINODE_NETWORK_IN } from 'src/constants';
import withRegions, {
  DefaultProps as RegionsProps,
} from 'src/containers/regions.container';
import arrayToList from 'src/utilities/arrayToDelimiterSeparatedList';
import { convertMegabytesTo } from 'src/utilities/unitConversions';
import { gpuPlanText } from './utilities';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(3),
    width: '100%',
  },
  copy: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  disabledRow: {
    backgroundColor: theme.bg.tableHeader,
    cursor: 'not-allowed',
    opacity: 0.4,
  },
  table: {
    borderLeft: `1px solid ${theme.borderColors.borderTable}`,
    borderRight: `1px solid ${theme.borderColors.borderTable}`,
    overflowX: 'hidden',
  },
  headingCellContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  headerCell: {
    borderTop: `1px solid ${theme.borderColors.borderTable} !important`,
    borderBottom: `1px solid ${theme.borderColors.borderTable} !important`,
    '&.emptyCell': {
      borderRight: 'none',
    },
    '&:not(.emptyCell)': {
      borderLeft: 'none !important',
    },
    '&:last-child': {
      paddingRight: 15,
    },
  },
  chip: {
    backgroundColor: theme.color.green,
    color: '#fff',
    textTransform: 'uppercase',
    marginLeft: theme.spacing(2),
  },
  radioCell: {
    height: theme.spacing(6),
    width: '5%',
    paddingRight: 0,
  },
  focusedRow: {
    '&:focus-within': {
      backgroundColor: theme.bg.lightBlue1,
    },
  },
  gpuGuideLink: {
    fontSize: '0.9em',
    '& a': {
      color: theme.textColors.linkActiveLight,
    },
    '& a:hover': {
      color: '#3683dc',
    },
  },
}));

export interface PlanSelectionType extends BaseType {
  class: string;
  heading: string;
  subHeadings: string[];
  price: PriceObject;
  transfer?: LinodeType['transfer'];
  network_out?: LinodeType['network_out'];
}

interface Props {
  types: PlanSelectionType[];
  error?: string;
  onSelect: (key: string) => void;
  selectedID?: string;
  selectedDiskSize?: number;
  currentPlanHeading?: string;
  disabled?: boolean;
  header?: string;
  copy?: string;
  disabledClasses?: LinodeTypeClass[];
  tabbedPanelInnerClass?: string;
  ldClient?: LDClient;
  isCreate?: boolean;
  className?: string;
  showTransfer?: boolean;
  docsLink?: JSX.Element;
}

const getNanodes = (types: PlanSelectionType[]) =>
  types.filter((t: PlanSelectionType) => /nanode/.test(t.class));

const getStandard = (types: PlanSelectionType[]) =>
  types.filter((t: PlanSelectionType) => /standard/.test(t.class));

const getHighMem = (types: PlanSelectionType[]) =>
  types.filter((t: PlanSelectionType) => /highmem/.test(t.class));

const getProDedicated = (types: PlanSelectionType[]) =>
  types.filter((t: PlanSelectionType) => /prodedicated/.test(t.class));

const getDedicated = (types: PlanSelectionType[]) =>
  types.filter((t: PlanSelectionType) => /^dedicated/.test(t.class));

const getGPU = (types: PlanSelectionType[]) =>
  types.filter((t: PlanSelectionType) => /gpu/.test(t.class));

const getMetal = (types: PlanSelectionType[]) =>
  types.filter((t: PlanSelectionType) => t.class === 'metal');

type CombinedProps = Props & RegionsProps;

export const SelectPlanPanel: React.FC<CombinedProps> = (props) => {
  const {
    selectedID,
    currentPlanHeading,
    disabled,
    isCreate,
    header,
    showTransfer,
    types,
    className,
    copy,
    error,
    docsLink,
  } = props;

  const classes = useStyles();

  const onSelect = (id: string) => () => props.onSelect(id);

  const getDisabledClass = (thisClass: string) => {
    const disabledClasses = (props.disabledClasses as string[]) ?? []; // Not a big fan of the casting here but it works
    return disabledClasses.includes(thisClass);
  };

  const getRegionsWithCapability = (capability: Capabilities) => {
    const regions = props.regionsData ?? [];
    const withCapability = regions
      .filter((thisRegion) => thisRegion.capabilities.includes(capability))
      .map((thisRegion) => dcDisplayNames[thisRegion.id]);
    return arrayToList(withCapability);
  };

  const renderSelection = (type: PlanSelectionType, idx: number) => {
    const selectedDiskSize = props.selectedDiskSize
      ? props.selectedDiskSize
      : 0;
    let tooltip;
    const planTooSmall = selectedDiskSize > type.disk;
    const isSamePlan = type.heading === currentPlanHeading;
    const isGPU = type.class === 'gpu';
    const isDisabledClass = getDisabledClass(type.class);
    const shouldShowTransfer = showTransfer && type.transfer;
    const shouldShowNetwork = showTransfer && type.network_out;

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
        <Hidden mdDown={isCreate} smDown={!isCreate}>
          <TableRow
            data-qa-plan-row={type.label}
            aria-label={rowAriaLabel}
            key={type.id}
            onClick={
              !isSamePlan && !isDisabledClass ? onSelect(type.id) : undefined
            }
            aria-disabled={isSamePlan || planTooSmall || isDisabledClass}
            className={classNames(classes.focusedRow, {
              [classes.disabledRow]:
                isSamePlan || planTooSmall || isDisabledClass,
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
                      onChange={onSelect(type.id)}
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
            <TableCell data-qa-monthly> ${type.price?.monthly}</TableCell>
            <TableCell data-qa-hourly>
              {isGPU ? (
                <Currency quantity={type.price.hourly ?? 0} />
              ) : (
                `$${type.price?.hourly}`
              )}
            </TableCell>
            <TableCell center noWrap data-qa-ram>
              {convertMegabytesTo(type.memory, true)}
            </TableCell>
            <TableCell center data-qa-cpu>
              {type.vcpus}
            </TableCell>
            <TableCell center noWrap data-qa-storage>
              {convertMegabytesTo(type.disk, true)}
            </TableCell>
            {shouldShowTransfer && type.transfer ? (
              <TableCell center data-qa-transfer>
                {type.transfer / 1000} TB
              </TableCell>
            ) : null}
            {shouldShowNetwork && type.network_out ? (
              <TableCell center noWrap data-qa-network>
                {LINODE_NETWORK_IN} Gbps{' '}
                <span style={{ color: '#9DA4A6' }}>/</span>{' '}
                {type.network_out / 1000} Gbps
              </TableCell>
            ) : null}
          </TableRow>
        </Hidden>

        {/* Displays SelectionCard for small screens */}
        <Hidden lgUp={isCreate} mdUp={!isCreate}>
          <SelectionCard
            key={type.id}
            checked={type.id === String(selectedID)}
            onClick={onSelect(type.id)}
            heading={type.heading}
            subheadings={type.subHeadings}
            disabled={planTooSmall || isSamePlan || disabled || isDisabledClass}
            tooltip={tooltip}
          />
        </Hidden>
      </React.Fragment>
    );
  };

  const renderPlanContainer = (plans: PlanSelectionType[]) => {
    // Show the Transfer column if, for any plan, the api returned data and we're not in the Database Create flow
    const shouldShowTransfer =
      showTransfer && plans.some((plan: ExtendedType) => plan.transfer);

    // Show the Network throughput column if, for any plan, the api returned data (currently Bare Metal does not)
    const shouldShowNetwork =
      showTransfer && plans.some((plan: ExtendedType) => plan.network_out);

    return (
      <Grid container>
        <Hidden lgUp={isCreate} mdUp={!isCreate}>
          {plans.map(renderSelection)}
        </Hidden>
        <Hidden mdDown={isCreate} smDown={!isCreate}>
          <Grid item xs={12}>
            <Table
              aria-label="List of Linode Plans"
              className={classes.table}
              spacingBottom={16}
            >
              <TableHead>
                <TableRow>
                  <TableCell className={classes.headerCell} />
                  <TableCell className={classes.headerCell} data-qa-plan-header>
                    {header}
                  </TableCell>
                  <TableCell
                    className={classes.headerCell}
                    data-qa-monthly-header
                  >
                    Monthly
                  </TableCell>
                  <TableCell
                    className={classes.headerCell}
                    data-qa-hourly-header
                  >
                    Hourly
                  </TableCell>
                  <TableCell
                    className={classes.headerCell}
                    data-qa-ram-header
                    center
                  >
                    RAM
                  </TableCell>
                  <TableCell
                    className={classes.headerCell}
                    data-qa-cpu-header
                    center
                  >
                    CPUs
                  </TableCell>
                  <TableCell
                    className={classes.headerCell}
                    data-qa-storage-header
                    center
                  >
                    Storage
                  </TableCell>
                  {shouldShowTransfer ? (
                    <TableCell
                      className={classes.headerCell}
                      data-qa-transfer-header
                      center
                    >
                      Transfer
                    </TableCell>
                  ) : null}
                  {shouldShowNetwork ? (
                    <TableCell
                      className={classes.headerCell}
                      data-qa-network-header
                      noWrap
                      center
                    >
                      Network In / Out
                    </TableCell>
                  ) : null}
                </TableRow>
              </TableHead>
              <TableBody role="radiogroup">
                {plans.map(renderSelection)}
              </TableBody>
            </Table>
          </Grid>
        </Hidden>
      </Grid>
    );
  };

  const createTabs = (): [Tab[], LinodeTypeClass[]] => {
    const tabs: Tab[] = [];
    const nanodes = getNanodes(types);
    const standards = getStandard(types);
    const highmem = getHighMem(types);
    const proDedicated = getProDedicated(types);
    const dedicated = getDedicated(types);
    const gpu = getGPU(types);
    const metal = getMetal(types);

    const tabOrder: LinodeTypeClass[] = [];

    const shared = [...nanodes, ...standards];

    if (!isEmpty(proDedicated)) {
      tabs.push({
        render: () => {
          return (
            <>
              <Typography data-qa-prodedi className={classes.copy}>
                Pro Dedicated CPU instances are for very demanding workloads.
                They only have AMD 2nd generation processors or newer.
              </Typography>
              {renderPlanContainer(proDedicated)}
            </>
          );
        },
        title: 'Pro Dedicated CPU',
      });
      tabOrder.push('prodedicated');
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
              {renderPlanContainer(dedicated)}
            </>
          );
        },
        title: 'Dedicated CPU',
      });
      tabOrder.push('dedicated');
    }

    if (!isEmpty(shared)) {
      tabs.push({
        render: () => {
          return (
            <>
              <Typography data-qa-standard className={classes.copy}>
                Shared CPU instances are good for medium-duty workloads and are
                a good mix of performance, resources, and price.
              </Typography>
              {renderPlanContainer(shared)}
            </>
          );
        },
        title: 'Shared CPU',
      });
      tabOrder.push('standard');
    }

    if (!isEmpty(highmem)) {
      tabs.push({
        render: () => {
          return (
            <>
              <Typography data-qa-highmem className={classes.copy}>
                High Memory instances favor RAM over other resources, and can be
                good for memory hungry use cases like caching and in-memory
                databases. All High Memory plans use dedicated CPU cores.
              </Typography>
              {renderPlanContainer(highmem)}
            </>
          );
        },
        title: 'High Memory',
      });
      tabOrder.push('highmem');
    }

    if (!isEmpty(gpu)) {
      const programInfo = getDisabledClass('gpu') ? (
        <>
          GPU instances are not available in the selected region. Currently
          these plans are only available in{' '}
          {getRegionsWithCapability('GPU Linodes')}.
        </>
      ) : (
        <div className={classes.gpuGuideLink}>{gpuPlanText()}</div>
      );
      tabs.push({
        render: () => {
          return (
            <>
              <Notice warning>{programInfo}</Notice>
              <Typography data-qa-gpu className={classes.copy}>
                Linodes with dedicated GPUs accelerate highly specialized
                applications such as machine learning, AI, and video
                transcoding.
              </Typography>
              {renderPlanContainer(gpu)}
            </>
          );
        },
        title: 'GPU',
      });
      tabOrder.push('gpu');
    }

    if (!isEmpty(metal)) {
      const programInfo = getDisabledClass('metal') ? (
        // Until BM-426 is merged, we aren't filtering for regions in getDisabledClass
        // so this branch will never run.
        <Typography>
          Bare Metal instances are not available in the selected region.
          Currently these plans are only available in{' '}
          {getRegionsWithCapability('Bare Metal')}.
        </Typography>
      ) : (
        <Typography className={classes.gpuGuideLink}>
          Bare Metal Linodes have limited availability and may not be available
          at the time of your request. Some additional verification may be
          required to access these services.
        </Typography>
      );
      tabs.push({
        render: () => {
          return (
            <>
              <Notice warning>{programInfo}</Notice>
              <Typography data-qa-gpu className={classes.copy}>
                Bare Metal Linodes give you full, dedicated access to a single
                physical machine. Some services, including backups, VLANs, and
                disk management, are not available with these plans.
              </Typography>
              {renderPlanContainer(metal)}
            </>
          );
        },
        title: 'Bare Metal',
      });
      tabOrder.push('metal');
    }

    return [tabs, tabOrder];
  };

  const [tabs, tabOrder] = createTabs();

  // Determine initial plan category tab based on current plan selection
  // (if there is one).
  let selectedTypeClass: LinodeTypeClass = pathOr(
    'standard', // Use `standard` by default
    ['class'],
    types.find(
      (type) => type.id === selectedID || type.heading === currentPlanHeading
    )
  );

  // We don't have a "Nanodes" tab anymore, so use `standard` (labeled as "Shared CPU").
  if (selectedTypeClass === 'nanode') {
    selectedTypeClass = 'standard';
  }

  const initialTab = tabOrder.indexOf(selectedTypeClass);

  return (
    <TabbedPanel
      rootClass={`${classes.root} ${className} tabbedPanel`}
      innerClass={props.tabbedPanelInnerClass}
      error={error}
      header={header || 'Linode Plan'}
      copy={copy}
      tabs={tabs}
      initTab={initialTab >= 0 ? initialTab : 0}
      docsLink={docsLink}
      data-qa-select-plan
    />
  );
};

export default compose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  withRegions
)(SelectPlanPanel);
