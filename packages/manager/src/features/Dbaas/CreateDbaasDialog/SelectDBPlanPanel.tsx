import * as React from 'react';
import { isEmpty } from 'ramda';
import Radio from 'src/components/Radio';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Hidden from 'src/components/core/Hidden';
import SelectionCard from 'src/components/SelectionCard';

import TableHead from 'src/components/core/TableHead';
import Table_CMR from 'src/components/Table/Table_CMR';
import TableCell_CMR from 'src/components/TableCell/TableCell_CMR';
import TableRow_CMR from 'src/components/TableRow/TableRow_CMR';
import TableBody from 'src/components/core/TableBody';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Chip from 'src/components/core/Chip';
import { convertMegabytesTo } from 'src/utilities/unitConversions';

const useStyles = makeStyles((theme: Theme) => ({
  headingCellContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  headerCell: {
    borderTop: 'none !important',
    borderBottom: '1px solid #f4f5f6 !important',
    '&.emptyCell': {
      borderRight: 'none'
    },
    '&:not(.emptyCell)': {
      borderLeft: 'none !important'
    }
  },
  radioCell: {
    width: '5%',
    height: 55
  },
  chip: {
    backgroundColor: theme.color.green,
    color: '#fff',
    textTransform: 'uppercase',
    marginLeft: theme.spacing(2)
  }
}));

export const SelectDBPlanPanel: React.FC<{}> = _ => {
  const classes = useStyles();

  //   const createTabs = (): [Tab[]] => {
  //     const tabs: Tab[] = [];

  //     const standardAvailability = [];
  //     const highAvailability = [];

  //     const shared = [...standardAvailability, ...highAvailability];

  //     if (!isEmpty(shared)) {
  //       tabs.push({
  //           render: () => {
  //               return (
  //                   <></>
  //               );
  //           };
  //         },
  //         title: 'Standard Availability'
  //       });
  //     }
  //   };

  const renderPlanContainer = plans => {
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
        <Hidden mdUp>
          Placeholder {/* {plans.map(this.renderSelection)} */}
        </Hidden>
        <Hidden smDown>
          <Grid item xs={12} lg={10}>
            <Table_CMR
              border
              spacingBottom={16}
              aria-label="List of Database Plans"
            >
              {tableHeader}
              <TableBody role="radiogroup">
                Placeholder {/* {plans.map(this.renderSelection)} */}
              </TableBody>
            </Table_CMR>
          </Grid>
        </Hidden>
      </Grid>
    );
  };

  const renderSelection = (type: any, idx: number) => {
    const isSamePlan = false; // type.heading === currentPlanHeading;

    return (
      <React.Fragment key={`tabbed-panel-${idx}`}>
        {/* Displays Table Row for larger screens */}
        <Hidden smDown>
          <TableRow_CMR
            data-qa-plan-row={type.label}
            aria-label={}
            key={type.id}
            onClick={}
            rowLink={}
            aria-disabled={}
            className={}
          >
            <TableCell_CMR className={classes.radioCell}>
              {!isSamePlan && (
                <FormControlLabel
                  label={type.heading}
                  aria-label={type.heading}
                  className={'label-visually-hidden'}
                  control={
                    <Radio checked={} onChange={} disabled={} id={type.id} />
                  }
                />
              )}
            </TableCell_CMR>
            <TableCell_CMR data-qa-plan-name>
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
              </div>
            </TableCell_CMR>
            <TableCell_CMR data-qa-monthly>${type.price.monthly}</TableCell_CMR>
            <TableCell_CMR data-qa-hourly> ${type.price.hourly}</TableCell_CMR>
            <TableCell_CMR data-qa-cpu>{type.vcpus}</TableCell_CMR>
            <TableCell_CMR data-qa-ram>
              {convertMegabytesTo(type.memory, true)}
            </TableCell_CMR>
            <TableCell_CMR data-qa-storage>
              {convertMegabytesTo(type.disk, true)}
            </TableCell_CMR>
          </TableRow_CMR>
        </Hidden>
        {/* Displays SelectionCard for small screens */}
        <Hidden mdUp>
          <SelectionCard
            key={type.id}
            checked={}
            onClick={() => console.log('Clicked')}
            heading={type.heading}
            subheadings={type.subHeadings}
            disabled={false}
            // tooltip={tooltip}
            variant={'check'}
          />
        </Hidden>
      </React.Fragment>
    );
  };

  return (
    <>
      <Typography variant="h3">Database Plans</Typography>
      <Typography variant="body2">
        Standard Availabilty allocates a single node to your database cluster.
        High Availability allocates 3 nodes for increased reliability and fault
        tolerance and has no downtime during maintenance.
      </Typography>
      <Table_CMR border spacingBottom={16} aria-label="List of Database Plans">
        {renderPlanContainer}
      </Table_CMR>
    </>
  );
};

export default SelectDBPlanPanel;
