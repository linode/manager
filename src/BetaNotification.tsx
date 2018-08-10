import * as React from 'react';

import Button from '@material-ui/core/Button';
import Snackbar, { SnackbarProps } from '@material-ui/core/Snackbar';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Close from '@material-ui/icons/Close';

import Grid from 'src/components/Grid';

type ClassNames = 'root'
  | 'content'
  | 'actions'
  | 'button';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    backgroundColor: theme.color.white,
    padding: 12,
    [theme.breakpoints.up('md')]: {
      borderRadius: 2,
      maxWidth: 'initial !important',
      width: 820,
    },
  },
  content: {
    '& a': {
      fontWeight: 700,
    }
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    minWidth: 'auto',
    minHeight: 'auto',
    padding: 0,
    border: 0,
    color: theme.color.headline,
    '& > span': {
      padding: 2,
    },
    '& svg': {
      width: 22,
      height: 22,
    },
    '&:hover, &:focus': {
      color: theme.palette.primary.main,
    },
  },
});

interface Props extends SnackbarProps {
}

type CombinedProps = Props & WithStyles<ClassNames>;

const BetaNotification: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, onClose, ...rest } = props;

  return (<Snackbar
    {...rest}
    ContentProps={{
      className: classes.root,
    }}
    message={
      <Grid
        container
        alignItems="center"
        justify="space-between"
        spacing={0}
      >
        <Grid item className={classes.content} xs={9} lg={10}>
          <Typography>
            This is the early-access Linode Manager. <a className="black" href="https://manager.linode.com/">Click
            here</a> to go back to the classic Linode Manager.
          </Typography>
        </Grid>
        { onClose &&
        <Grid item className={classes.actions} xs={3} lg={2}>
          <Button
            onClick={e => onClose(e, '')}
            color="secondary"
            variant="raised"
            className={classes.button}
          >
            <Close />
          </Button>
        </Grid>
        }
      </Grid>}
  />);
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(BetaNotification);
