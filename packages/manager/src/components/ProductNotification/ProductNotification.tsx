import * as React from 'react';
import Notice from 'src/components/Notice';

interface Props {
  text: string;
  severity: 'minor' | 'major' | 'critical';
  onClick?: () => void;
}

type CombinedProps = Props;

const ProductNotifications: React.FC<CombinedProps> = props => {
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
