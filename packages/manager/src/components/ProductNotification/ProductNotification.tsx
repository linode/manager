import * as React from 'react';

import { Notice, NoticeVariant } from 'src/components/Notice/Notice';

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
  const props = { flag: true, variant: level };

  return <Notice {...props}>{text}</Notice>;
};
