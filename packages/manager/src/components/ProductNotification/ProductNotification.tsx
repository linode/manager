import { pathOr } from 'ramda';
import * as React from 'react';
import Notice from 'src/components/Notice';

interface Props {
  text: string;
  severity: 'minor' | 'major' | 'critical';
  onClick?: () => void;
}

type CombinedProps = Props;

const ProductNotifications: React.StatelessComponent<CombinedProps> = props => {
  const { text, severity } = props;
  const level = pathOr('warning', [severity], severityLevelMap);
  return React.createElement(Notice, { flag: true, [level]: true }, text);
};

const severityLevelMap = {
  minor: 'warning',
  major: 'warning',
  critical: 'error'
};

export default ProductNotifications;
