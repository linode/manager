import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';

import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
// import Select from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';

import withLongviewClients, {
  DispatchProps,
  Props as LVProps
} from 'src/containers/longview.container';

interface Props {
  clients: LVProps['longviewClientsData'];
  longviewClientsLastUpdated: number;
}

type CombinedProps = RouteComponentProps<{ id: string }> &
  Props &
  DispatchProps;

const LongviewDetailOverview: React.FC<CombinedProps> = props => {
  return (
    <React.Fragment>
      <Grid container>
        <Grid item xs={12}>
          <Paper>Header section here</Paper>
        </Grid>
        <Grid
          container
          alignItems="flex-end"
          justify="space-between"
          item
          xs={12}
          spacing={0}
        >
          <Grid item>
            <Typography variant="h2">Resource Allocation History</Typography>
          </Grid>
          <Grid item>
            {/* TODO make this functional
              <Select
                options={rangeSelectOptions}
                defaultValue={rangeSelectOptions[0]}
                onChange={handleChartRangeChange}
                name="chartRange"
                id="chartRange"
                small
                label="Select Time Range"
                hideLabel
                isClearable={false}
                data-qa-item="chartRange"
              />
              */}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Paper>Graphs here</Paper>
        </Grid>
        <Grid container item xs={12}>
          <Grid item xs={12} md={8}>
            <Typography variant="h2">Listening Services</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h2">Active Connections</Typography>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(
  React.memo,
  withLongviewClients<Props, {}>(
    (own, { longviewClientsData, longviewClientsLastUpdated }) => ({
      clients: longviewClientsData,
      longviewClientsLastUpdated
    })
  )
)(LongviewDetailOverview);
