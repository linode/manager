import { Outlet, useNavigate } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { StatusBanners } from 'src/features/Help/StatusBanners';
import {
  LIVE_CHAT_FAILED_EVENT,
  SUPPORT_TOPIC_ACCOUNT_BILLING,
  SUPPORT_TOPIC_GENERAL,
} from 'src/features/Support/SupportTickets/liveChatConstants';

export const SupportRoute = () => {
  const navigate = useNavigate();

  const handleLiveChatFailed = React.useCallback(
    (event: Event) => {
      if (!(event instanceof CustomEvent)) {
        return;
      }

      const { description, subject } =
        (event.detail as {
          description?: string;
          subject?: string;
        }) ?? {};

      navigate({
        to: '/support/tickets',
        search: { dialogOpen: true },
        state: (prev) => ({
          ...prev,
          description: description || undefined,
          entityInputValue: SUPPORT_TOPIC_ACCOUNT_BILLING,
          entityType: SUPPORT_TOPIC_GENERAL,
          liveChatDisabled: true,
          title: subject || undefined,
        }),
      });
    },
    [navigate]
  );

  React.useEffect(() => {
    window.addEventListener(LIVE_CHAT_FAILED_EVENT, handleLiveChatFailed);
    return () => {
      window.removeEventListener(LIVE_CHAT_FAILED_EVENT, handleLiveChatFailed);
    };
  }, [handleLiveChatFailed]);

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <StatusBanners />
      <Outlet />
    </React.Suspense>
  );
};
