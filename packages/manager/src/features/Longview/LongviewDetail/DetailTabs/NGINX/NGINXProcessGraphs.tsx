import * as React from 'react';
import { compose } from 'recompose';
import {
  makeStyles,
  Theme,
  WithTheme,
  withTheme
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { readableBytes } from 'src/utilities/unitConversions';
import { NginxUserProcess, NginxUserProcesses } from '../../../request.types';
import { convertData, formatMemory } from '../../../shared/formatters';
import { statMax, sumStatsObject } from '../../../shared/utilities';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2)
  },
  graphSection: {
    paddingTop: theme.spacing(2)
  }
}));

interface Props {
  data: NginxUserProcesses;
  loading: boolean;
  isToday: boolean;
  timezone: string;
  error?: string;
  start: number;
  end: number;
}

type CombinedProps = Props & WithTheme;

export const NGINXProcessGraphs: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { data, error, loading, isToday, timezone, start, end, theme } = props;

  const totalDataForAllUsers = React.useMemo(
    () => sumStatsObject<NginxUserProcess>(data),
    [data]
  );

  const _convertData = React.useCallback(convertData, [data, start, end]);

  const memoryUnit = readableBytes(statMax(totalDataForAllUsers.mem ?? []))
    .unit;

  /**
   * @todo these fields say "kbytes" but Classic displays
   * them in the graphs labeled as B/s. Need to look into this
   * and multiply by 1024 if these values really are KB.
   */
  const diskRead = totalDataForAllUsers.ioreadkbytes ?? [];
  const diskWrite = totalDataForAllUsers.iowritekbytes ?? [];
  const maxDisk = Math.max(statMax(diskRead), statMax(diskWrite));
  const diskUnit = readableBytes(maxDisk).unit;

  return (
    <>
      <Grid item className={classes.graphSection} xs={12}>
        <Grid container direction="row">
          <Grid item xs={12} sm={6}>
            <LongviewLineGraph
              title="CPU"
              subtitle={'%'}
              error={error}
              loading={loading}
              showToday={isToday}
              timezone={timezone}
              data={[
                {
                  label: 'CPU',
                  borderColor: '#63d997',
                  backgroundColor: '#63d997',
                  data: _convertData(
                    totalDataForAllUsers.cpu ?? [],
                    start,
                    end,
                    formatData
                  )
                }
              ]}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LongviewLineGraph
              title="RAM"
              subtitle={memoryUnit}
              error={error}
              loading={loading}
              showToday={isToday}
              timezone={timezone}
              data={[
                {
                  label: 'RAM',
                  borderColor: '#e083e0',
                  backgroundColor: '#e083e0',
                  data: _convertData(
                    totalDataForAllUsers.mem ?? [],
                    start,
                    end,
                    formatMemory
                  )
                }
              ]}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item className={classes.graphSection} xs={12}>
        <Grid container direction="row">
          <Grid item xs={12} sm={6}>
            <LongviewLineGraph
              title="Disk I/O"
              subtitle={`${diskUnit}/s`}
              error={error}
              loading={loading}
              showToday={isToday}
              timezone={timezone}
              data={[
                {
                  label: 'Read',
                  borderColor: theme.graphs.lightYellow,
                  backgroundColor: theme.graphs.lightYellow,
                  data: _convertData(diskRead, start, end, formatData)
                },
                {
                  label: 'Write',
                  borderColor: theme.graphs.lightOrange,
                  backgroundColor: theme.graphs.lightOrange,
                  data: _convertData(diskWrite, start, end, formatData)
                }
              ]}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LongviewLineGraph
              title="Process Count"
              error={error}
              loading={loading}
              showToday={isToday}
              timezone={timezone}
              data={[
                {
                  label: 'Count',
                  borderColor: '#7156f5',
                  backgroundColor: '#7156f5',
                  data: _convertData(
                    totalDataForAllUsers.count ?? [],
                    start,
                    end,
                    formatData
                  )
                }
              ]}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

const formatData = (value: number | null) => {
  if (value === null) {
    return value;
  }

  // Round to 2 decimal places.
  return Math.round(value * 100) / 100;
};

const enhanced = compose<CombinedProps, Props>(
  withTheme,
  React.memo
)(NGINXProcessGraphs);
export default enhanced;
