import { SupportReply } from '@linode/api-v4/lib/support';
import { Stack } from 'src/components/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';
import { Waypoint } from 'react-waypoint';
import { makeStyles } from 'tss-react/mui';

import { Chip } from 'src/components/Chip';
import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { EntityIcon } from 'src/components/EntityIcon/EntityIcon';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useProfile } from 'src/queries/profile';
import {
  useInfiniteSupportTicketRepliesQuery,
  useSupportTicketQuery,
} from 'src/queries/support';
import { capitalize } from 'src/utilities/capitalize';
import { formatDate } from 'src/utilities/formatDate';
import { getLinkTargets } from 'src/utilities/getEventsActionLink';

import { ExpandableTicketPanel } from '../ExpandableTicketPanel';
import TicketAttachmentList from '../TicketAttachmentList';
import AttachmentError from './AttachmentError';
import { ReplyContainer } from './TabbedReply/ReplyContainer';

import type { EntityVariants } from 'src/components/EntityIcon/EntityIcon';

const useStyles = makeStyles()((theme: Theme) => ({
  closed: {
    backgroundColor: theme.color.red,
  },
  open: {
    backgroundColor: theme.color.green,
  },
  status: {
    color: theme.color.white,
    marginLeft: theme.spacing(1),
    marginTop: 5,
  },
  ticketLabel: {
    position: 'relative',
    top: -3,
  },
  title: {
    alignItems: 'center',
    display: 'flex',
  },
}));

export interface AttachmentError {
  error: string;
  file: string;
}

const SupportTicketDetail = () => {
  const history = useHistory<{ attachmentErrors?: AttachmentError[] }>();
  const location = useLocation();
  const { ticketId } = useParams<{ ticketId: string }>();
  const id = Number(ticketId);

  const { classes, cx } = useStyles();

  const attachmentErrors = history.location.state?.attachmentErrors;

  const { data: profile } = useProfile();

  const { data: ticket, error, isLoading, refetch } = useSupportTicketQuery(id);
  const {
    data: repliesData,
    error: repliesError,
    fetchNextPage,
    hasNextPage,
    isLoading: repliesLoading,
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
      <Notice spacingTop={12} variant="success">
        <Stack alignItems="center" direction="row" spacing={1}>
          <EntityIcon size={20} variant={entity.type as EntityVariants} />
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
        [classes.closed]: ticket.status === 'closed',
        [classes.open]: ticket.status === 'open' || ticket.status === 'new',
        [classes.status]: true,
      })}
      component="div"
      label={ticket.status}
      role="term"
    />
  );

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={`Support Ticket ${ticketId}`} />
      <LandingHeader
        breadcrumbProps={{
          breadcrumbDataAttrs: {
            'data-qa-breadcrumb': true,
          },
          crumbOverrides: [
            {
              linkTo: {
                pathname: `/support/tickets`,
                // If we're viewing a `Closed` ticket, the Breadcrumb link should take us to `Closed` tickets.
                search: `type=${
                  ticket.status === 'closed' ? 'closed' : 'open'
                }`,
              },
              position: 2,
            },
          ],
          labelOptions: {
            subtitle: `${status} by ${ticket.updated_by} at ${formattedDate}`,
            suffixComponent: <_Chip />,
          },
          pathname: location.pathname,
        }}
        title={`#${ticket.id}: ${ticket.summary}`}
      />

      {/* If a user attached files when creating the ticket and was redirected here, display those errors. */}
      {attachmentErrors !== undefined &&
        !isEmpty(attachmentErrors) &&
        attachmentErrors?.map((error, idx: number) => (
          <AttachmentError
            fileName={error.file}
            key={idx}
            reason={error.error}
          />
        ))}

      {ticket.entity && renderEntityLabelWithIcon()}

      <Grid container spacing={2}>
        <Grid xs={12}>
          {/* If the ticket isn't blank, display it, followed by replies (if any). */}
          {ticket.description && (
            <ExpandableTicketPanel
              isCurrentUser={profile?.username === ticket.opened_by}
              key={ticket.id}
              ticket={ticket}
            />
          )}
          {replies?.map((reply: SupportReply, idx: number) => (
            <ExpandableTicketPanel
              isCurrentUser={profile?.username === reply.created_by}
              key={idx}
              open={idx === replies.length - 1}
              parentTicket={ticket ? ticket.id : undefined}
              reply={reply}
              ticketUpdated={ticket ? ticket.updated : ''}
            />
          ))}
          {repliesLoading && <CircleProgress mini />}
          {repliesError ? (
            <ErrorState errorText={repliesError?.[0].reason} />
          ) : null}
          {hasNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
          <TicketAttachmentList attachments={ticket.attachments} />
          {/* If the ticket is open, allow users to reply to it. */}
          {['new', 'open'].includes(ticket.status) && (
            <ReplyContainer
              closable={ticket.closable}
              lastReply={replies && replies[replies?.length - 1]}
              reloadAttachments={refetch}
              ticketId={ticket.id}
            />
          )}
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default SupportTicketDetail;
