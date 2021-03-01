import {
  DatabaseAvailability,
  DatabaseType,
} from '@linode/api-v4/lib/databases/index';
import { isEmpty } from 'ramda';
import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Grid from 'src/components/Grid';
import Radio from 'src/components/Radio';
import SelectionCard from 'src/components/SelectionCard';
import TabbedPanel from 'src/components/TabbedPanel';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';
import Table_CMR from 'src/components/Table/Table_CMR';
import TableCell_CMR from 'src/components/TableCell/TableCell_CMR';
import TableRow_CMR from 'src/components/TableRow/TableRow_CMR';
import {
  ExtendedType,
  extendType,
} from 'src/store/databases/databases.reducer';
import { convertMegabytesTo } from 'src/utilities/unitConversions';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  headingCellContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  headerCell: {
    borderTop: 'none !important',
    borderBottom: '1px solid #f4f5f6 !important',
    '&.emptyCell': {
      borderRight: 'none',
    },
    '&:not(.emptyCell)': {
      borderLeft: 'none !important',
    },
  },
  radioCell: {
    width: '5%',
    height: 55,
  },
  chip: {
    backgroundColor: theme.color.green,
    color: '#fff',
    textTransform: 'uppercase',
    marginLeft: theme.spacing(2),
  },
  tabbedPanelInnerClass: {
    padding: 0,
  },
}));

interface Props {
  databasePlans: DatabaseType[];
  onPlanSelect: (id: string) => void;
  selectedPlanId: string;
  errorText?: string;
}

type CombinedProps = Props;

export const SelectDBPlanPanel: React.FC<CombinedProps> = (props) => {
  const { databasePlans, onPlanSelect, selectedPlanId, errorText } = props;
  const selectPlan = (id: string) => () => onPlanSelect(id);

  const databasePlansExtended = databasePlans.map((databasePlan) =>
    extendType(databasePlan)
  );

  const classes = useStyles();

  const getStandardAvails = (types: DatabaseType[]) =>
    types.filter((type) => /standard/.test(type.availability));
  const getHighAvails = (types: DatabaseType[]) =>
    types.filter((type) => /high/.test(type.availability));

  const createTabs = (): [Tab[], DatabaseAvailability[]] => {
    const tabs: Tab[] = [];

    const standardAvailability = getStandardAvails(databasePlansExtended);
    const highAvailability = getHighAvails(databasePlansExtended);

    const tabOrder: DatabaseAvailability[] = [];

    if (!isEmpty(standardAvailability)) {
      tabs.push({
        render: () => {
          // eslint-disable-next-line react/jsx-no-useless-fragment
          return <>{renderPlanContainer(standardAvailability)}</>;
        },
        title: 'Standard Availability',
      });
      tabOrder.push('standard');
    }

    if (!isEmpty(highAvailability)) {
      tabs.push({
        render: () => {
          // eslint-disable-next-line react/jsx-no-useless-fragment
          return <>{renderPlanContainer(highAvailability)}</>;
        },
        title: 'High Availability',
      });
      tabOrder.push('high');
    }

    return [tabs, tabOrder];
  };

  const renderPlanContainer = (plans: DatabaseType[]) => {
    const tableHeader = (
      <TableHead>
        <TableRow_CMR>
          <TableCell_CMR className={classes.headerCell} />
          <TableCell_CMR className={classes.headerCell} data-qa-plan-header>
            Plan
          </TableCell_CMR>
          <TableCell_CMR className={classes.headerCell} data-qa-monthly-header>
            Monthly
          </TableCell_CMR>
          <TableCell_CMR className={classes.headerCell} data-qa-hourly-header>
            Hourly
          </TableCell_CMR>
          <TableCell_CMR className={classes.headerCell} data-qa-cpu-header>
            CPUs
          </TableCell_CMR>
          <TableCell_CMR className={classes.headerCell} data-qa-ram-header>
            RAM
          </TableCell_CMR>
          <TableCell_CMR className={classes.headerCell} data-qa-storage-header>
            Storage
          </TableCell_CMR>
          <TableCell_CMR className={classes.headerCell} data-qa-storage-header>
            Backups
          </TableCell_CMR>
        </TableRow_CMR>
      </TableHead>
    );

    return (
      <Grid container>
        <Hidden mdUp>{plans.map(renderSelection)}</Hidden>
        <Hidden smDown>
          <Grid item xs={12} lg={10}>
            <Table_CMR
              border
              spacingBottom={16}
              aria-label="List of Database Plans"
            >
              {tableHeader}
              <TableBody role="radiogroup">
                {plans.map(renderSelection)}
              </TableBody>
            </Table_CMR>
          </Grid>
        </Hidden>
      </Grid>
    );
  };

  const renderSelection = (type: ExtendedType, idx: number) => {
    return (
      <React.Fragment key={`tabbed-panel-${idx}`}>
        {/* Displays Table Row for larger screens */}
        <Hidden smDown>
          <TableRow_CMR
            data-qa-plan-row={type.label}
            aria-label={type.label}
            key={type.id}
            onClick={selectPlan(type.id)}
            rowLink={selectPlan(type.id)}
          >
            <TableCell_CMR className={classes.radioCell}>
              <FormControlLabel
                label={type.label}
                aria-label={type.label}
                className={'label-visually-hidden'}
                control={
                  <Radio
                    checked={type.id === selectedPlanId}
                    onChange={selectPlan(type.id)}
                    disabled={false}
                    id={type.id}
                  />
                }
              />
            </TableCell_CMR>
            <TableCell_CMR data-qa-plan-name>
              <div className={classes.headingCellContainer}>{type.label} </div>
            </TableCell_CMR>
            <TableCell_CMR data-qa-monthly>${type.price.monthly}</TableCell_CMR>
            <TableCell_CMR data-qa-hourly> ${type.price.hourly}</TableCell_CMR>
            <TableCell_CMR data-qa-cpu>{type.vcpus}</TableCell_CMR>
            <TableCell_CMR data-qa-ram>
              {convertMegabytesTo(type.memory, true)}
            </TableCell_CMR>
            <TableCell_CMR data-qa-storage>{type.disk} GB</TableCell_CMR>
            <TableCell_CMR data-qa-backup>
              Daily — Included in Plan
            </TableCell_CMR>
          </TableRow_CMR>
        </Hidden>
        {/* Displays SelectionCard for small screens */}
        <Hidden mdUp>
          <SelectionCard
            key={type.id}
            checked={type.id === selectedPlanId}
            onClick={selectPlan(type.id)}
            heading={type.label}
            subheadings={type.subHeadings}
            variant={'check'}
          />
        </Hidden>
      </React.Fragment>
    );
  };

  const [tabs] = createTabs();

  const dbPlansCopy =
    'Standard Availability allocates a single node to your database cluster. High Availability allocates 3 nodes for increased reliability and fault tolerance and has no downtime during maintenance.';

  return (
    <TabbedPanel
      rootClass={`${classes.root} tabbedPanel`}
      innerClass={classes.tabbedPanelInnerClass}
      header={'Database Plans'}
      error={errorText}
      copy={dbPlansCopy}
      tabs={tabs}
      initTab={0}
      data-qa-select-plan
    />
  );
};

export default React.memo(SelectDBPlanPanel);
