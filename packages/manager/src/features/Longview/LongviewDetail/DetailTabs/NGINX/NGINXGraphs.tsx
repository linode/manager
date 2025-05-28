import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';

import { convertData } from '../../../shared/formatters';
import { StyledRootPaper, StyledSmallGraphGrid } from '../CommonStyles.styles';
import { ProcessGraphs } from '../ProcessGraphs';

import type { LongviewProcesses, NginxResponse } from '../../../request.types';

interface Props {
  data?: NginxResponse;
  end: number;
  error?: string;
  isToday: boolean;
  loading: boolean;
  processesData: LongviewProcesses;
  processesError?: string;
  processesLoading: boolean;
  start: number;
  timezone: string;
}

export const NGINXGraphs = React.memo((props: Props) => {
  const {
    data,
    end,
    error,
    isToday,
    loading,
    processesData,
    processesError,
    processesLoading,
    start,
    timezone,
  } = props;

  const theme = useTheme();

  const _convertData = React.useCallback(convertData, [data, start, end]);

  const graphProps = {
    error,
    loading,
    nativeLegend: true,
    showToday: isToday,
    timezone,
  };

  return (
    <StyledRootPaper>
      <Grid container direction="column" spacing={0}>
        <Grid size={{ xs: 12 }}>
          <LongviewLineGraph
            ariaLabel="Requests Per Second Graph"
            data={[
              {
                backgroundColor: theme.graphs.requests,
                borderColor: 'transparent',
                data: _convertData(data?.requests ?? [], start, end),
                label: 'Requests',
              },
            ]}
            subtitle="requests/s"
            title="Requests"
            unit=" requests/s"
            {...graphProps}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Grid container direction="row" spacing={2}>
            <StyledSmallGraphGrid size={{ sm: 6, xs: 12 }}>
              <LongviewLineGraph
                ariaLabel="Connections Per Second Graph"
                data={[
                  {
                    backgroundColor: theme.graphs.connections.accepted,
                    borderColor: 'transparent',
                    data: _convertData(data?.accepted_cons ?? [], start, end),
                    label: 'Accepted',
                  },
                  {
                    backgroundColor: theme.graphs.connections.handled,
                    borderColor: 'transparent',
                    data: _convertData(data?.handled_cons ?? [], start, end),
                    label: 'Handled',
                  },
                ]}
                subtitle="connections/s"
                title="Connections"
                unit=" connections/s"
                {...graphProps}
              />
            </StyledSmallGraphGrid>
            <StyledSmallGraphGrid size={{ sm: 6, xs: 12 }}>
              <LongviewLineGraph
                ariaLabel="Workers Graph"
                data={[
                  {
                    backgroundColor: theme.graphs.workers.waiting,
                    borderColor: 'transparent',
                    data: _convertData(data?.waiting ?? [], start, end),
                    label: 'Waiting',
                  },
                  {
                    backgroundColor: theme.graphs.workers.reading,
                    borderColor: 'transparent',
                    data: _convertData(data?.reading ?? [], start, end),
                    label: 'Reading',
                  },
                  {
                    backgroundColor: theme.graphs.workers.writing,
                    borderColor: 'transparent',
                    data: _convertData(data?.writing ?? [], start, end),
                    label: 'Writing',
                  },
                ]}
                title="Workers"
                {...graphProps}
              />
            </StyledSmallGraphGrid>
          </Grid>
        </Grid>
        <ProcessGraphs
          data={processesData}
          end={end}
          error={processesError || error}
          isToday={isToday}
          loading={processesLoading}
          start={start}
          timezone={timezone}
        />
      </Grid>
    </StyledRootPaper>
  );
});
