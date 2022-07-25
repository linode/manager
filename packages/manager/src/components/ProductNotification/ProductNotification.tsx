import * as React from 'react';
import Notice from 'src/components/Notice';

interface Props {
  text: string;
  severity: 'minor' | 'major' | 'critical';
  onClick?: () => void;
}

const ProductNotifications = (props: Props) => {
  const { text, severity } = props;
  const level = severityLevelMap[severity] ?? 'warning';
  return React.createElement(Notice, { flag: true, [level]: true }, text);
};

const severityLevelMap = {
  minor: 'warning',
  major: 'warning',
  critical: 'error',
};

export default ProductNotifications;
