import Close from '@material-ui/icons/Close';
import * as React from 'react';
import Button from 'src/components/Button';
import Drawer, { DrawerProps } from 'src/components/core/Drawer';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

interface Props extends DrawerProps {
  title: string;
}

type ClassNames = 'drawer'
| 'button'
| 'drawerHeader'
| 'drawerContent'
| 'backDrop';

const styles: StyleRulesCallback = (theme) => ({
  paper: {
    width: 300,
    padding: theme.spacing.unit * 2,
    [theme.breakpoints.up('sm')]: {
      width: 480,
      padding: theme.spacing.unit * 4,
    },
    '& .actionPanel': {
      marginTop: theme.spacing.unit * 2,
    },
    '& .selectionCard': {
      maxWidth: '100%',
      flexBasis: '100%',
    },
  },
  drawerHeader: {
    marginBottom: theme.spacing.unit * 2,
  },
  drawerContent: {
    marginBottom: theme.spacing.unit * 2,
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});

type CombinedProps = Props & WithStyles<ClassNames>;

const DDrawer: React.StatelessComponent<CombinedProps> = (props) => {
  const { title, classes, children, ...rest } = props;

  return (
    <Drawer
      anchor="right"
      {...rest}
      classes={{ paper: classes.paper }}
      ModalProps={{
        BackdropProps: { className: classes.backDrop },
        disableBackdropClick: true,
      }}
      data-qa-drawer
      >
      <Grid
        container
        justify="space-between"
        alignItems="center"
        className={classes.drawerHeader}
        updateFor={[title]}>
        <Grid item>
          <Typography role="header" variant="title" data-qa-drawer-title>
            {title}
          </Typography>
        </Grid>
        <Grid item>
          <Button
            type="secondary"
            onClick={props.onClose}
            className={classes.button}
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

const styled = withStyles(styles);

export default styled(DDrawer);
