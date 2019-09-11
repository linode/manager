import { SupportTicket } from "linode-js-sdk/lib/account";
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import AbuseTicketBanner from 'src/components/AbuseTicketBanner';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import AppBar from 'src/components/core/AppBar';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { getParamsFromUrl } from 'src/utilities/queryParams';
import { AttachmentError } from '../SupportTicketDetail/SupportTicketDetail';
import SupportTicketDrawer from './SupportTicketDrawer';
import TicketList from './TicketList';

type ClassNames = 'title';

const styles = (theme: Theme) =>
  createStyles({
    title: {
      marginBottom: theme.spacing(2)
    }
  });

interface Props {
  history: any;
}
type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{}>;

interface State {
  value: number;
  drawerOpen: boolean;
  notice?: string;
  newTicket?: SupportTicket;
  prefilledTitle?: string;
  prefilledDescription?: string;
}

const tabs = ['open', 'closed'];

// Returns 0 if `type=open`, 1 if `type=closed`. Defaults to 0.
export const getSelectedTabFromQueryString = (queryString: string) => {
  const parsedParams = getParamsFromUrl(queryString);
  const preSelectedTab = pathOr('open', ['type'], parsedParams).toLowerCase();

  const idx = tabs.indexOf(preSelectedTab);

  return idx !== -1 ? idx : 0;
};

export class SupportTicketsLanding extends React.PureComponent<
  CombinedProps,
  State
> {
  mounted: boolean = false;
  constructor(props: CombinedProps) {
    super(props);

    /** ?drawerOpen=true to allow external links to go directly to the ticket drawer */
    const parsedParams = getParamsFromUrl(props.location.search);
    const drawerOpen = pathOr('false', ['drawerOpen'], parsedParams) === 'true';

    const stateParams = this.props.location.state;

    this.state = {
      value: getSelectedTabFromQueryString(props.location.search),
      /** If we came here via a SupportLink that's passing data, use that to determine initial state
       * @todo used state state params here to allow passing long/private descriptions without
       * messing with the URL. However, since we also want to be able to have external links
       * that open the drawer, is this duplicative and bad?
       */
      drawerOpen: stateParams ? stateParams.open : drawerOpen,
      prefilledDescription: stateParams ? stateParams.description : undefined,
      prefilledTitle: stateParams ? stateParams.title : undefined
    };
  }

  componentDidUpdate() {
    const selectedTabValue = getSelectedTabFromQueryString(
      this.props.location.search
    );

    if (selectedTabValue !== this.state.value) {
      this.setState({ value: selectedTabValue });
    }
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const selectedTab = tabs[value];
    this.setState({ value, notice: undefined });

    if (selectedTab) {
      this.props.history.push({
        search: `?type=${selectedTab}`
      });
    }
  };

  closeDrawer = () => {
    this.setState({ drawerOpen: false });
  };

  openDrawer = () => {
    this.setState({ drawerOpen: true, notice: undefined });
  };

  handleAddTicketSuccess = (
    ticketId: number,
    attachmentErrors: AttachmentError[] = []
  ) => {
    const { history } = this.props;
    history.push({
      pathname: `/support/tickets/${ticketId}`,
      state: { attachmentErrors }
    });
    if (!this.mounted) {
      return;
    }
    this.setState({
      drawerOpen: false
    });
  };

  renderTicketDrawer = () => {
    const { drawerOpen, prefilledDescription, prefilledTitle } = this.state;
    return (
      <SupportTicketDrawer
        open={drawerOpen}
        onClose={this.closeDrawer}
        onSuccess={this.handleAddTicketSuccess}
        prefilledDescription={prefilledDescription}
        prefilledTitle={prefilledTitle}
      />
    );
  };

  render() {
    const { classes, location } = this.props;
    const { notice, newTicket, value } = this.state;

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Support Tickets" />
        <AbuseTicketBanner />
        <Grid
          container
          justify="space-between"
          updateFor={[classes]}
          alignItems="center"
        >
          <Grid item>
            <Breadcrumb
              pathname={location.pathname}
              labelTitle="Tickets"
              data-qa-breadcrumb
            />
          </Grid>
          <Grid item>
            <Grid container alignItems="flex-end">
              <Grid item>
                <Button
                  buttonType="primary"
                  onClick={this.openDrawer}
                  data-qa-open-ticket-link
                >
                  Open New Ticket
                </Button>
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
            variant="scrollable"
            scrollButtons="on"
          >
            <Tab data-qa-tab="Open Tickets" key={0} label="Open Tickets" />
            <Tab data-qa-tab="Closed Tickets" key={1} label="Closed Tickets" />
          </Tabs>
        </AppBar>
        {/* NB: 0 is the index of the open tickets tab, which evaluates to false */}
        <TicketList
          newTicket={newTicket}
          filterStatus={value ? 'closed' : 'open'}
        />
        {this.renderTicketDrawer()}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default compose<any, any, any>(
  withRouter,
  styled
)(SupportTicketsLanding);
