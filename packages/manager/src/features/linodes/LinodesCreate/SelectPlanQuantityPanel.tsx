import * as classnames from 'classnames';
import { LinodeType, LinodeTypeClass } from 'linode-js-sdk/lib/linodes';
import { isEmpty, pathOr } from 'ramda';
import * as React from 'react';
import Button from 'src/components/Button';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import EnhancedNumberInput from 'src/components/EnhancedNumberInput';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
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

const useStyles = makeStyles((theme: Theme) => ({
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
    minWidth: 90,
    paddingTop: 12,
    paddingBottom: 12
  }
}));

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
  addPool?: any;
  isOnCreate?: boolean;
  updatePlanCount: any;
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

export const SelectPlanQuantityPanel: React.FC<Props> = props => {
  const {
    selectedID,
    disabled,
    submitForm,
    isOnCreate,
    updatePlanCount,
    types,
    currentPlanHeading,
    error,
    header,
    copy,
    addPool
  } = props;
  const classes = useStyles();

  const onSelect = (id: string) => () => onSelect(id);

  const renderSelection = (type: ExtendedTypeWithCount, idx: number) => {
    return (
      <React.Fragment key={`tabbed-panel-${idx}`}>
        {/* Displays Table Row for larger screens */}
        <Hidden smDown>
          <TableRow
            data-qa-plan-row={type.label}
            key={type.id}
            onClick={onSelect(type.id)}
            rowLink={onSelect ? onSelect(type.id) : undefined}
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
                    onChange={onSelect(type.id)}
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
            <TableCell data-qa-cpu>{type.vcpus}</TableCell>
            <TableCell data-qa-storage>
              {convertMegabytesTo(type.disk, true)}
            </TableCell>
            <TableCell data-qa-ram>
              {convertMegabytesTo(type.memory, true)}
            </TableCell>
            <TableCell>
              <div className={classes.enhancedInputOuter}>
                <EnhancedNumberInput
                  value={type.count}
                  setValue={(newCount: number) =>
                    updatePlanCount(type.id, newCount)
                  }
                />
                {isOnCreate && (
                  <Button
                    buttonType="primary"
                    onClick={() => submitForm!(type.id, type.count)}
                    disabled={type.id !== String(selectedID)}
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
            onClick={onSelect(type.id)}
            heading={type.heading}
            subheadings={type.subHeadings}
            disabled={disabled}
            variant={'quantityCheck'}
            inputValue={type.count}
            setInputValue={updatePlanCount}
            displayButton={isOnCreate}
            submitForm={() => submitForm!(type.id, type.count)}
            buttonDisabled={type.id !== String(selectedID)}
          />
        </Hidden>
      </React.Fragment>
    );
  };

  const renderPlanContainer = (plans: ExtendedType[]) => {
    const tableHeader = (
      <TableHead>
        <TableRow>
          <TableCell className={'visually-hidden'} />
          <TableCell data-qa-plan-header>Linode Plan</TableCell>
          <TableCell data-qa-monthly-header>Monthly</TableCell>
          <TableCell data-qa-hourly-header>Hourly</TableCell>
          <TableCell data-qa-cpu-header>CPUs</TableCell>
          <TableCell data-qa-storage-header>Storage</TableCell>
          <TableCell data-qa-ram-header>Ram</TableCell>
          <TableCell>
            <p className="visually-hidden">Quantity</p>
          </TableCell>
        </TableRow>
      </TableHead>
    );

    return (
      <Grid container>
        <Hidden mdUp>{plans.map(renderSelection)}</Hidden>
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
                performance isn't critical.
              </Typography>
              {renderPlanContainer(nanodes)}
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
              {renderPlanContainer(standards)}
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
              {renderPlanContainer(dedicated)}
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
              {renderPlanContainer(highmem)}
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
              {renderPlanContainer(gpu)}
            </>
          );
        },
        title: 'GPU'
      });
      tabOrder.push('gpu');
    }

    return [tabs, tabOrder];
  };

  const [tabs, tabOrder] = createTabs();

  // Determine initial plan category tab based on current plan selection
  // (if there is one).
  const selectedTypeClass: LinodeTypeClass = pathOr(
    'standard', // Use `standard` by default
    ['class'],
    types.find(type => type.heading === currentPlanHeading)
  );

  const initialTab = tabOrder.indexOf(selectedTypeClass);

  return (
    <React.Fragment>
      <TabbedPanel
        rootClass={`${classes.root} tabbedPanel`}
        error={error}
        header={header || 'Linode Plan'}
        copy={copy}
        tabs={tabs}
        initTab={initialTab}
      />
      {!isOnCreate && (
        <Button buttonType="primary" onClick={addPool} disabled={disabled}>
          Add pool
        </Button>
      )}
    </React.Fragment>
  );
};

export default React.memo(SelectPlanQuantityPanel);
