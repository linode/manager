import { compose, } from 'ramda';
import * as React from 'react';
import { matchPath, Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';

import AddNewLink from 'src/components/AddNewLink';
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

type Props = RouteComponentProps<{}>;
type CombinedProps = Props & WithStyles<ClassNames>;

interface State {
  drawerOpen: boolean;
  notice?: string;
}

export class SupportTicketsLanding extends React.Component<CombinedProps, State> {
  state: State = {
    drawerOpen: false,
  }
  
  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  }

  closeDrawer = () => {
    this.setState({ drawerOpen: false, notice: undefined, });
  }

  openDrawer = () => {
    this.setState({ drawerOpen: true, notice: undefined, });
  }

  handleAddTicketSuccess = (ticket:Linode.SupportTicket) => {
    this.setState({
      drawerOpen: false,
      notice: "Ticket added successfully.",
    })
  }

  tabs = [
    /* These must correspond to the routes inside the Switch */
    { title: 'Open Tickets', routeName: `${this.props.match.url}/open` },
    { title: 'Closed Tickets', routeName: `${this.props.match.url}/closed` },
  ];
  
  renderOpenTicketsList = () => {
    return <TicketList filterStatus={'open'} />
  }

  renderClosedTicketsList = () => {
    return <TicketList filterStatus={'closed'} />
  }

  renderTicketDrawer = () => {
    const { drawerOpen } = this.state;
    return <SupportTicketDrawer
      open={drawerOpen}
      onClose={this.closeDrawer}
    />
  }

  render() {
    const { classes, match: { url } } = this.props;
    const { notice } = this.state;
    const matches = (p: string) => {
      return Boolean(matchPath(p, { path: this.props.location.pathname }));
    };

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
            value={this.tabs.findIndex(tab => matches(tab.routeName))}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            {this.tabs
              .map(tab => <Tab key={tab.title} label={tab.title} data-qa-tab={tab.title}
            />)}
          </Tabs>
        </AppBar>
        <Switch>
          <Route exact path={`${url}/open`} render={this.renderOpenTicketsList} />
          <Route exact path={`${url}/closed`} render={this.renderClosedTicketsList} />
          <Route default render={this.renderOpenTicketsList} />
        </Switch>
        {this.renderTicketDrawer()}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  styled,
  withRouter,
)(SupportTicketsLanding);
