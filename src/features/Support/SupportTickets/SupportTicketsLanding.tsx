import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import AddNewLink from 'src/components/AddNewLink';
import Breadcrumb from 'src/components/Breadcrumb';
import AppBar from 'src/components/core/AppBar';
import { StyleRulesCallback, WithStyles, withStyles } from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import SupportTicketDrawer from './SupportTicketDrawer';
import TicketList from './TicketList';

type ClassNames = 'root' | 'title' | 'titleWrapper';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    wordBreak: 'break-all',
  },
});

interface Props {
  history: any;
}
type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{}>;

interface State {
  value: number;
  drawerOpen: boolean;
  notice?: string;
  newTicket?: Linode.SupportTicket;
}

export class SupportTicketsLanding extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  constructor(props:CombinedProps) {
    super(props);
    const open = pathOr(true, ['history', 'location', 'state', 'openFromRedirect'], this.props);
    this.state = {
      value: open ? 0 : 1,
      drawerOpen: false,
    }
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
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
    const { history } = this.props;
    history.push(`/support/tickets/${ticket.id}`);
    if (!this.mounted) { return; }
    this.setState({
      drawerOpen: false,
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
        <Grid container justify="space-between" style={{ marginTop: 8 }} updateFor={[]}>
          <Grid item className={classes.titleWrapper}>
            <Breadcrumb
              linkTo='/support'
              linkText='Get Help'
              labelTitle='Customer Support'
              data-qa-breadcrumb
            />
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
            scrollable
            scrollButtons="on"
          >
            <Tab data-qa-tab="Open Tickets" key={0} label="Open Tickets"/>
            <Tab data-qa-tab="Closed Tickets" key={1} label="Closed Tickets"/>
          </Tabs>
        </AppBar>
        {/* NB: 0 is the index of the open tickets tab, which evaluates to false */}
        <TicketList newTicket={newTicket} filterStatus={value ? 'closed' : 'open'} />
        {this.renderTicketDrawer()}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default compose<any,any,any>(
  styled,
  withRouter,
)(SupportTicketsLanding);
