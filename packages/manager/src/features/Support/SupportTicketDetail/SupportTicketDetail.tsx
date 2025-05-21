import {
  useInfiniteSupportTicketRepliesQuery,
  useProfile,
  useSupportTicketQuery,
} from '@linode/queries';
import { CircleProgress, ErrorState, Stack } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { useLocation, useParams } from '@tanstack/react-router';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { Waypoint } from 'react-waypoint';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

import { ExpandableTicketPanel } from '../ExpandableTicketPanel';
import { TicketAttachmentList } from '../TicketAttachmentList';
import { AttachmentError } from './AttachmentError';
import { ReplyContainer } from './TabbedReply/ReplyContainer';
import { TicketStatus } from './TicketStatus';

import type { SupportReply } from '@linode/api-v4/lib/support';
import type { SupportState } from 'src/routes/support';

export interface AttachmentError {
  error: string;
  file: string;
}

export const SupportTicketDetail = () => {
  const location = useLocation();
  const { ticketId } = useParams({ from: '/support/tickets/$ticketId' });

  const locationState = location.state as SupportState;

  const { data: profile } = useProfile();

  const {
    data: ticket,
    error,
    isLoading,
    refetch,
  } = useSupportTicketQuery(ticketId);
  const {
    data: repliesData,
    error: repliesError,
    fetchNextPage,
    hasNextPage,
    isLoading: repliesLoading,
  } = useInfiniteSupportTicketRepliesQuery(ticketId);

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

  const ticketTitle = sanitizeHTML({
    disallowedTagsMode: 'discard',
    sanitizingTier: 'none',
    text: `#${ticket.id}: ${ticket.summary}`,
  }).toString();

  return (
    <>
      <DocumentTitleSegment segment={`Support Ticket ${ticketId}`} />
      <LandingHeader
        breadcrumbProps={{
          breadcrumbDataAttrs: {
            'data-qa-breadcrumb': true,
          },
          crumbOverrides: [
            {
              linkTo: {
                pathname: `/support/tickets/${ticket.status}`,
              },
              position: 2,
            },
          ],
          pathname: location.pathname,
        }}
        title={ticketTitle}
      />
      <StyledStack spacing={2}>
        <TicketStatus {...ticket} />
        {/* If a user attached files when creating the ticket and was redirected here, display those errors. */}
        {locationState?.attachmentErrors !== undefined &&
          !isEmpty(locationState?.attachmentErrors) &&
          locationState?.attachmentErrors?.map(
            (error: AttachmentError, idx: number) => (
              <AttachmentError
                fileName={error.file}
                key={idx}
                reason={error.error}
              />
            )
          )}
        <Grid container spacing={2}>
          <Grid size={12} style={{ padding: 0 }}>
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
            {repliesLoading && <CircleProgress size="sm" />}
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
      </StyledStack>
    </>
  );
};

const StyledStack = styled(Stack, {
  label: 'StyledStack',
})(({ theme }) => ({
  marginLeft: theme.spacing(),
  marginRight: theme.spacing(),
}));
