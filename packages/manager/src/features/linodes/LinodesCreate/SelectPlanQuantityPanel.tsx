import classNames from 'classnames';
import { LinodeTypeClass } from '@linode/api-v4/lib/linodes/types';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Hidden from 'src/components/core/Hidden';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import EnhancedNumberInput from 'src/components/EnhancedNumberInput';
import Grid from '@mui/material/Unstable_Grid2';
import Notice from 'src/components/Notice';
import SelectionCard from 'src/components/SelectionCard';
import TabbedPanel from 'src/components/TabbedPanel';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { convertMegabytesTo } from 'src/utilities/unitConversions';
import { gpuPlanText } from './utilities';
import { CreateNodePoolData } from '@linode/api-v4';
import { ExtendedType } from 'src/utilities/extendType';

type ClassNames =
  | 'root'
  | 'copy'
  | 'disabledRow'
  | 'chip'
  | 'headingCellContainer'
  | 'currentPlanChipCell'
  | 'radioCell'
  | 'enhancedInputOuter'
  | 'enhancedInputButton';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: 0,
      paddingTop: theme.spacing(3),
    },
    copy: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(3),
    },
    disabledRow: {
      backgroundColor: theme.bg.tableHeader,
      cursor: 'not-allowed',
    },
    headingCellContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    chip: {
      backgroundColor: theme.color.green,
      color: '#fff',
      textTransform: 'uppercase',
      marginLeft: theme.spacing(2),
    },
    currentPlanChipCell: {
      width: '13%',
    },
    radioCell: {
      width: '5%',
      height: 55,
    },
    enhancedInputOuter: {
      display: 'flex',
      justifyContent: 'flex-end',
      [theme.breakpoints.down('md')]: {
        justifyContent: 'flex-start',
      },
      alignItems: 'center',
    },
    enhancedInputButton: {
      marginLeft: 10,
      minWidth: 85,
      paddingTop: 7,
      paddingBottom: 7,
      [theme.breakpoints.down('md')]: {
        minWidth: 80,
        paddingTop: 12,
        paddingBottom: 12,
        '& span': {
          color: '#fff !important',
        },
      },
    },
  });

interface Props {
  types: ExtendedType[];
  getTypeCount: (planId: string) => number;
  error?: string;
  onSelect: (key: string) => void;
  selectedID?: string;
  currentPlanHeading?: string;
  disabled?: boolean;
  header?: string;
  copy?: string;
  onAdd?: (key: string, value: number) => void;
  addPool?: (pool?: CreateNodePoolData) => void;
  updatePlanCount: (planId: string, newCount: number) => void;
  isSubmitting?: boolean;
  resetValues: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const getNanodes = (types: ExtendedType[]) =>
  types.filter((t) => /nanode/.test(t.class));

const getStandard = (types: ExtendedType[]) =>
  types.filter((t) => /standard/.test(t.class));

const getHighMem = (types: ExtendedType[]) =>
  types.filter((t) => /highmem/.test(t.class));

const getDedicated = (types: ExtendedType[]) =>
  types.filter((t) => /dedicated/.test(t.class));

const getGPU = (types: ExtendedType[]) =>
  types.filter((t) => /gpu/.test(t.class));

export class SelectPlanQuantityPanel extends React.Component<CombinedProps> {
  onSelect = (id: string) => () => this.props.onSelect(id);

  renderSelection = (type: ExtendedType, idx: number) => {
    const {
      selectedID,
      disabled,
      classes,
      onAdd,
      updatePlanCount,
      getTypeCount,
    } = this.props;

    const count = getTypeCount(type.id);

    // We don't want network information for LKE so we remove the last two elements.
    const subHeadings = type.subHeadings.slice(0, -2);

    const renderVariant = () => (
      <Grid xs={12}>
        <div className={classes.enhancedInputOuter}>
          <EnhancedNumberInput
            value={count}
            setValue={(newCount: number) => updatePlanCount(type.id, newCount)}
          />
          {onAdd && (
            <Button
              buttonType="primary"
              onClick={() => onAdd(type.id, count)}
              disabled={count < 1}
              className={classes.enhancedInputButton}
            >
              Add
            </Button>
          )}
        </div>
      </Grid>
    );

    return (
      <React.Fragment key={`tabbed-panel-${idx}`}>
        {/* Displays Table Row for larger screens */}
        <Hidden mdDown>
          <TableRow
            data-qa-plan-row={type.formattedLabel}
            key={type.id}
            className={classNames({
              [classes.disabledRow]: disabled,
            })}
          >
            <TableCell data-qa-plan-name>
              <div className={classes.headingCellContainer}>
                {type.heading}{' '}
              </div>
            </TableCell>
            <TableCell data-qa-monthly> ${type.price.monthly}</TableCell>
            <TableCell data-qa-hourly>{`$` + type.price.hourly}</TableCell>
            <TableCell center data-qa-ram>
              {convertMegabytesTo(type.memory, true)}
            </TableCell>
            <TableCell center data-qa-cpu>
              {type.vcpus}
            </TableCell>
            <TableCell center data-qa-storage>
              {convertMegabytesTo(type.disk, true)}
            </TableCell>
            <TableCell>
              <div className={classes.enhancedInputOuter}>
                <EnhancedNumberInput
                  inputLabel={`edit-quantity-${type.id}`}
                  value={count}
                  setValue={(newCount: number) =>
                    updatePlanCount(type.id, newCount)
                  }
                  disabled={
                    // When on the add pool flow, we only want the current input to be active,
                    // unless we've just landed on the form or all the inputs are empty.
                    !onAdd && Boolean(selectedID) && type.id !== selectedID
                  }
                />
                {onAdd && (
                  <Button
                    buttonType="primary"
                    onClick={() => onAdd(type.id, count)}
                    disabled={count < 1}
                    className={classes.enhancedInputButton}
                  >
                    Add
                  </Button>
                )}
              </div>
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
            subheadings={subHeadings}
            disabled={disabled}
            renderVariant={renderVariant}
          />
        </Hidden>
      </React.Fragment>
    );
  };

  renderPlanContainer = (plans: ExtendedType[]) => {
    const tableHeader = (
      <TableHead>
        <TableRow>
          <TableCell data-qa-plan-header>Plan</TableCell>
          <TableCell data-qa-monthly-header>Monthly</TableCell>
          <TableCell data-qa-hourly-header>Hourly</TableCell>
          <TableCell center data-qa-ram-header>
            RAM
          </TableCell>
          <TableCell center data-qa-cpu-header>
            CPUs
          </TableCell>
          <TableCell center data-qa-storage-header>
            Storage
          </TableCell>
          <TableCell>
            <p className="visually-hidden">Quantity</p>
          </TableCell>
        </TableRow>
      </TableHead>
    );

    return (
      <Grid container spacing={2}>
        <Hidden mdUp>{plans.map(this.renderSelection)}</Hidden>
        <Hidden mdDown>
          <Grid xs={12} lg={12}>
            <Table aria-label="List of Linode Plans" spacingBottom={16}>
              {tableHeader}
              <TableBody role="grid">
                {plans.map(this.renderSelection)}
              </TableBody>
            </Table>
          </Grid>
        </Hidden>
      </Grid>
    );
  };

  createTabs = (): [Tab[], LinodeTypeClass[]] => {
    const { classes, types, onAdd } = this.props;
    const tabs: Tab[] = [];
    const nanodes = getNanodes(types);
    const standards = getStandard(types);
    const highmem = getHighMem(types);
    const dedicated = getDedicated(types);
    const gpu = getGPU(types);

    const tabOrder: LinodeTypeClass[] = [];

    const shared = [...nanodes, ...standards];

    if (!isEmpty(dedicated)) {
      tabs.push({
        render: () => {
          return (
            <>
              {onAdd && (
                <Typography data-qa-dedicated className={classes.copy}>
                  Dedicated CPU instances are good for full-duty workloads where
                  consistent performance is important.
                </Typography>
              )}
              {this.renderPlanContainer(dedicated)}
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
              {this.renderPlanContainer(shared)}
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
              {onAdd && (
                <Typography data-qa-highmem className={classes.copy}>
                  High Memory instances favor RAM over other resources, and can
                  be good for memory hungry use cases like caching and in-memory
                  databases. All High Memory plans use dedicated CPU cores.
                </Typography>
              )}
              {this.renderPlanContainer(highmem)}
            </>
          );
        },
        title: 'High Memory',
      });
      tabOrder.push('highmem');
    }

    if (!isEmpty(gpu)) {
      const programInfo = gpuPlanText(true);
      tabs.push({
        render: () => {
          return (
            <>
              <Notice warning>{programInfo}</Notice>
              {onAdd && (
                <Typography data-qa-gpu className={classes.copy}>
                  Linodes with dedicated GPUs accelerate highly specialized
                  applications such as machine learning, AI, and video
                  transcoding.
                </Typography>
              )}
              {this.renderPlanContainer(gpu)}
            </>
          );
        },
        title: 'GPU',
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
      resetValues,
      currentPlanHeading,
      selectedID,
    } = this.props;

    const [tabs, tabOrder] = this.createTabs();

    // Determine initial plan category tab based on current plan selection
    // (if there is one).
    const _selectedTypeClass: LinodeTypeClass =
      types.find(
        (type) => type.id === selectedID || type.heading === currentPlanHeading
      )?.class ?? 'dedicated';

    // We don't have a "Nanodes" tab anymore, so use `standard` (labeled as "Shared CPU").
    const selectedTypeClass: LinodeTypeClass =
      _selectedTypeClass === 'nanode' ? 'standard' : _selectedTypeClass;

    const initialTab = tabOrder.indexOf(selectedTypeClass);

    return (
      <TabbedPanel
        rootClass={`${classes.root} tabbedPanel`}
        error={error}
        header={header || ' '}
        copy={copy}
        tabs={tabs}
        initTab={initialTab >= 0 ? initialTab : 0}
        handleTabChange={() => resetValues()}
      />
    );
  }
}

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(styled)(SelectPlanQuantityPanel);
