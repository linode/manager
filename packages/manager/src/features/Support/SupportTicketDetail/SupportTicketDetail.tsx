import { CircleProgress, ErrorState, Stack } from '@linode/ui';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import { createLazyRoute } from '@tanstack/react-router';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { Waypoint } from 'react-waypoint';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { useProfile } from 'src/queries/profile/profile';
import {
  useInfiniteSupportTicketRepliesQuery,
  useSupportTicketQuery,
} from 'src/queries/support';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

import { ExpandableTicketPanel } from '../ExpandableTicketPanel';
import { TicketAttachmentList } from '../TicketAttachmentList';
import { AttachmentError } from './AttachmentError';
import { ReplyContainer } from './TabbedReply/ReplyContainer';
import { TicketStatus } from './TicketStatus';

import type { SupportReply } from '@linode/api-v4/lib/support';

export interface AttachmentError {
  error: string;
  file: string;
}

export const SupportTicketDetail = () => {
  const history = useHistory<{ attachmentErrors?: AttachmentError[] }>();
  const location = useLocation();
  const { ticketId } = useParams<{ ticketId: string }>();
  const id = Number(ticketId);

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

  const ticketTitle = sanitizeHTML({
    disallowedTagsMode: 'discard',
    sanitizingTier: 'none',
    text: `#${ticket.id}: ${ticket.summary}`,
  }).toString();

  return (
    <StyledStack spacing={2}>
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
          pathname: location.pathname,
        }}
        title={ticketTitle}
      />
      <TicketStatus {...ticket} />
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
      <Grid container spacing={2}>
        <Grid style={{ padding: 0 }} size={12}>
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
  );
};

const StyledStack = styled(Stack, {
  label: 'StyledStack',
})(({ theme }) => ({
  marginLeft: theme.spacing(),
  marginRight: theme.spacing(),
}));

export const supportTicketDetailLazyRoute = createLazyRoute(
  '/support/tickets/$ticketId'
)({
  component: SupportTicketDetail,
});
