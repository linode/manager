import { IPAddress, IPRange } from '@linode/api-v4/lib/networking';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import {
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme,
} from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';
import { IPTypes } from './types';

const useStyles = makeStyles(() => ({
  emptyCell: {
    height: 40,
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
  ].filter(Boolean) as Action[];

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {!isEmpty(actions) ? (
        <>
          {!matchesMdDown &&
            actions.map((action) => {
              return (
                <InlineMenuAction
                  key={action.title}
                  actionText={action.title}
                  disabled={readOnly}
                  onClick={action.onClick}
                />
              );
            })}
          {matchesMdDown && (
            <ActionMenu
              actionsList={actions}
              ariaLabel={`Action menu for IP Address ${props.ipAddress}`}
            />
          )}
        </>
      ) : (
        <span className={classes.emptyCell}></span>
      )}
    </>
  );
};

export default withRouter(LinodeNetworkingActionMenu);
