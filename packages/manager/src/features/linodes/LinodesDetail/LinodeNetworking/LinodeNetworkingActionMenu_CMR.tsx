import { IPAddress, IPRange } from '@linode/api-v4/lib/networking';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { IPTypes } from './types';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    ...theme.applyLinkStyles,
    height: '100%',
    minWidth: 'auto',
    padding: '12px 10px',
    whiteSpace: 'nowrap',
    '&:hover': {
      textDecoration: 'none',
      backgroundColor: '#3683dc',
      color: theme.color.white
    }
  }
}));

interface Props {
  onView: () => void;
  onEdit?: (ip: IPAddress | IPRange) => void;
  onRemove?: (ip: IPAddress | IPRange) => void;
  ipType: IPTypes;
  ipAddress?: IPAddress | IPRange;
  readOnly?: boolean;
}

type CombinedProps = Props & RouteComponentProps<{}>;

export const LinodeNetworkingActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const createActions = () => {
    const { onView, onEdit, onRemove, ipType, ipAddress, readOnly } = props;

    return () => {
      const actions: Action[] = [
        {
          title: 'View',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onView();
            e.preventDefault();
          }
        }
      ];

      /**
       * can only edit if we're not dealing with private IPs, link local, or reserved IPs
       */
      if (
        onEdit &&
        ipAddress &&
        ipType !== 'IPv4 – Private' &&
        ipType !== 'IPv6 – Link Local' &&
        ipType !== 'IPv4 – Reserved (public)' &&
        ipType !== 'IPv4 – Reserved (private)'
      ) {
        actions.push({
          title: 'Edit RDNS',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onEdit(ipAddress);
            e.preventDefault();
          },
          disabled: readOnly,
          tooltip: readOnly
            ? "You don't have permissions to modify this Linode"
            : undefined
        });
      }

      if (onRemove && ipAddress && ipType === 'IPv4 – Public') {
        actions.push({
          title: 'Delete IP',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onRemove(ipAddress);
            e.preventDefault();
          },
          disabled: readOnly,
          tooltip: readOnly
            ? "You don't have permissions to modify this Linode"
            : undefined
        });
      }

      return actions;
    };
  };

  const { address } = props.ipAddress as any;
  return (
    <>
      <div className="flex-center">
        <button className={classes.button} onClick={() => null}>
          Edit RDNS
        </button>
        <button
          className={classes.button}
          onClick={() => {
            // onDisableOrEnable(
            //   status === 'active' ? 'disable' : 'enable',
            //   domain,
            //   id
            // )
          }}
        >
          {status === 'active' ? 'Disable' : 'Enable'}
        </button>
      </div>
      <ActionMenu
        createActions={createActions()}
        ariaLabel={`Action menu for Address ${address}`}
      />
    </>
  );
};

export default withRouter(LinodeNetworkingActionMenu);
