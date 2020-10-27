import { FirewallStatus } from '@linode/api-v4/lib/firewalls';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import {
  makeStyles,
  Theme,
  useTheme,
  useMediaQuery
} from 'src/components/core/styles';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';
import InlineMenuAction from 'src/components/InlineMenuAction/InlineMenuAction';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: '0px !important',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  inlineActions: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  link: {
    padding: '12px 10px',
    textAlign: 'center',

    '&:hover': {
      backgroundColor: '#3683dc',
      '& span': {
        color: '#ffffff'
      }
    },
    '& span': {
      color: theme.cmrTextColors.linkActiveLight
    }
  },
  action: {
    marginLeft: 10
  },
  button: {
    minWidth: 70,
    ...theme.applyLinkStyles,
    color: theme.cmrTextColors.linkActiveLight,
    height: '100%',
    padding: '12px 10px',
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: '#3683dc',
      color: '#ffffff'
    },
    '&[disabled]': {
      color: '#cdd0d5',
      cursor: 'default',
      '&:hover': {
        backgroundColor: 'inherit'
      }
    }
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
  const history = useHistory();

  const {
    firewallID,
    firewallLabel,
    firewallStatus,
    triggerEnableFirewall,
    triggerDisableFirewall,
    triggerDeleteFirewall
  } = props;

  const inlineActions = [
    {
      actionText: 'Details',
      className: classes.link,
      href: `/firewalls/${firewallID}`
    },
    {
      actionText:
        firewallStatus === ('enabled' as FirewallStatus) ? 'Disable' : 'Enable',
      className: classes.button,
      onClick: () => {
        handleEnableDisable();
      }
    },
    {
      actionText: 'Delete',
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

  const createActions = () => (): Action[] => {
    return [
      {
        title: 'Details',
        onClick: () => {
          history.push({
            pathname: `/firewalls/${firewallID}`
          });
        }
      },
      {
        title:
          firewallStatus === ('enabled' as FirewallStatus)
            ? 'Disable'
            : 'Enable',
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
  };

  return (
    <div className={classes.root}>
      {!matchesSmDown &&
        inlineActions.map(action => {
          return (
            <InlineMenuAction
              key={action.actionText}
              actionText={action.actionText}
              className={action.className}
              href={action.href}
              onClick={action.onClick}
            />
          );
        })}
      {matchesSmDown && (
        <ActionMenu
          createActions={createActions()}
          ariaLabel={`Action menu for Firewall ${props.firewallLabel}`}
        />
      )}
    </div>
  );
};

export default React.memo(FirewallActionMenu);
