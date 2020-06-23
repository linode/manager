import Close from '@material-ui/icons/Close';
import * as React from 'react';
import Button from 'src/components/Button';
import Drawer, { DrawerProps } from 'src/components/core/Drawer';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { convertForAria } from 'src/components/TabLink/TabLink';

export interface Props extends DrawerProps {
  title: string;
  wide?: boolean;
}

type ClassNames =
  | 'paper'
  | 'button'
  | 'drawerHeader'
  | 'drawerContent'
  | 'backDrop'
  | 'wide';

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      width: 300,
      padding: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        width: 480,
        padding: theme.spacing(4)
      },
      '& .actionPanel': {
        marginTop: theme.spacing(2)
      },
      '& .selectionCard': {
        maxWidth: '100%',
        flexBasis: '100%'
      }
    },
    wide: {
      [theme.breakpoints.up('sm')]: {
        width: 700
      }
    },
    drawerHeader: {
      marginBottom: theme.spacing(2)
    },
    drawerContent: {},
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
  });

type CombinedProps = Props & WithStyles<ClassNames>;

const DDrawer: React.FC<CombinedProps> = props => {
  const { title, classes, children, wide, ...rest } = props;

  const titleID = convertForAria(title);

  return (
    <Drawer
      anchor="right"
      {...rest}
      classes={{ paper: `${classes.paper} ${wide ? classes.wide : ''}` }}
      ModalProps={{
        BackdropProps: { className: classes.backDrop },
        disableBackdropClick: true
      }}
      data-qa-drawer
      data-testid="drawer"
      role="dialog"
      aria-labelledby={titleID}
    >
      <Grid
        container
        justify="space-between"
        alignItems="center"
        className={classes.drawerHeader}
        updateFor={[title, classes]}
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
      </Grid>
      <div className={classes.drawerContent}>{children}</div>
    </Drawer>
  );
};

const styled = withStyles(styles);

export default styled(DDrawer);
