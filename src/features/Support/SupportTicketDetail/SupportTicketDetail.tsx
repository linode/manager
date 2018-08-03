import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import setDocs from 'src/components/DocsSidebar/setDocs';
import Grid from 'src/components/Grid';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { getTicket, getTicketRepliesPage } from 'src/services/support';

import ExpandableTicketPanel from '../ExpandableTicketPanel';

type ClassNames = 'root' |
  'title' |
  'titleWrapper' |
  'backButton' |
  'listParent' |
  'status';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  backButton: {
    margin: '2px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34,
    },
  },
  listParent: {
  },
  status: {
    height: 25,
    width: 25,
    marginLeft: theme.spacing.unit,
    paddingLeft: theme.spacing.unit*2,
    paddingRight: theme.spacing.unit*2,
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    backgroundColor: 'yellow',
  }, 
});

interface PreloadedProps {
  ticket: PromiseLoaderResponse<Linode.SupportTicket>;
  replies: PromiseLoaderResponse<Linode.SupportReply[]>;
  }

type RouteProps = RouteComponentProps<{ ticketId?: number }>;

interface State {
  errors?: Linode.ApiFieldError[];
  replies?: Linode.SupportReply[];
  ticket?: Linode.SupportTicket;
}

type CombinedProps = RouteProps & PreloadedProps & WithStyles<ClassNames>;

const preloaded = PromiseLoader<CombinedProps>({
  ticket: ({ match: { params: { ticketId } } }) => {
    if (!ticketId) {
      return Promise.reject(new Error('ticketId param not set.'));
    }

    return getTicket(ticketId);
  },
  replies: ({ match: { params: { ticketId } } }) => {
    if (!ticketId) {
      return Promise.reject(new Error('ticketId param not set.'));
    }

    return getTicketRepliesPage(ticketId);
  },
});

const scrollToBottom = () => {
  window.scroll({
    behavior: 'smooth',
    left: 0,
    top: document.body.scrollHeight,
  });
}

export class SupportTicketDetail extends React.Component<CombinedProps,State> {
  state: State = {
    ticket: pathOr(undefined, ['response', 'data'], this.props.ticket),
    replies: pathOr(undefined, ['response','data'], this.props.replies)
  }

  static docs: Linode.Doc[] = [
    {
      title: 'Linode Support',
      src: 'https://linode.com/docs/platform/billing-and-support/support/',
      body: `Linode provides live technical support services 24 hours a day, 7 days a week. Linode Support ensures network availability, verifies that you can access your Linode, resolves performance issues with hosts, and works to fix any service-related issues you may be experiencing.
      Linode also offers a number of resources you can refer to when troubleshooting application and server configuration issues. These issues are generally outside the scope of Linode Support, and the other resources Linode provides can help you find solutions for your questions.`,
    },
  ];

  componentDidMount() {
    scrollToBottom();
  }

  onBackButtonClick = () => {
    this.props.history.push('/support/tickets');
  }

  renderContent = () => {
    const { errors, replies, ticket } = this.state;

    // Error state
    if (errors) {
      return <div>There was an error.</div>
    }

    // Empty state
    if (!ticket) {
      return <div>Ticket is not loaded.</div>
    }

    return (
      <React.Fragment>
        <ExpandableTicketPanel key={ticket.id} ticket={ticket} />
        {replies && replies.map((reply: Linode.SupportReply, idx:number) =>
          <ExpandableTicketPanel key={idx} reply={reply} open={idx === replies.length - 1} />
        )}
      </React.Fragment>
    )
  }

  render() {
    const { classes } = this.props;
    const { ticket } = this.state;

    if (!ticket) { return null; }
    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }}>
            <Grid item className={classes.titleWrapper}>
              <IconButton
                onClick={this.onBackButtonClick}
                className={classes.backButton}
              >
                <KeyboardArrowLeft />
              </IconButton>
              <Typography variant="headline" className={classes.title} data-qa-domain-title>
                {`#${ticket.id}: ${ticket.summary}`}
                <Chip className={classes.status} label={ticket.status} />
              </Typography>
            </Grid>
        </Grid>
        <Grid container direction="column" justify="center" alignItems="center" className={classes.listParent} >
          {this.renderContent()}
        </Grid>
      </React.Fragment>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

const reloaded = reloadableWithRouter<PreloadedProps, { ticketId?: number }>(
  (routePropsOld, routePropsNew) => {
    return routePropsOld.match.params.ticketId !== routePropsNew.match.params.ticketId;
  },
);

export default compose<any,any,any,any,any>(
  setDocs(SupportTicketDetail.docs),
  styled,
  reloaded,
  preloaded,
)(SupportTicketDetail)