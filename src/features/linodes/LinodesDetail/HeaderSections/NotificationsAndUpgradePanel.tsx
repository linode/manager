import * as React from 'react';

import {
  StyleRulesCallback,
  
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

import Notice from 'src/components/Notice';
import ProductNotification from 'src/components/ProductNotification';

import MigrationNotification from './MigrationNotification';

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
  handleUpgrade: () => void;
  handleMigration: (type: string) => void;
  showPendingMutation: boolean;
  status: Linode.LinodeStatus;
  notifications?: Linode.Notification[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const NotificationsAndUpgradePanel = (props: CombinedProps) => {
  return (
    <React.Fragment>
      {props.showPendingMutation &&
        <Notice important warning>
          {`This Linode has pending upgrades available. To learn more about
          this upgrade and what it includes, `}
          {/** @todo change onClick to open mutate drawer once migrate exists */}
          <span className={props.classes.link} onClick={props.handleUpgrade}>
            click here.
          </span>
        </Notice>
      }
      {
        (props.notifications || []).map((n, idx) =>
          ['migration_scheduled', 'migration_pending'].includes(n.type)
          ? (props.status !== 'migrating' &&
              <MigrationNotification
                key={idx}
                text={n.message}
                type={n.type}
                onClick={props.handleMigration}
              />
            )
          : <ProductNotification key={idx} severity={n.severity} text={n.message} />)
      }
    </React.Fragment>
  );
}

const styled = withStyles(styles, { withTheme: true });

export default styled(NotificationsAndUpgradePanel);
