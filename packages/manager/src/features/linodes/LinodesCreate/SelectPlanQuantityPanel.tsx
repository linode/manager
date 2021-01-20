import * as classnames from 'classnames';
import { PoolNodeRequest } from '@linode/api-v4/lib/kubernetes/types';
import { LinodeType, LinodeTypeClass } from '@linode/api-v4/lib/linodes/types';
import { isEmpty, pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Button from 'src/components/Button';
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
import EnhancedNumberInput from 'src/components/EnhancedNumberInput';
import Grid from 'src/components/Grid';
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
  | 'headingCellContainer'
  | 'currentPlanChipCell'
  | 'radioCell'
  | 'enhancedInputOuter'
  | 'enhancedInputButton';

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
    },
    enhancedInputOuter: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    enhancedInputButton: {
      marginLeft: 10,
      minWidth: 85,
      paddingTop: 7,
      paddingBottom: 7
    }
  });

export interface ExtendedTypeWithCount extends ExtendedType {
  count: number;
}

interface Props {
  types: ExtendedTypeWithCount[];
  error?: string;
  onSelect: (key: string) => void;
  selectedID?: string;
  selectedDiskSize?: number;
  currentPlanHeading?: string;
  disabled?: boolean;
  header?: string;
  copy?: string;
  submitForm?: (key: string, value: number) => void;
  addPool?: (pool?: PoolNodeRequest) => void;
  isOnCreate?: boolean;
  updatePlanCount: any;
  isSubmitting?: boolean;
  resetValues: () => void;
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

  renderSelection = (type: ExtendedTypeWithCount, idx: number) => {
    const {
      selectedID,
      disabled,
      classes,
      submitForm,
      isOnCreate,
      updatePlanCount
    } = this.props;

    return (
      <React.Fragment key={`tabbed-panel-${idx}`}>
        {/* Displays Table Row for larger screens */}
        <Hidden smDown>
          <TableRow
            data-qa-plan-row={type.label}
            key={type.id}
            className={classnames({
              [classes.disabledRow]: disabled
            })}
          >
            <TableCell className={'visually-hidden'}>
              <FormControlLabel
                label={type.heading}
                aria-label={type.heading}
                className={'label-visually-hidden'}
                control={
                  <Radio
                    checked={type.id === String(selectedID)}
                    onChange={this.onSelect(type.id)}
                    disabled={disabled}
                    id={type.id}
                  />
                }
              />
            </TableCell>
            <TableCell data-qa-plan-name>
              <div className={classes.headingCellContainer}>
                {type.heading}{' '}
              </div>
            </TableCell>
            <TableCell data-qa-monthly> ${type.price.monthly}</TableCell>
            <TableCell data-qa-hourly>{`$` + type.price.hourly}</TableCell>
            <TableCell data-qa-ram>
              {convertMegabytesTo(type.memory, true)}
            </TableCell>
            <TableCell data-qa-cpu>{type.vcpus}</TableCell>
            <TableCell data-qa-storage>
              {convertMegabytesTo(type.disk, true)}
            </TableCell>
            <TableCell>
              <div className={classes.enhancedInputOuter}>
                <EnhancedNumberInput
                  inputLabel={`edit-quantity-${type.id}`}
                  value={type.count}
                  setValue={(newCount: number) =>
                    updatePlanCount(type.id, newCount)
                  }
                  disabled={
                    // When on the add pool flow, we only want the current input to be active,
                    // unless we've just landed on the form or all the inputs are empty.
                    !isOnCreate && Boolean(selectedID) && type.count < 1
                  }
                  small
                />
                {isOnCreate && (
                  <Button
                    buttonType="primary"
                    onClick={() => submitForm!(type.id, type.count)}
                    disabled={type.count < 1}
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
            subheadings={type.subHeadings}
            disabled={disabled}
            variant={'quantityCheck'}
            inputValue={type.count}
            setInputValue={(newCount: number) =>
              updatePlanCount(type.id, newCount)
            }
            displayButton={isOnCreate}
            submitForm={() => submitForm!(type.id, type.count)}
            buttonDisabled={type.id !== String(selectedID)}
          />
        </Hidden>
      </React.Fragment>
    );
  };

  renderPlanContainer = (plans: ExtendedType[]) => {
    const tableHeader = (
      <TableHead>
        <TableRow>
          <TableCell className={'visually-hidden'} />
          <TableCell data-qa-plan-header>Plan</TableCell>
          <TableCell data-qa-monthly-header>Monthly</TableCell>
          <TableCell data-qa-hourly-header>Hourly</TableCell>
          <TableCell data-qa-ram-header>RAM</TableCell>
          <TableCell data-qa-cpu-header>CPUs</TableCell>
          <TableCell data-qa-storage-header>Storage</TableCell>
          <TableCell>
            <p className="visually-hidden">Quantity</p>
          </TableCell>
        </TableRow>
      </TableHead>
    );

    return (
      <Grid container>
        <Hidden mdUp>{plans.map(this.renderSelection)}</Hidden>
        <Hidden smDown>
          <Grid item xs={12} lg={12}>
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
    const { classes, types, isOnCreate } = this.props;
    const tabs: Tab[] = [];
    const nanodes = getNanodes(types);
    const standards = getStandard(types);
    const highmem = getHighMem(types);
    const dedicated = getDedicated(types);
    const gpu = getGPU(types);

    const tabOrder: LinodeTypeClass[] = [];

    const shared = [...nanodes, ...standards];

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
        title: 'Shared CPU'
      });
      tabOrder.push('standard');
    }

    if (!isEmpty(dedicated)) {
      tabs.push({
        render: () => {
          return (
            <>
              {isOnCreate && (
                <Typography data-qa-dedicated className={classes.copy}>
                  Dedicated CPU instances are good for full-duty workloads where
                  consistent performance is important.
                </Typography>
              )}
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
              {isOnCreate && (
                <Typography data-qa-highmem className={classes.copy}>
                  High Memory instances favor RAM over other resources, and can
                  be good for memory hungry use cases like caching and in-memory
                  databases. All High Memory plans contain dedicated CPU cores.
                </Typography>
              )}
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
          Linode GPU Instances are deployed as finite resources and may not be
          available at the time of your request. Some additional verification
          may be required to access these services.
          <a
            href="https://www.linode.com/docs/platform/linode-gpu/getting-started-with-gpu/"
            target="_blank"
            aria-describedby="external-site"
            rel="noopener noreferrer"
          >
            {` `}Here is a guide
          </a>{' '}
          with information on getting started.
        </Typography>
      );
      tabs.push({
        render: () => {
          return (
            <>
              <Notice warning>{programInfo}</Notice>
              {isOnCreate && (
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
      resetValues,
      currentPlanHeading,
      selectedID
    } = this.props;

    const [tabs, tabOrder] = this.createTabs();

    // Determine initial plan category tab based on current plan selection
    // (if there is one).
    let selectedTypeClass: LinodeTypeClass = pathOr(
      'standard', // Use `standard` by default
      ['class'],
      types.find(
        type => type.id === selectedID || type.heading === currentPlanHeading
      )
    );

    // We don't have a "Nanodes" tab anymore, so use `standard` (labeled as "Shared CPU").
    if (selectedTypeClass === 'nanode') {
      selectedTypeClass = 'standard';
    }

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

export default compose<
  Props & WithStyles<ClassNames>,
  Props & RenderGuardProps
>(
  RenderGuard,
  styled
)(SelectPlanPanel);
