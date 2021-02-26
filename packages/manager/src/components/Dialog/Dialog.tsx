import Close from '@material-ui/icons/Close';
import * as React from 'react';
import Button from 'src/components/Button';
import MUIDialog, {
  DialogProps as _DialogProps,
} from 'src/components/core/Dialog';
import { createStyles, makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { convertForAria } from 'src/components/TabLink/TabLink';

export interface DialogProps extends _DialogProps {
  className?: string;
  title: string;
  fullHeight?: boolean;
  titleBottomBorder?: boolean;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: `${theme.spacing(2)}px ${theme.spacing(4)}px`,
      paddingTop: 0,
      maxHeight: '100%',
      '& .actionPanel': {
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
    dialogContent: {
      padding: theme.spacing(2),
      paddingTop: 0,
      margin: 'auto',
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
      backgroundColor: theme.cmrBGColors.bgPaper,
      position: 'sticky',
      top: 0,
      padding: theme.spacing(),
      paddingTop: theme.spacing(4),
      marginBottom: 20,
      zIndex: 1,
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
  })
);

const Dialog: React.FC<DialogProps> = props => {
  const {
    className,
    title,
    fullHeight,
    titleBottomBorder,
    children,
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
      data-testid="drawer"
      role="dialog"
      aria-labelledby={titleID}
      BackdropProps={{
        className: classes.settingsBackdrop,
      }}
      className={fullHeight ? classes.fullHeight : undefined}
    >
      <Grid
        container
        alignItems="center"
        justify="center"
        updateFor={[title, props.children]}
      >
        <div className={classes.sticky}>
          <Grid item>
            <Typography variant="h2" id={titleID} data-qa-drawer-title={title}>
              {title}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              buttonType="secondary"
              onClick={props.onClose as (e: any) => void}
              className={classes.button}
              data-qa-close-drawer
              aria-label="Close drawer"
            >
              <Close />
            </Button>
          </Grid>
        </div>
        {titleBottomBorder && <hr className={classes.titleBottomBorder} />}
        <Grid container>
          <div className={className ? className : classes.dialogContent}>
            {children}
          </div>
        </Grid>
      </Grid>
    </MUIDialog>
  );
};

export default Dialog;
