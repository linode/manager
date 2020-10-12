import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR/';
import { makeStyles, Theme } from 'src/components/core/styles';
import Hidden from 'src/components/core/Hidden';
import Button from 'src/components/Button';
import { Link, useHistory } from 'react-router-dom';

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

export interface Props {
  onRemove: () => void;
  label: string;
  cluster: string;
}

export const BucketActionMenu: React.FC<Props> = props => {
  const classes = useStyles();
  const history = useHistory();

  const createActions = () => {
    return (): Action[] => {
      return [
        {
          title: 'Details',
          onClick: () => {
            history.push({
              pathname: `/object-storage/buckets/${props.cluster}/${props.label}`
            });
          }
        },
        {
          title: 'Delete',
          onClick: () => {
            props.onRemove();
          }
        }
      ];
    };
  };

  return (
    <div className={classes.inlineActions}>
      <Hidden smDown>
        <Link
          className={classes.button}
          to={`/object-storage/buckets/${props.cluster}/${props.label}`}
        >
          Details
        </Link>
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
