import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR/';
import { makeStyles, Theme } from 'src/components/core/styles';
import Hidden from 'src/components/core/Hidden';
import Button from 'src/components/Button';

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

export interface Props {
  onRemove: () => void;
  label: string;
}

export const BucketActionMenu: React.FC<Props> = props => {
  const classes = useStyles();

  const createActions = () => {
    return (): Action[] => {
      const actions = [
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            props.onRemove();
            e.preventDefault();
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
            props.onRemove();
          }}
        >
          Delete
        </Button>
      </Hidden>
      <Hidden mdUp>
        <ActionMenu
          createActions={createActions()}
          ariaLabel={`Action menu for Bucket ${props.label}`}
        />
      </Hidden>
    </div>
  );
};

export default BucketActionMenu;
