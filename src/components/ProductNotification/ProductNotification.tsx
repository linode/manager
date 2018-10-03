import { pathOr } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import Notice from 'src/components/Notice';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  text: string;
  severity: 'minor' | 'major' | 'critical';
  onClick?: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ProductNotifications: React.StatelessComponent<CombinedProps> = (props) => {
  const { text, severity } = props;
  const level = pathOr('warning', [severity], severityLevelMap);
  return React.createElement(Notice, { flag: true, [level]: true }, text);
};

const styled = withStyles(styles, { withTheme: true });

const severityLevelMap = {
  minor: 'warning',
  major: 'warning',
  critical: 'error',
};

export default styled<Props>(ProductNotifications);
