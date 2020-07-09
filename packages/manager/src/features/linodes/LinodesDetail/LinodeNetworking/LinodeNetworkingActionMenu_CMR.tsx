import { IPAddress, IPRange } from '@linode/api-v4/lib/networking';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { IPTypes } from './types';
// import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  actionMenu: {
    height: 40
  },
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

// const permissionsError = "You don't have permissions to modify this Linode";

interface Props {
  onEdit?: (ip: IPAddress | IPRange) => void;
  onRemove?: (ip: IPAddress | IPRange) => void;
  ipType: IPTypes;
  ipAddress?: IPAddress | IPRange;
  readOnly?: boolean;
}

type CombinedProps = Props & RouteComponentProps<{}>;

export const LinodeNetworkingActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  {
    /* @todo: disabled state for restricted users? */
  }
  const { onEdit, onRemove, ipType, ipAddress, readOnly } = props;

  return (
    <div className={`${classes.actionMenu} flex-center`}>
      {!!onRemove && !!ipAddress && ipType === 'IPv4 – Public' && (
        <button className={classes.button} onClick={() => onRemove(ipAddress)}>
          Delete
        </button>
      )}
      {!!onEdit &&
        !!ipAddress &&
        ipType !== 'IPv4 – Private' &&
        ipType !== 'IPv6 – Link Local' &&
        ipType !== 'IPv4 – Reserved (public)' &&
        ipType !== 'IPv4 – Reserved (private)' && (
          <button className={classes.button} onClick={() => onEdit(ipAddress)}>
            Edit RDNS
          </button>
        )}
    </div>
  );
};

export default withRouter(LinodeNetworkingActionMenu);
