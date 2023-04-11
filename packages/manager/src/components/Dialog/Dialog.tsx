import * as React from 'react';
import Close from '@mui/icons-material/Close';
import Button from 'src/components/Button';
import MUIDialog, {
  DialogProps as _DialogProps,
} from 'src/components/core/Dialog';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { convertForAria } from 'src/components/TabLink/TabLink';
import Notice from 'src/components/Notice';

export interface DialogProps extends _DialogProps {
  className?: string;
  title: string;
  fullHeight?: boolean;
  titleBottomBorder?: boolean;
  error?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    paddingTop: 0,
    maxHeight: '100%',
    '& .actionPanel': {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: theme.spacing(2),
    },
    '& .selectionCard': {
      maxWidth: '100%',
      flexBasis: '100%',
    },
  },
  fullHeight: {
    '& .MuiDialog-paper': {
      height: '100vh',
    },
  },
  settingsBackdrop: {
    backgroundColor: 'rgba(0,0,0,.3)',
  },
  drawerHeader: {
    padding: theme.spacing(2),
  },
  button: {
    minWidth: 'auto',
    minHeight: 'auto',
    padding: 0,
    '& > span': {
      padding: 2,
    },
    '& :hover, & :focus': {
      color: 'white',
      backgroundColor: theme.palette.primary.main,
    },
  },
  backDrop: {
    backgroundColor: theme.color.drawerBackdrop,
  },
  sticky: {
    backgroundColor: theme.bg.bgPaper,
    position: 'sticky',
    top: 0,
    padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
    zIndex: 2,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleBottomBorder: {
    backgroundColor: '#e3e5e8',
    height: 1,
    width: '100%',
    margin: '-2em 8px 0px 8px',
    border: 'none',
  },
  error: {
    color: theme.color.red,
    marginTop: theme.spacing(2),
  },
}));

const Dialog: React.FC<DialogProps> = (props) => {
  const {
    className,
    title,
    fullHeight,
    titleBottomBorder,
    children,
    error,
    ...rest
  } = props;

  const classes = useStyles();

  const titleID = convertForAria(title);

  return (
    <MUIDialog
      title={title}
      maxWidth={props.maxWidth ?? 'md'}
      {...rest}
      classes={{ paper: classes.paper }}
      data-qa-drawer
      data-qa-dialog
      data-testid="drawer"
      role="dialog"
      aria-labelledby={titleID}
      BackdropProps={{
        className: classes.settingsBackdrop,
      }}
      className={fullHeight ? classes.fullHeight : undefined}
    >
      <Grid container alignItems="center">
        <div className={classes.sticky}>
          <Typography
            variant="h2"
            id={titleID}
            data-qa-drawer-title={title}
            data-qa-dialog-title={title}
          >
            {title}
          </Typography>

          <Button
            buttonType="secondary"
            onClick={props.onClose as (e: any) => void}
            className={classes.button}
            data-qa-close-drawer
            aria-label="Close"
          >
            <Close />
          </Button>
        </div>
        {titleBottomBorder && <hr className={classes.titleBottomBorder} />}
        <Grid container sx={{ margin: '0 32px 0 32px' }}>
          <div className={className}>
            {error && <Notice text={error} error />}
            {children}
          </div>
        </Grid>
      </Grid>
    </MUIDialog>
  );
};

export default Dialog;
