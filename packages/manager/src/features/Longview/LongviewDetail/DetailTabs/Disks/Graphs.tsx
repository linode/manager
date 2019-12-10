import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';

import Typography from 'src/components/core/Typography';

import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { Stat } from '../../../request.types';

const useStyles = makeStyles((theme: Theme) => ({
  graphContainer: {
    marginTop: theme.spacing(),
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-around',
    '& > div': {
      flexGrow: 1,
      width: '33%',
      [theme.breakpoints.down('md')]: {
        marginTop: theme.spacing(),
        width: '60%'
      }
    }
  }
}));

export interface Props {
  isSwap: boolean;
  childOf: boolean;
  sysInfoType: string;
  isMounted: boolean;
  timezone: string;
  iFree: Stat[];
  iTotal: Stat[];
  free: Stat[];
  total: Stat[];
  diskLabel: string;
  startTime: number;
  endTime: number;
}

type CombinedProps = Props & WithTheme;

const Graphs: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    isSwap,
    childOf,
    sysInfoType,
    diskLabel,
    theme,
    timezone,
    free,
    total,
    iFree,
    isMounted,
    iTotal,
    startTime,
    endTime
  } = props;

  if (childOf) {
    /** @todo document the why here. This comes from old Longview.JS */
    return (
      <Typography variant="subtitle1">
        <strong>{diskLabel}</strong>
        <React.Fragment>
          {' '}
          Longview doesn't gather data on this type of device.
        </React.Fragment>
      </Typography>
    );
  }

  const isToday = endTime - startTime < 60 * 60 * 25;
  const labelHelperText = generateHelperText(sysInfoType, isSwap, isMounted);

  return (
    <React.Fragment>
      <Typography variant="subtitle1">
        <React.Fragment>
          <strong>{diskLabel}</strong>
          {!!labelHelperText && <React.Fragment> &ndash; </React.Fragment>}
          {labelHelperText}
        </React.Fragment>
      </Typography>
      <div className={classes.graphContainer}>
        {/* 
            openVZ disks don't have I/O stats. This logic comes straight from 
            old Longview.JS, so a big @todo here is to document why this
            is the way it is.
          */}
        {sysInfoType.toLowerCase() !== 'openvz' && (
          <div data-testid="diskio-graph">
            <LongviewLineGraph
              data={[
                {
                  /** idk yet lol */
                  data: [],
                  label: 'Disk I/O',
                  borderColor: theme.graphs.orangeBorder,
                  backgroundColor: theme.graphs.orange
                }
              ]}
              title="Disk I/O"
              showToday={isToday}
              subtitle="ops/s"
              timezone={timezone}
            />
          </div>
        )}
        {/*
            only show inodes and space if the
            disk is mounted and is not a swap partition
            because longview doesn't track those stats
          */
        !isSwap && isMounted && (
          <React.Fragment>
            <div data-testid="space-graph">
              <LongviewLineGraph
                data={[
                  {
                    data: formatSpace(free, total),
                    label: 'Space',
                    borderColor: theme.graphs.salmonBorder,
                    backgroundColor: theme.graphs.salmon
                  }
                ]}
                showToday={isToday}
                title="Space"
                subtitle="GB"
                timezone={timezone}
              />
            </div>
            <div data-testid="inodes-graph">
              <LongviewLineGraph
                data={[
                  {
                    data: formatINodes(iFree, iTotal),
                    label: 'Inodes',
                    borderColor: theme.graphs.pinkBorder,
                    backgroundColor: theme.graphs.pink
                  }
                ]}
                showToday={isToday}
                suggestedMax={1000000}
                title="Inodes"
                timezone={timezone}
              />
            </div>
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
};

export const formatINodes = (
  ifree: Stat[],
  itotal: Stat[]
): [number, number][] => {
  return itotal.map((eachTotalStat, index) => [
    eachTotalStat.x * 1000,
    eachTotalStat.y - pathOr(0, [index, 'y'], ifree)
  ]);
};

export const formatSpace = (
  free: Stat[],
  total: Stat[]
): [number, number][] => {
  return total.map((eachTotalStat, index) => [
    eachTotalStat.x * 1000,
    /* convert bytes to GB */
    (eachTotalStat.y - pathOr(0, [index, 'y'], free)) / 1024 / 1024 / 1024
  ]);
};

export const generateHelperText = (
  type: string,
  isSwap: boolean,
  isMounted: boolean
) => {
  const diskIsOpenVZType = type.toLowerCase() === 'openvz';

  if (diskIsOpenVZType) {
    return "Longview doesn't gather Disk I/O on OpenVZ Linodes.";
  }

  if (isSwap) {
    return "Longview doesn't gather Space and Inode data on Swap disks.";
  }

  if (!isMounted) {
    return "Longview doesn't gather Space and Inode data on unmounted disks.";
  }

  return '';
};

export default compose<CombinedProps, Props>(
  React.memo,
  withTheme
)(Graphs);
