import Close from '@material-ui/icons/Close';
import * as React from 'react';
import Button from 'src/components/Button';
import Drawer, { DrawerProps } from 'src/components/core/Drawer';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { convertForAria } from 'src/components/TabLink/TabLink';

export interface Props extends DrawerProps {
  title: string;
  wide?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    width: 300,
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      width: 480,
      padding: theme.spacing(4),
    },
    '& .actionPanel': {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: theme.spacing(),
    },
    '& .selectionCard': {
      maxWidth: '100%',
      flexBasis: '100%',
    },
  },
  wide: {
    [theme.breakpoints.up('sm')]: {
      width: 700,
    },
  },
  drawerHeader: {
    marginBottom: theme.spacing(2),
  },
  title: {
    wordBreak: 'break-word',
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
}));

type CombinedProps = Props;

const DDrawer: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { title, children, onClose, wide, ...rest } = props;

  const titleID = convertForAria(title);

  return (
    <Drawer
      anchor="right"
      classes={{ paper: `${classes.paper} ${wide ? classes.wide : ''}` }}
      onClose={(event, reason) => {
        if (onClose && reason !== 'backdropClick') {
          onClose(event, reason);
        }
      }}
      {...rest}
      ModalProps={{
        BackdropProps: {
          className: classes.backDrop,
        },
      }}
      aria-labelledby={titleID}
      data-qa-drawer
      data-testid="drawer"
      role="dialog"
    >
      <Grid
        className={classes.drawerHeader}
        container
        alignItems="flex-start"
        justifyContent="space-between"
        updateFor={[title, classes]}
        wrap="nowrap"
      >
        <Grid item>
          <Typography
            id={titleID}
            className={classes.title}
            variant="h2"
            data-qa-drawer-title={title}
            data-testid="drawer-title"
          >
            {title}
          </Typography>
        </Grid>
        <Grid item>
          <Button
            className={classes.button}
            buttonType="secondary"
            onClick={props.onClose as (e: any) => void}
            aria-label="Close drawer"
            data-qa-close-drawer
          >
            <Close />
          </Button>
        </Grid>
      </Grid>
      {children}
    </Drawer>
  );
};

export default DDrawer;
