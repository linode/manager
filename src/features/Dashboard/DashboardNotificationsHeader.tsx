import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import ProductNotification from 'src/components/ProductNotification';

type ClassNames = 'root' | 'link';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  link: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    }
  }
});

interface Props {
  notifications: Linode.Notification[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const DashboardNotificationsHeader = ({ notifications }: CombinedProps) => {
  const maintenanceNotifications = notifications
    .filter(n => n.type === 'maintenance')
    .map((n, idx) => <ProductNotification key={idx} severity={n.severity} text={n.message} />)


  return maintenanceNotifications.length > 0
    ? <React.Fragment>
        { maintenanceNotifications }
      </React.Fragment>
    : null;
}

const styled = withStyles(styles);

export default styled(DashboardNotificationsHeader);
