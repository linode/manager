import { SupportTicket } from '@linode/api-v4/lib/support';
import { pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import AbuseTicketBanner from 'src/components/AbuseTicketBanner';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TabPanel from 'src/components/core/ReachTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import Tab from 'src/components/core/ReachTab';
import TabList from 'src/components/core/ReachTabList';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { getParamsFromUrl } from 'src/utilities/queryParams';
import { AttachmentError } from '../SupportTicketDetail/SupportTicketDetail';
import SupportTicketDrawer from './SupportTicketDrawer';
import TicketList from './TicketList';
import TicketList_CMR from './TicketList_CMR';
import withGlobalErrors, {
  Props as GlobalErrorProps
} from 'src/containers/globalErrors.container';
import withFlags, {
  FeatureFlagConsumerProps
} from 'src/containers/withFeatureFlagConsumer.container';

type ClassNames =
  | 'title'
  | 'openTicketButton'
  | 'tabsWrapper'
  | 'tab'
  | 'tabList';

const styles = (theme: Theme) =>
  createStyles({
    title: {
      marginBottom: theme.spacing(2)
    },
    openTicketButton: {
      minWidth: 150,
      paddingLeft: theme.spacing(1) + 4,
      paddingRight: theme.spacing(1) + 4
    },
    tabsWrapper: {
      position: 'relative'
    },
    tab: {
      '&[data-reach-tab]': {
        // This was copied over from our MuiTab styling in themeFactory. Some of this could probably be cleaned up.
        color: theme.color.tableHeaderText,
        minWidth: 50,
        textTransform: 'inherit',
        fontSize: '0.93rem',
        padding: '6px 16px',
        position: 'relative',
        overflow: 'hidden',
        maxWidth: 264,
        boxSizing: 'border-box',
        borderBottom: '2px solid transparent',
        minHeight: theme.spacing(1) * 6,
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
        justifyContent: 'center',
        appearance: 'none',
        lineHeight: 1.3,
        [theme.breakpoints.up('md')]: {
          minWidth: 75
        },
        '&:hover': {
          color: theme.color.blue
        }
      },
      '&[data-reach-tab][data-selected]': {
        fontFamily: theme.font.bold,
        color: theme.color.headline,
        borderBottom: `2px solid ${theme.color.blue}`
      }
    },
    tabList: {
      '&[data-reach-tab-list]': {
        background: 'none !important',
        boxShadow: `inset 0 -1px 0 ${theme.color.border2}`,
        marginBottom: theme.spacing(3),
        [theme.breakpoints.down('md')]: {
          overflowX: 'scroll',
          padding: 1
        }
      }
    }
  });

interface Props {
  history: RouteComponentProps['history'];
}
type CombinedProps = Props &
  WithStyles<ClassNames> &
  RouteComponentProps<{}> &
  GlobalErrorProps &
  FeatureFlagConsumerProps;

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
          {!this.props.globalErrors.account_unactivated && (
            <Grid item>
              <Grid container alignItems="flex-end">
                <Grid item>
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
              </Grid>
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
              {this.props.flags.cmr ? (
                <TicketList_CMR newTicket={newTicket} filterStatus={'open'} />
              ) : (
                <TicketList newTicket={newTicket} filterStatus={'open'} />
              )}
            </TabPanel>
            <TabPanel>
              {this.props.flags.cmr ? (
                <TicketList_CMR newTicket={newTicket} filterStatus={'closed'} />
              ) : (
                <TicketList newTicket={newTicket} filterStatus={'closed'} />
              )}
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
  withGlobalErrors(),
  withFlags
)(SupportTicketsLanding);
