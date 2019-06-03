import { pathOr } from 'ramda';
import * as React from 'react';
import { WithStyles } from '@material-ui/core/styles';
import {
  createStyles,
  Theme,
  withStyles
} from 'src/components/core/styles';
import Notice from 'src/components/Notice';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
  root: {}
});

interface Props {
  text: string;
  severity: 'minor' | 'major' | 'critical';
  onClick?: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ProductNotifications: React.StatelessComponent<CombinedProps> = props => {
  const { text, severity } = props;
  const level = pathOr('warning', [severity], severityLevelMap);
  return React.createElement(Notice, { flag: true, [level]: true }, text);
};

const styled = withStyles(styles);

const severityLevelMap = {
  minor: 'warning',
  major: 'warning',
  critical: 'error'
};

export default styled(ProductNotifications);
