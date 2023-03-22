import { SupportTicket } from '@linode/api-v4/lib/support';
import { pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Tab from 'src/components/core/ReachTab';
import TabList from 'src/components/core/ReachTabList';
import TabPanel from 'src/components/core/ReachTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Notice from 'src/components/Notice';
import { EntityForTicketDetails } from 'src/components/SupportLink/SupportLink';
import withGlobalErrors, {
  Props as GlobalErrorProps,
} from 'src/containers/globalErrors.container';
import { getParamsFromUrl } from 'src/utilities/queryParams';
import { AttachmentError } from '../SupportTicketDetail/SupportTicketDetail';
import SupportTicketDrawer, { TicketType } from './SupportTicketDrawer';
import TicketList from './TicketList';
import LandingHeader from 'src/components/LandingHeader';

interface Props {
  history: RouteComponentProps['history'];
}
type CombinedProps = Props &
  RouteComponentProps<{}, any, any> &
  GlobalErrorProps;

interface State {
  value: number;
  drawerOpen: boolean;
  notice?: string;
  newTicket?: SupportTicket;
  prefilledTitle?: string;
  prefilledDescription?: string;
  prefilledEntity?: EntityForTicketDetails;
  prefilledTicketType?: TicketType;
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
      prefilledTitle: stateParams ? stateParams.title : undefined,
      prefilledEntity: stateParams ? stateParams.entity : undefined,
      prefilledTicketType: stateParams ? stateParams.ticketType : undefined,
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
        search: `?type=${selectedTab}`,
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
      state: { attachmentErrors },
    });
    if (!this.mounted) {
      return;
    }
    this.setState({
      drawerOpen: false,
    });
  };

  renderTicketDrawer = () => {
    const {
      drawerOpen,
      prefilledDescription,
      prefilledTitle,
      prefilledEntity,
      prefilledTicketType,
    } = this.state;

    return (
      <SupportTicketDrawer
        open={drawerOpen}
        onClose={this.closeDrawer}
        onSuccess={this.handleAddTicketSuccess}
        prefilledDescription={prefilledDescription}
        prefilledTitle={prefilledTitle}
        prefilledEntity={prefilledEntity}
        prefilledTicketType={prefilledTicketType}
      />
    );
  };

  handleButtonKeyPress = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      this.openDrawer();
    }
  };

  render() {
    const { notice, newTicket, value } = this.state;

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Support Tickets" />
        <LandingHeader
          title="Tickets"
          createButtonText="Open New Ticket"
          onButtonClick={this.openDrawer}
          onButtonKeyPress={this.handleButtonKeyPress}
          data-qa-breadcrumb
          buttonDataAttrs={{ 'data-qa-open-ticket-link': true }}
        />
        {notice && <Notice success text={notice} />}
        <Tabs defaultIndex={value}>
          <TabList>
            <Tab data-qa-tab="Open Tickets">Open Tickets</Tab>
            <Tab data-qa-tab="Closed Tickets">Closed Tickets</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <TicketList newTicket={newTicket} filterStatus={'open'} />
            </TabPanel>
            <TabPanel>
              <TicketList newTicket={newTicket} filterStatus={'closed'} />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {this.renderTicketDrawer()}
      </React.Fragment>
    );
  }
}

export default compose<CombinedProps, Props>(
  withRouter,
  withGlobalErrors()
)(SupportTicketsLanding);
