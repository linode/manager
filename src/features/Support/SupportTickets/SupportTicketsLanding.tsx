import { compose } from 'ramda';
import * as React from 'react';

import AppBar from '@material-ui/core/AppBar';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';


import AddNewLink from 'src/components/AddNewLink';
import Grid from 'src/components/Grid';

import TicketList from './TicketList';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {}
type CombinedProps = Props & WithStyles<ClassNames>;

interface State {
  value: number;
}

export class SupportTicketsLanding extends React.Component<CombinedProps, State> {
  state: State = {
    value: 0,
  }

  handleChange = (event:React.ChangeEvent<HTMLDivElement>, value:number) => {
    this.setState({ value });
  }

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }} updateFor={[]}>
          <Grid item>
            <Typography variant="headline" className={classes.title} data-qa-title >
              Customer Support
            </Typography>
          </Grid>
          <Grid item>
            <Grid container alignItems="flex-end">
              <Grid item>
                <AddNewLink
                  disabled
                  onClick={() => null}
                  label="Open New Ticket"
                  data-qa-open-ticket-link
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <AppBar position="static" color="default">
          <Tabs
            value={value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            className={classes.root}
          >
            <Tab key={0} label="Open Tickets"/>
            <Tab key={1} label="Closed Tickets"/>
          </Tabs>
        </AppBar>
        <TicketList filterStatus={value ? 'open' : 'closed'} />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  styled,
)(SupportTicketsLanding);
