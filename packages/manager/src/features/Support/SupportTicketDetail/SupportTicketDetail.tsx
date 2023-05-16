import { SupportReply } from '@linode/api-v4/lib/support';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';
import { CircleProgress } from 'src/components/CircleProgress';
import Chip from 'src/components/core/Chip';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from '@mui/material/Unstable_Grid2';
import formatDate from 'src/utilities/formatDate';
import { ExpandableTicketPanel } from '../ExpandableTicketPanel';
import TicketAttachmentList from '../TicketAttachmentList';
import AttachmentError from './AttachmentError';
import { ReplyContainer } from './TabbedReply/ReplyContainer';
import LandingHeader from 'src/components/LandingHeader';
import {
  useInfiniteSupportTicketRepliesQuery,
  useSupportTicketQuery,
} from 'src/queries/support';
import { useProfile } from 'src/queries/profile';
import EntityIcon, { Variant } from 'src/components/EntityIcon';
import { Waypoint } from 'react-waypoint';
import Stack from '@mui/material/Stack';
import { Notice } from 'src/components/Notice/Notice';
import { getLinkTargets } from 'src/utilities/getEventsActionLink';
import { capitalize } from 'src/utilities/capitalize';

const useStyles = makeStyles()((theme: Theme) => ({
  title: {
    display: 'flex',
    alignItems: 'center',
  },
  ticketLabel: {
    position: 'relative',
    top: -3,
  },
  status: {
    marginTop: 5,
    marginLeft: theme.spacing(1),
    color: theme.color.white,
  },
  open: {
    backgroundColor: theme.color.green,
  },
  closed: {
    backgroundColor: theme.color.red,
  },
}));

export interface AttachmentError {
  file: string;
  error: string;
}

const SupportTicketDetail = () => {
  const history = useHistory<{ attachmentErrors?: AttachmentError[] }>();
  const location = useLocation();
  const { ticketId } = useParams<{ ticketId: string }>();
  const id = Number(ticketId);

  const { classes, cx } = useStyles();

  const attachmentErrors = history.location.state?.attachmentErrors;

  const { data: profile } = useProfile();

  const { data: ticket, isLoading, error, refetch } = useSupportTicketQuery(id);
  const {
    data: repliesData,
    isLoading: repliesLoading,
    error: repliesError,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteSupportTicketRepliesQuery(id);

  const replies = repliesData?.pages.flatMap((page) => page.data);

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error?.[0].reason} />;
  }

  if (!ticket) {
    return null;
  }

  const formattedDate = formatDate(ticket.updated, {
    timezone: profile?.timezone,
  });

  const status = ticket.status === 'closed' ? 'Closed' : 'Last updated';

  const renderEntityLabelWithIcon = () => {
    const entity = ticket?.entity;

    if (!entity) {
      return null;
    }

    const target = getLinkTargets(entity);

    return (
      <Notice success spacingTop={12}>
        <Stack direction="row" spacing={1} alignItems="center">
          <EntityIcon size={20} variant={entity.type as Variant} />
          <Typography>
            This ticket is associated with your {capitalize(entity.type)}{' '}
            {target ? <Link to={target}>{entity.label}</Link> : entity.label}
          </Typography>
        </Stack>
      </Notice>
    );
  };

  const _Chip = () => (
    <Chip
      className={cx({
        [classes.status]: true,
        [classes.open]: ticket.status === 'open' || ticket.status === 'new',
        [classes.closed]: ticket.status === 'closed',
      })}
      label={ticket.status}
      component="div"
      role="term"
    />
  );

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={`Support Ticket ${ticketId}`} />
      <LandingHeader
        title={`#${ticket.id}: ${ticket.summary}`}
        breadcrumbProps={{
          pathname: location.pathname,
          breadcrumbDataAttrs: {
            'data-qa-breadcrumb': true,
          },
          labelOptions: {
            subtitle: `${status} by ${ticket.updated_by} at ${formattedDate}`,
            suffixComponent: <_Chip />,
          },
          crumbOverrides: [
            {
              position: 2,
              linkTo: {
                pathname: `/support/tickets`,
                // If we're viewing a `Closed` ticket, the Breadcrumb link should take us to `Closed` tickets.
                search: `type=${
                  ticket.status === 'closed' ? 'closed' : 'open'
                }`,
              },
            },
          ],
        }}
      />

      {/* If a user attached files when creating the ticket and was redirected here, display those errors. */}
      {attachmentErrors !== undefined &&
        !isEmpty(attachmentErrors) &&
        attachmentErrors?.map((error, idx: number) => (
          <AttachmentError
            key={idx}
            fileName={error.file}
            reason={error.error}
          />
        ))}

      {ticket.entity && renderEntityLabelWithIcon()}

      <Grid container spacing={2}>
        <Grid xs={12}>
          {/* If the ticket isn't blank, display it, followed by replies (if any). */}
          {ticket.description && (
            <ExpandableTicketPanel
              key={ticket.id}
              ticket={ticket}
              isCurrentUser={profile?.username === ticket.opened_by}
            />
          )}
          {replies?.map((reply: SupportReply, idx: number) => (
            <ExpandableTicketPanel
              key={idx}
              reply={reply}
              open={idx === replies.length - 1}
              parentTicket={ticket ? ticket.id : undefined}
              ticketUpdated={ticket ? ticket.updated : ''}
              isCurrentUser={profile?.username === reply.created_by}
            />
          ))}
          {repliesLoading && <CircleProgress mini />}
          {repliesError ? (
            <ErrorState errorText={repliesError?.[0].reason} />
          ) : null}
          {hasNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
          <TicketAttachmentList attachments={ticket.attachments} />
          {/* If the ticket is open, allow users to reply to it. */}
          {['open', 'new'].includes(ticket.status) && (
            <ReplyContainer
              ticketId={ticket.id}
              closable={ticket.closable}
              reloadAttachments={refetch}
              lastReply={replies && replies[replies?.length - 1]}
            />
          )}
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default SupportTicketDetail;
