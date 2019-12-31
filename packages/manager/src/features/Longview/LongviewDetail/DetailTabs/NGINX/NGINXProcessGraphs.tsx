import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { NginxUserProcess, NginxUserProcesses } from '../../../request.types';
import { convertData } from '../../../shared/formatters';
import { sumStatsObject } from '../../../shared/utilities';

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

export const NGINXProcessGraphs: React.FC<Props> = props => {
  const classes = useStyles();
  const { data, error, loading, isToday, timezone, start, end } = props;

  const totalDataForAllUsers = React.useMemo(
    () => sumStatsObject<NginxUserProcess>(data),
    [data]
  );

  const _convertData = React.useCallback(convertData, [data, start, end]);

  return (
    <>
      <Grid item className={classes.graphSection} xs={12}>
        <Grid container direction="row">
          <Grid item xs={12} sm={6}>
            <LongviewLineGraph
              title="CPU"
              subtitle={'KB' + '/s'}
              error={error}
              loading={loading}
              showToday={isToday}
              timezone={timezone}
              data={[
                {
                  label: 'Waiting',
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
              subtitle={'KB' + '/s'}
              error={error}
              loading={loading}
              showToday={isToday}
              timezone={timezone}
              data={[
                {
                  label: 'RAM',
                  borderColor: '#63d997',
                  backgroundColor: '#63d997',
                  data: _convertData(
                    totalDataForAllUsers.mem ?? [],
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
      <Grid item className={classes.graphSection} xs={12}>
        <Grid container direction="row">
          <Grid item xs={12} sm={6}>
            <LongviewLineGraph
              title="Disk I/O"
              subtitle={'KB' + '/s'}
              error={error}
              loading={loading}
              showToday={isToday}
              timezone={timezone}
              data={[
                {
                  label: 'Read',
                  borderColor: '#63d997',
                  backgroundColor: '#63d997',
                  data: _convertData(
                    totalDataForAllUsers.ioreadkbytes ?? [],
                    start,
                    end,
                    formatData
                  )
                },
                {
                  label: 'Write',
                  borderColor: '#63d997',
                  backgroundColor: '#63d997',
                  data: _convertData(
                    totalDataForAllUsers.iowritekbytes ?? [],
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
              title="Process Count"
              subtitle={'KB' + '/s'}
              error={error}
              loading={loading}
              showToday={isToday}
              timezone={timezone}
              data={[
                {
                  label: 'Count',
                  borderColor: '#63d997',
                  backgroundColor: '#63d997',
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

export default React.memo(NGINXProcessGraphs);
