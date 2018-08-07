import * as Bluebird from 'bluebird';
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodebalIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import CircleProgress from 'src/components/CircleProgress';
import setDocs from 'src/components/DocsSidebar/setDocs';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import { getTicket, getTicketReplies } from 'src/services/support';
import { getGravatarUrlFromHash } from 'src/utilities/gravatar';

import ExpandableTicketPanel from '../ExpandableTicketPanel';

type ClassNames = 'root'
  | 'title'
  | 'titleWrapper'
  | 'backButton'
  | 'listParent'
  | 'label'
  | 'labelIcon'
  | 'status';

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
  label: {
    marginBottom: theme.spacing.unit,
  },
  labelIcon: {
    marginLeft: -theme.spacing.unit,
    paddingRight: 0,
  },
  listParent: {
  },
  status: {
    marginLeft: theme.spacing.unit,
    padding: theme.spacing.unit,
    backgroundColor: 'yellow',
  },
});

type RouteProps = RouteComponentProps<{ ticketId?: number }>;

interface State {
  loading: boolean;
  errors?: Linode.ApiFieldError[];
  replies?: Linode.SupportReply[];
  ticket?: Linode.SupportTicket;
}

type CombinedProps = RouteProps & WithStyles<ClassNames>;

const scrollToBottom = () => {
  window.scroll({
    behavior: 'smooth',
    left: 0,
    top: document.body.scrollHeight,
  });
}

export class SupportTicketDetail extends React.Component<CombinedProps, State> {
  state: State = {
    loading: true,
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
    this.loadTicket();
    this.loadReplies();
  }

  loadTicket = () => {
    const ticketId = this.props.match.params.ticketId;
    if (!ticketId) { return; }
    getTicket(ticketId)
      .then((response) => {
        this.setState({
          ticket: response.data,
          loading: false,
        }, scrollToBottom)
      })
      .catch((errors) => {
        const status = pathOr(400, ['response', 'data', 'status'], errors);
        const error = (status === 404)
          ? [{ reason: 'Ticket could not be found.' }]
          : [{ reason: 'There was an error retrieving your ticket.' }]
        this.setState({
          errors: pathOr(error, ['response', 'data', 'errors'], errors),
          loading: false,
        })
      })
  }

  loadReplies = () => {
    const ticketId = this.props.match.params.ticketId;
    if (!ticketId) { return; }
    getTicketReplies(ticketId)
      .then((response) => {

        const uniqueGravatarIDs = response.data.reduce((acc: string[], reply) => {
          const { gravatar_id } = reply;

          return acc.includes(gravatar_id) ? acc : [...acc, gravatar_id];
        }, []);

        return Bluebird.reduce(
          uniqueGravatarIDs,
          (acc, id) => {
            return getGravatarUrlFromHash(id)
              .then((result) => ({...acc, [id]: result }));
          },
          {})
        .then((gravatarMap) => this.setState({
          replies: response.data.map((reply) => ({ ...reply, gravatarUrl: gravatarMap[reply.gravatar_id] })),
          loading: false,
        }));
      })
      .catch((errors) => {
        this.setState({
          errors: pathOr([{ reason: 'There was an error retrieving your ticket.' }], ['response', 'data', 'errors'], errors),
          loading: false,
        })
      })
  }

  onBackButtonClick = () => {
    this.props.history.push('/support/tickets');
  }

  getEntityIcon = (type: string) => {
    switch (type) {
      case 'domain':
        return <DomainIcon />
      case 'linode':
        return <LinodeIcon />
      case 'nodebalancer':
        return <NodebalIcon />
      case 'volume':
        return <VolumeIcon />
      default:
        return <LinodeIcon />
    }
  }

  renderEntityLabelWithIcon = () => {
    const { classes } = this.props;
    const { label, type } = this.state.ticket!.entity;
    const icon: JSX.Element = this.getEntityIcon(type);
    return (
      <Grid
        container
        alignItems="center"
        justify="flex-start"
        className={classes.label}
      >
        <Grid item className={classes.labelIcon}>
          {icon}
        </Grid>
        <Grid item>
          {label}
        </Grid>
      </Grid>
    )
  }

  renderReplies = (replies: Linode.SupportReply[]) => {
    return replies.map((reply: Linode.SupportReply, idx: number) => {
      return <ExpandableTicketPanel
        key={idx}
        reply={reply}
        open={idx === replies.length - 1}
      />
    });
  }

  render() {
    const { classes } = this.props;
    const { errors, loading, replies, ticket } = this.state;

    /*
    * Including loading/error states here (rather than in a
    * renderContent function) because the header
    * depends on having a ticket object for its content.
    */

    // Loading
    if (loading) {
      return <CircleProgress />
    }

    // Error state
    if (errors) {
      return (
        <ErrorState
          errorText={errors[0].reason}
        />
      );
    }

    // Empty state
    if (!ticket) {
      return null;
    }

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
        {ticket.entity && this.renderEntityLabelWithIcon()}
        <Grid container direction="column" justify="center" alignItems="center" className={classes.listParent} >
          <ExpandableTicketPanel
            key={ticket!.id}
            ticket={ticket}
          />
          {replies && this.renderReplies(replies)}
        </Grid>
      </React.Fragment>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose<any, any, any>(
  setDocs(SupportTicketDetail.docs),
  styled,
)(SupportTicketDetail)
