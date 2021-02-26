import * as React from 'react';
import {
  makeStyles,
  Theme,
  useTheme,
  useMediaQuery,
} from 'src/components/core/styles';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';
import InlineMenuAction from 'src/components/InlineMenuAction';

const useStyles = makeStyles(() => ({
  root: {
    padding: '0px !important',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
}));

export interface ActionHandlers {
  triggerDeleteVlan: (vlanID: number, vlanLabel: string) => void;
  [index: string]: any;
}

interface Props extends ActionHandlers {
  vlanID: number;
  vlanLabel: string;
}

type CombinedProps = Props;

const VlanActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const { vlanID, vlanLabel, triggerDeleteVlan } = props;

  const actions: Action[] = [
    {
      title: 'Delete',
      onClick: () => {
        triggerDeleteVlan(vlanID, vlanLabel);
      },
    },
  ];

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
          ariaLabel={`Action menu for Virtual LAN ${props.vlanLabel}`}
        />
      )}
    </div>
  );
};

export default React.memo(VlanActionMenu);
