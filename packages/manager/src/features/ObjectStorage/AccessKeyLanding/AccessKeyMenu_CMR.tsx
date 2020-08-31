import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';
import Button from 'src/components/Button';
import Hidden from 'src/components/core/Hidden';

const useStyles = makeStyles((theme: Theme) => ({
  inlineActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  button: {
    ...theme.applyLinkStyles,
    height: '100%',
    minWidth: 'auto',
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

interface Props {
  // prop-drilled from parent
  objectStorageKey: ObjectStorageKey;

  // prop-drilled from grandparent:
  // ObjectStorageKeys --> ObjectStorageKeyTable --> HERE
  openRevokeDialog: (key: ObjectStorageKey) => void;
  openDrawerForEditing: (key: ObjectStorageKey) => void;
  label: string;
}

type CombinedProps = Props;

const AccessKeyMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { openRevokeDialog, objectStorageKey, openDrawerForEditing } = props;

  const createActions = () => {
    return (): Action[] => {
      const actions = [
        {
          title: 'Edit label',
          onClick: () => {
            openDrawerForEditing(objectStorageKey);
          }
        },
        {
          title: 'Revoke',
          onClick: () => {
            openRevokeDialog(objectStorageKey);
          }
        }
      ];

      return actions;
    };
  };

  return (
    <div className={classes.inlineActions}>
      <Hidden smDown>
        <Button
          className={classes.button}
          onClick={() => {
            openDrawerForEditing(objectStorageKey);
          }}
        >
          Edit label
        </Button>
        <Button
          className={classes.button}
          onClick={() => {
            openRevokeDialog(objectStorageKey);
          }}
        >
          Revoke
        </Button>
      </Hidden>
      <Hidden mdUp>
        <ActionMenu
          createActions={createActions()}
          ariaLabel={`Action menu for Object Storage Key ${props.label}`}
        />
      </Hidden>
    </div>
  );
};

export default AccessKeyMenu;
