import * as React from 'react';
import { Notice } from 'src/components/Notice/Notice';

export interface ProductNotificationProps {
  onClick?: () => void;
  severity: 'minor' | 'major' | 'critical';
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
  debugger;
  const level = severityLevelMap[severity] ?? 'warning';
  return React.createElement(Notice, { flag: true, [level]: true }, text);
};
