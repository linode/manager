import * as classnames from 'classnames';
import { IPAddress, IPRange } from '@linode/api-v4/lib/networking';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { IPTypes } from './types';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';
import {
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme,
} from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

const useStyles = makeStyles((theme: Theme) => ({
  actionMenu: {
    height: 40,
  },
  button: {
    ...theme.applyLinkStyles,
    color: theme.cmrTextColors.linkActiveLight,
    height: '100%',
    minWidth: 'auto',
    padding: '12px 10px',
    whiteSpace: 'nowrap',
    '&:hover': {
      textDecoration: 'none',
      backgroundColor: '#3683dc',
      color: '#ffffff',
    },
  },
  disabled: {
    cursor: 'not-allowed',
    color: theme.color.grey1,
  },
}));

interface Props {
  onEdit?: (ip: IPAddress | IPRange) => void;
  onRemove?: (ip: IPAddress | IPRange) => void;
  ipType: IPTypes;
  ipAddress?: IPAddress | IPRange;
  readOnly: boolean;
}

type CombinedProps = Props & RouteComponentProps<{}>;

export const LinodeNetworkingActionMenu: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const theme = useTheme<Theme>();
  const matchesMdDown = useMediaQuery(theme.breakpoints.down('md'));

  const { onEdit, onRemove, ipType, ipAddress, readOnly } = props;

  const showEdit =
    ipType !== 'IPv4 – Private' &&
    ipType !== 'IPv6 – Link Local' &&
    ipType !== 'IPv4 – Reserved (public)' &&
    ipType !== 'IPv4 – Reserved (private)';

  const actions = [
    onRemove && ipAddress && ipType === 'IPv4 – Public'
      ? {
          title: 'Delete',
          disabled: readOnly,
          onClick: () => {
            onRemove(ipAddress);
          },
        }
      : null,
    onEdit && ipAddress && showEdit
      ? {
          title: 'Edit RDNS',
          disabled: readOnly,
          onClick: () => {
            onEdit(ipAddress);
          },
        }
      : null,
  ];

  return (
    // <div className={`${classes.actionMenu} flex-center`}>
    //   {onRemove && ipAddress && ipType === 'IPv4 – Public' && (
    //     <button
    //       disabled={readOnly}
    //       className={classnames({
    //         [classes.button]: true,
    //         [classes.disabled]: readOnly,
    //       })}
    //       onClick={() => onRemove(ipAddress)}
    //     >
    //       Delete
    //     </button>
    //   )}
    //   {onEdit &&
    //     ipAddress &&
    //     ipType !== 'IPv4 – Private' &&
    //     ipType !== 'IPv6 – Link Local' &&
    //     ipType !== 'IPv4 – Reserved (public)' &&
    //     ipType !== 'IPv4 – Reserved (private)' && (
    //       <button
    //         disabled={readOnly}
    //         className={classnames({
    //           [classes.button]: true,
    //           [classes.disabled]: readOnly,
    //         })}
    //         onClick={() => onEdit(ipAddress)}
    //       >
    //         Edit RDNS
    //       </button>
    //     )}
    // </div>
    <>
      {actions !== null ? (
        <>
          {!matchesMdDown &&
            actions.map((action) => {
              return (
                <InlineMenuAction
                  key={action?.title}
                  actionText={action?.title ? action.title : ''}
                  disabled={readOnly}
                  onClick={action?.onClick}
                />
              );
            })}
          {matchesMdDown && (
            <ActionMenu
              actionsList={actions as Action[]}
              ariaLabel={`Action menu for IP Address ${props.ipAddress}`}
            />
          )}
        </>
      ) : null}
    </>
  );
};

export default withRouter(LinodeNetworkingActionMenu);
