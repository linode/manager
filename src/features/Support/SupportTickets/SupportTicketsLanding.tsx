import { compose, pathOr } from 'ramda';
import * as React from 'react';

import AppBar from '@material-ui/core/AppBar';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';

import AddNewLink from 'src/components/AddNewLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';

import SupportTicketDrawer from './SupportTicketDrawer';
import TicketList from './TicketList';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {
  history: any;
}
type CombinedProps = Props & WithStyles<ClassNames>;

interface State {
  value: number;
  drawerOpen: boolean;
  notice?: string;
  newTicket?: Linode.SupportTicket;
}

export class SupportTicketsLanding extends React.Component<CombinedProps, State> {  
  constructor(props:CombinedProps) {
    super(props);
    const open = pathOr(true, ['history', 'location', 'state', 'openFromRedirect'], this.props);
    this.state = {
      value: open ? 0 : 1,
      drawerOpen: false,
    }
  }

  handleChange = (event:React.ChangeEvent<HTMLDivElement>, value:number) => {
    this.setState({ value, notice: undefined });
  }

  closeDrawer = () => {
    this.setState({ drawerOpen: false });
  }

  openDrawer = () => {
    this.setState({ drawerOpen: true, notice: undefined, });
  }

  handleAddTicketSuccess = (ticket:Linode.SupportTicket) => {
    this.setState({
      drawerOpen: false,
      notice: "Ticket added successfully.",
      newTicket: ticket,
    })
  }

  renderTicketDrawer = () => {
    const { drawerOpen } = this.state;
    return <SupportTicketDrawer
      open={drawerOpen}
      onClose={this.closeDrawer}
      onSuccess={this.handleAddTicketSuccess}
    />
  }

  render() {
    const { classes } = this.props;
    const { notice, newTicket, value } = this.state;


    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Support Tickets" />
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }} updateFor={[]}>
          <Grid item>
            <Typography role="header" variant="headline" className={classes.title} data-qa-title >
              Customer Support
            </Typography>
          </Grid>
          <Grid item>
            <Grid container alignItems="flex-end">
              <Grid item>
                <AddNewLink
                  onClick={this.openDrawer}
                  label="Open New Ticket"
                  data-qa-open-ticket-link
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {notice && <Notice success text={notice} />}
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
        {/* NB: 0 is the index of the open tickets tab, which evaluates to false */}
        <TicketList newTicket={newTicket} filterStatus={value ? 'closed' : 'open'} />
        {this.renderTicketDrawer()}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  styled,
)(SupportTicketsLanding);
