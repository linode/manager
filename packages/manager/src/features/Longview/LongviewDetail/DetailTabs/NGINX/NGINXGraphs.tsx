import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';

import { LongviewProcesses, NginxResponse } from '../../../request.types';
import { convertData } from '../../../shared/formatters';
import {
  StyledItemGrid,
  StyledRootPaper,
  StyledSmallGraphGrid,
} from '../CommonStyles.styles';
import { ProcessGraphs } from '../ProcessGraphs';

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
        <StyledItemGrid xs={12}>
          <LongviewLineGraph
            data={[
              {
                backgroundColor: theme.graphs.requests,
                borderColor: 'transparent',
                data: _convertData(data?.requests ?? [], start, end),
                label: 'Requests',
              },
            ]}
            ariaLabel="Requests Per Second Graph"
            subtitle="requests/s"
            title="Requests"
            unit=" requests/s"
            {...graphProps}
          />
        </StyledItemGrid>
        <StyledItemGrid xs={12}>
          <Grid container direction="row" spacing={2}>
            <StyledSmallGraphGrid sm={6} xs={12}>
              <LongviewLineGraph
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
                ariaLabel="Connections Per Second Graph"
                subtitle="connections/s"
                title="Connections"
                unit=" connections/s"
                {...graphProps}
              />
            </StyledSmallGraphGrid>
            <StyledSmallGraphGrid sm={6} xs={12}>
              <LongviewLineGraph
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
                ariaLabel="Workers Graph"
                title="Workers"
                {...graphProps}
              />
            </StyledSmallGraphGrid>
          </Grid>
        </StyledItemGrid>
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
