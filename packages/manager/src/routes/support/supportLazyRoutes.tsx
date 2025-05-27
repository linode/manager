import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';

import { AccountActivationLanding } from 'src/components/AccountActivation/AccountActivationLanding';
import SupportSearchLanding from 'src/features/Help/SupportSearchLanding/SupportSearchLanding';
import { SupportTicketDetail } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';
import { SupportTicketsLanding } from 'src/features/Support/SupportTickets/SupportTicketsLanding';

import type { AlgoliaState as AlgoliaProps } from 'src/features/Help/SearchHOC';

export const SupportSearchLandingWrapper = (props: AlgoliaProps) => {
  return <SupportSearchLanding {...props} />;
};

export const supportTicketsLandingLazyRoute = createLazyRoute(
  '/support/tickets'
)({
  component: SupportTicketsLanding,
});

export const supportTicketDetailLazyRoute = createLazyRoute(
  '/support/tickets/$ticketId'
)({
  component: SupportTicketDetail,
});

export const accountActivationLandingLazyRoute = createLazyRoute(
  '/account-activation'
)({
  component: AccountActivationLanding,
});
