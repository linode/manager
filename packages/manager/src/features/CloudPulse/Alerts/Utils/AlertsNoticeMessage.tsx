import { Notice } from '@linode/ui';
import React from 'react';

import type { NoticeVariant } from '@linode/ui';
import type { SxProps } from '@mui/material';

interface AlertNoticeWrapperProps {
  /**
   * The content to display within the Wrapper component
   */
  children: React.ReactNode;
  /**
   * Additional styles to apply for the Notice component
   */
  sx?: SxProps;
  /**
   * The visual variant of the notice (e.g., 'error', 'warning', 'success')
   */
  variant: NoticeVariant;
}
/**
 * Wrapper component for displaying error messages within a Notice component
 */
export const AlertNoticeWrapper = (props: AlertNoticeWrapperProps) => {
  const { children, sx, variant } = props;
  return (
    <Notice sx={sx} variant={variant}>
      {children}
    </Notice>
  );
};
