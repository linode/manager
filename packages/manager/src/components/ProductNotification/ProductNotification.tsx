import { Notice } from '@linode/ui';
import * as React from 'react';

import type { NoticeVariant } from '@linode/ui';

export interface ProductNotificationProps {
  onClick?: () => void;
  severity: 'critical' | 'major' | 'minor';
  text: string;
}

const severityLevelMap = {
  critical: 'error',
  major: 'warning',
  minor: 'warning',
};

export const ProductNotification = ({
  severity,
  text,
}: ProductNotificationProps) => {
  const level = (severityLevelMap[severity] as NoticeVariant) ?? 'warning';
  const props = { variant: level };

  return <Notice {...props}>{text}</Notice>;
};
