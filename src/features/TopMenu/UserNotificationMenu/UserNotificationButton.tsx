import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import IconButton from 'material-ui/IconButton';
import Notifications from 'material-ui-icons/Notifications';
import NotificationsNone from 'material-ui-icons/NotificationsNone';

type ClassNames = 'root' | 'icon';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  icon: { fontSize: '31px' },
});

interface Props {
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  getRef: (e: HTMLElement) => void;
  hasNew: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserNotificationButton: React.StatelessComponent<CombinedProps> = ({
  classes,
  hasNew,
  onClick,
  getRef,
}) => {
  const Icon = hasNew ? Notifications : NotificationsNone;

  return (
    <IconButton onClick={onClick} buttonRef={getRef} >
      <Icon className={classes.icon} />
    </IconButton>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(UserNotificationButton);
