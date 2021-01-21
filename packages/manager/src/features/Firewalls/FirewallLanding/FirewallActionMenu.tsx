import { FirewallStatus } from '@linode/api-v4/lib/firewalls';
import * as React from 'react';
import {
  makeStyles,
  Theme,
  useTheme,
  useMediaQuery
} from 'src/components/core/styles';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';
import InlineMenuAction from 'src/components/InlineMenuAction';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex'
  }
}));

export interface ActionHandlers {
  triggerEnableFirewall: (firewallID: number, firewallLabel: string) => void;
  triggerDisableFirewall: (firewallID: number, firewallLabel: string) => void;
  triggerDeleteFirewall: (firewallID: number, firewallLabel: string) => void;
  [index: string]: any;
}

interface Props extends ActionHandlers {
  firewallID: number;
  firewallLabel: string;
  firewallStatus: FirewallStatus;
}

type CombinedProps = Props;

const FirewallActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    firewallID,
    firewallLabel,
    firewallStatus,
    triggerEnableFirewall,
    triggerDisableFirewall,
    triggerDeleteFirewall
  } = props;

  const actions: Action[] = [
    {
      title:
        firewallStatus === ('enabled' as FirewallStatus) ? 'Disable' : 'Enable',
      onClick: () => {
        handleEnableDisable();
      }
    },
    {
      title: 'Delete',
      onClick: () => {
        triggerDeleteFirewall(firewallID, firewallLabel);
      }
    }
  ];

  const handleEnableDisable = () => {
    const request = () =>
      firewallStatus === 'disabled'
        ? triggerEnableFirewall(firewallID, firewallLabel)
        : triggerDisableFirewall(firewallID, firewallLabel);
    request();
  };

  return (
    <div className={classes.root}>
      {!matchesSmDown &&
        actions.map(action => {
          return (
            <InlineMenuAction
              key={action.title}
              actionText={action.title}
              onClick={action.onClick}
            />
          );
        })}
      {matchesSmDown && (
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for Firewall ${props.firewallLabel}`}
        />
      )}
    </div>
  );
};

export default React.memo(FirewallActionMenu);
