import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';

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
  const level = severityLevelMap[severity] ?? 'warning';
  const props = { flag: true, [level]: true };

  return <Notice {...props}>{text}</Notice>;
};
