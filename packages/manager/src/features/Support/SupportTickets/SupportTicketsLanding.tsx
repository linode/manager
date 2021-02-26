import { SupportTicket } from '@linode/api-v4/lib/support';
import { pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import Tab from 'src/components/core/ReachTab';
import TabList from 'src/components/core/ReachTabList';
import TabPanel from 'src/components/core/ReachTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import withGlobalErrors, {
  Props as GlobalErrorProps,
} from 'src/containers/globalErrors.container';
import { getParamsFromUrl } from 'src/utilities/queryParams';
import { AttachmentError } from '../SupportTicketDetail/SupportTicketDetail';
import SupportTicketDrawer from './SupportTicketDrawer';
import TicketList from './TicketList_CMR';

type ClassNames =
  | 'title'
  | 'openTicketButton'
  | 'tabsWrapper'
  | 'tab'
  | 'tabList';

const styles = (theme: Theme) =>
  createStyles({
    title: {
      [theme.breakpoints.down('xs')]: {
        marginLeft: theme.spacing(),
      },
    },
    openTicketButton: {
      minWidth: 150,
      [theme.breakpoints.down('sm')]: {
        marginRight: theme.spacing(),
      },
    },
    tabsWrapper: {
      position: 'relative',
    },
    tab: {
      '&[data-reach-tab]': {
        display: 'inline-flex',
        flexShrink: 0,
        alignItems: 'center',
        borderBottom: '2px solid transparent',
        color: theme.cmrTextColors.linkActiveLight,
        fontSize: '0.9rem',
        lineHeight: 1.3,
        marginTop: theme.spacing(0.5),
        maxWidth: 264,
        minHeight: theme.spacing(5),
        minWidth: 50,
        padding: '6px 16px',
        textDecoration: 'none',
        '&:hover': {
          color: theme.color.blue,
        },
      },
      '&[data-reach-tab][data-selected]': {
        borderBottom: `3px solid ${theme.color.blue}`,
        color: theme.color.headline,
        fontFamily: theme.font.bold,
      },
    },
    tabList: {
      '&[data-reach-tab-list]': {
        background: 'none !important',
        boxShadow: `inset 0 -1px 0 ${theme.color.border2}`,
        marginBottom: theme.spacing(),
        [theme.breakpoints.down('md')]: {
          overflowX: 'auto',
          padding: 1,
        },
      },
    },
  });

interface Props {
  history: RouteComponentProps['history'];
}
type CombinedProps = Props &
  WithStyles<ClassNames> &
  RouteComponentProps<{}> &
  GlobalErrorProps;

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
      prefilledTitle: stateParams ? stateParams.title : undefined,
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
        <Grid
          container
          className="m0"
          alignItems="center"
          justify="space-between"
          updateFor={[classes]}
        >
          <Grid item className={`${classes.title} p0`}>
            <Breadcrumb
              pathname={location.pathname}
              labelTitle="Tickets"
              data-qa-breadcrumb
            />
          </Grid>
          {!this.props.globalErrors.account_unactivated && (
            <Grid item className="p0">
              <Button
                buttonType="primary"
                onClick={this.openDrawer}
                data-qa-open-ticket-link
                className={classes.openTicketButton}
                onKeyPress={e => {
                  if (e.keyCode === 13) {
                    this.openDrawer();
                  }
                }}
              >
                Open New Ticket
              </Button>
            </Grid>
          )}
        </Grid>
        {notice && <Notice success text={notice} />}
        <Tabs defaultIndex={value} className={classes.tabsWrapper}>
          <TabList className={classes.tabList}>
            <Tab data-qa-tab="Open Tickets" key={0} className={classes.tab}>
              Open Tickets
            </Tab>
            <Tab data-qa-tab="Closed Tickets" key={1} className={classes.tab}>
              Closed Tickets
            </Tab>
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

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  withRouter,
  styled,
  withGlobalErrors()
)(SupportTicketsLanding);
