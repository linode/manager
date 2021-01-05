import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import ActionMenu from 'src/components/ActionMenu_CMR';
import Hidden from 'src/components/core/Hidden';
import InlineAction from 'src/components/InlineMenuAction';
import { OpenAccessDrawer } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  inlineActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  button: {
    ...theme.applyLinkStyles,
    color: theme.cmrTextColors.linkActiveLight,
    height: '100%',
    minWidth: 'auto',
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

interface Props {
  // prop-drilled from parent
  objectStorageKey: ObjectStorageKey;

  // prop-drilled from grandparent:
  // ObjectStorageKeys --> ObjectStorageKeyTable --> HERE
  openRevokeDialog: (key: ObjectStorageKey) => void;
  openDrawer: OpenAccessDrawer;
  label: string;
}

type CombinedProps = Props;

const AccessKeyMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { openRevokeDialog, objectStorageKey, openDrawer } = props;

  const actions = [
    {
      title: 'Edit label',
      onClick: () => {
        openDrawer('editing', objectStorageKey);
      }
    },
    {
      title: 'View permissions',
      onClick: () => {
        openDrawer('viewing', objectStorageKey);
      }
    },
    {
      title: 'Revoke',
      onClick: () => {
        openRevokeDialog(objectStorageKey);
      }
    }
  ];

  return (
    <div className={classes.inlineActions}>
      <Hidden smDown>
        {actions.map(thisAction => (
          <InlineAction
            key={thisAction.title}
            actionText={thisAction.title}
            onClick={thisAction.onClick}
          />
        ))}
      </Hidden>
      <Hidden mdUp>
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for Object Storage Key ${props.label}`}
        />
      </Hidden>
    </div>
  );
};

export default AccessKeyMenu;
