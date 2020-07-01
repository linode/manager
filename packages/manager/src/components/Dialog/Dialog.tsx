import Close from '@material-ui/icons/Close';
import * as React from 'react';
import Button from 'src/components/Button';
import MUIDialog, {
  DialogProps as _DialogProps
} from 'src/components/core/Dialog';
import { createStyles, makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { convertForAria } from 'src/components/TabLink/TabLink';

export interface DialogProps extends _DialogProps {
  title: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(4),
      '& .actionPanel': {
        marginTop: theme.spacing(2)
      },
      '& .selectionCard': {
        maxWidth: '100%',
        flexBasis: '100%'
      }
    },
    drawerHeader: {
      padding: theme.spacing(2)
    },
    drawerContent: {
      padding: theme.spacing(2)
    },
    button: {
      minWidth: 'auto',
      minHeight: 'auto',
      padding: 0,
      '& > span': {
        padding: 2
      },
      '& :hover, & :focus': {
        color: 'white',
        backgroundColor: theme.palette.primary.main
      }
    },
    backDrop: {
      backgroundColor: theme.color.drawerBackdrop
    }
  })
);

const Dialog: React.FC<DialogProps> = props => {
  const { title, children, ...rest } = props;

  const classes = useStyles();

  const titleID = convertForAria(title);

  return (
    <MUIDialog
      title={title}
      maxWidth={props.maxWidth ?? 'lg'}
      {...rest}
      classes={{ paper: classes.paper }}
      data-qa-drawer
      data-testid="drawer"
      role="dialog"
      aria-labelledby={titleID}
    >
      <Grid
        container
        justify="space-between"
        alignItems="center"
        updateFor={[title, props.children]}
      >
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
        <Grid container>
          <div className={classes.drawerContent}>{children}</div>
        </Grid>
      </Grid>
    </MUIDialog>
  );
};

export default Dialog;
