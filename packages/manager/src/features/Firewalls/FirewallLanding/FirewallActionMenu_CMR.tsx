import { FirewallStatus } from '@linode/api-v4/lib/firewalls';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import ActionMenu from 'src/components/ActionMenu_CMR';

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
    justifyContent: 'flex-end'
  },
  link: {
    minWidth: 70,
    padding: '12px 10px',
    textAlign: 'center',
    '&:hover': {
      backgroundColor: '#3683dc',
      '& span': {
        color: theme.color.white
      }
    },
    '& span': {
      color: '#3683dc'
    }
  },
  action: {
    marginLeft: 10
  },
  button: {
    minWidth: 70,
    ...theme.applyLinkStyles,
    height: '100%',
    padding: '12px 10px',
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: '#3683dc',
      color: theme.color.white
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
  const {
    firewallID,
    firewallLabel,
    firewallStatus,
    triggerEnableFirewall,
    triggerDisableFirewall,
    triggerDeleteFirewall
  } = props;
  const classes = useStyles();

  const handleEnableDisable = () => {
    const request = () =>
      firewallStatus === 'disabled'
        ? triggerEnableFirewall(firewallID, firewallLabel)
        : triggerDisableFirewall(firewallID, firewallLabel);
    request();
  };

  const createActions = () => [
    {
      title: 'Delete',
      onClick: () => {
        triggerDeleteFirewall(firewallID, firewallLabel);
      }
    }
  ];

  return (
    <div className={classes.root}>
      <div className={classes.inlineActions}>
        <Link className={classes.link} to={`/firewalls/${firewallID}`}>
          <span>Edit</span>
        </Link>
        <Button
          className={classes.button}
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            handleEnableDisable();
          }}
        >
          {firewallStatus === 'enabled' ? 'Disable' : 'Enable'}
        </Button>
      </div>
      <ActionMenu
        createActions={createActions}
        ariaLabel={`Action menu for Firewall ${props.firewallLabel}`}
      />
    </div>
  );
};

export default React.memo(FirewallActionMenu);
