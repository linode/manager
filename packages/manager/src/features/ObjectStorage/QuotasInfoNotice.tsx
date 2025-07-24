import { Notice } from '@linode/ui';
import { Link } from '@tanstack/react-router';
import React from 'react';

export const QuotasInfoNotice = ({ action }: { action: string }) => {
  return (
    <Notice variant="info">
      Did you know you can check your usage and quotas before {action}?
      <Link to="/account/quotas"> View Quotas.</Link>
    </Notice>
  );
};
