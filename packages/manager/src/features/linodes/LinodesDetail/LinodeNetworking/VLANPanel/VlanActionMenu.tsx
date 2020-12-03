import * as React from 'react';
import {
  makeStyles,
  Theme,
  useTheme,
  useMediaQuery
} from 'src/components/core/styles';
import ActionMenu from 'src/components/ActionMenu_CMR';
import InlineMenuAction from 'src/components/InlineMenuAction';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  }
}));

export interface ActionHandlers {
  triggerRemoveVlan: (vlanID: number, vlanLabel: string) => void;
  [index: string]: any;
}

interface Props extends ActionHandlers {
  vlanID: number;
  vlanLabel: string;
  readOnly: boolean;
}

type CombinedProps = Props;

const VlanActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const { vlanID, vlanLabel, triggerRemoveVlan, readOnly } = props;

  const actions = [
    {
      title: 'Remove',
      onClick: () => {
        triggerRemoveVlan(vlanID, vlanLabel);
      },
      disabled: readOnly
    }
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
              disabled={action.disabled}
            />
          );
        })}
      {matchesSmDown && (
        <ActionMenu
          createActions={() => actions}
          ariaLabel={`Action menu for Virtual LAN ${props.vlanLabel}`}
        />
      )}
    </div>
  );
};

export default React.memo(VlanActionMenu);
