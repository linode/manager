import { Outlet, useNavigate } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { StatusBanners } from 'src/features/Help/StatusBanners';

export const SupportTicketsRoute = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleLiveChatFailed = (event: Event) => {
      const { description, subject } =
        (event as CustomEvent<{ description: string; subject: string }>)
          .detail ?? {};

      navigate({
        to: '/support/tickets',
        search: { dialogOpen: true },
        state: (prev) => ({
          ...prev,
          description: description || undefined,
          entityInputValue: 'accountBilling',
          entityType: 'general',
          liveChatDisabled: true,
          title: subject || undefined,
        }),
      });
    };

    window.addEventListener('manager:live-chat-failed', handleLiveChatFailed);
    return () => {
      window.removeEventListener(
        'manager:live-chat-failed',
        handleLiveChatFailed
      );
    };
  }, [navigate]);

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <StatusBanners />
      <Outlet />
    </React.Suspense>
  );
};
