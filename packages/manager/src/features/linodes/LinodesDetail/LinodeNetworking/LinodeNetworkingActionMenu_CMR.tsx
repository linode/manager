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

const permissionsError = "You don't have permissions to modify this Linode";

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

  const { onView, onEdit, onRemove, ipType, ipAddress, readOnly } = props;

  const canEditRDNS =
    !!onEdit &&
    !!ipAddress &&
    ipType !== 'IPv4 – Private' &&
    ipType !== 'IPv6 – Link Local' &&
    ipType !== 'IPv4 – Reserved (public)' &&
    ipType !== 'IPv4 – Reserved (private)';

  const canTransfer =
    ipAddress && (ipType === 'IPv4 – Public' || ipType === 'IPv4 – Private');

  const canDelete = !!onRemove && !!ipAddress && ipType === 'IPv4 – Public';

  const createActions = () => {
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

      if (canTransfer) {
        actions.push({
          title: 'Move to...',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            // onMove(ipAddress)
            e.preventDefault();
          },
          disabled: readOnly,
          tooltip: readOnly ? permissionsError : undefined
        });
      }
      if (canTransfer) {
        actions.push({
          title: 'Swap with...',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            // onSwap(ipAddress)
            e.preventDefault();
          },
          disabled: readOnly,
          tooltip: readOnly ? permissionsError : undefined
        });
      }

      if (canDelete) {
        actions.push({
          title: 'Delete IP',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            // @todo: why is TS requiring this check?
            if (!!onRemove && !!ipAddress) {
              onRemove(ipAddress);
              e.preventDefault();
            }
          },
          disabled: readOnly,
          tooltip: readOnly ? permissionsError : undefined
        });
      }

      return actions;
    };
  };

  const { address } = props.ipAddress as any;

  return (
    <>
      <div className="flex-center">
        {/* @todo: disabled state for restricted users? */}
        {canEditRDNS && (
          <button className={classes.button} onClick={() => null}>
            Edit RDNS
          </button>
        )}
      </div>
      <ActionMenu
        createActions={createActions()}
        ariaLabel={`Action menu for Address ${address}`}
      />
    </>
  );
};

export default withRouter(LinodeNetworkingActionMenu);
