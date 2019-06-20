import Close from '@material-ui/icons/Close';
import * as classNames from 'classnames';
import * as React from 'react';
import { compose, onlyUpdateForKeys, withStateHandlers } from 'recompose';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DashboardCard from '../DashboardCard';

type ClassNames = 'root' | 'section' | 'title' | 'button' | 'icon';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%'
    },
    section: {
      padding: theme.spacing(3),
      borderBottom: `1px solid ${theme.palette.divider}`
    },
    title: {
      background: theme.bg.tableHeader,
      position: 'relative',
      display: 'flex',
      flexFlow: 'row nowrap',
      alignItems: 'center',
      padding: `${theme.spacing(1)}px ${theme.spacing(3)}px !important`,
      [theme.breakpoints.down('md')]: {
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }
    },
    button: {
      marginTop: theme.spacing(3)
    },
    icon: {
      position: 'absolute',
      top: theme.spacing(1),
      right: 0,
      cursor: 'pointer',
      border: 'none',
      color: theme.palette.text.primary,
      backgroundColor: 'transparent',
      [theme.breakpoints.down('md')]: {
        position: 'relative',
        top: 3
      }
    }
  });

interface Props {
  openImportDrawer: () => void;
  dismiss: () => void;
  theme: string;
}

interface HandlerProps {
  hide: () => void;
  hidden: boolean;
}

type CombinedProps = Props & HandlerProps & WithStyles<ClassNames>;

export const GroupImportCard: React.StatelessComponent<
  CombinedProps
> = props => {
  const { classes, dismiss, hide, hidden, openImportDrawer } = props;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    hide();
    dismiss();
  }; // @todo needs to be memoized

  if (hidden) {
    return null;
  }
  return (
    <DashboardCard>
      <Paper
        className={classNames({
          [classes.section]: true,
          [classes.title]: true
        })}
      >
        <Typography variant="h2" data-qa-group-cta-header>
          Import Display Groups as Tags
        </Typography>
        <div>
          <button
            className={classes.icon}
            onClick={handleClick}
            data-qa-dismiss-cta
          >
            <Close />
          </button>
        </div>
      </Paper>
      <Paper className={classes.section}>
        <Typography variant="body1" data-qa-group-cta-body>
          You now have the ability to import your Display Groups from Classic
          Manager as tags and they will be associated with your Linodes and
          Domains. This will give you the ability to organize and view your
          Linodes and Domains by tags.{' '}
          <strong>Your existing tags will not be affected.</strong>
        </Typography>
        <Button
          buttonType="primary"
          onClick={openImportDrawer}
          className={classes.button}
          data-qa-open-import-drawer-button
        >
          Import Display Groups
        </Button>
      </Paper>
    </DashboardCard>
  );
};

GroupImportCard.displayName = 'ImportGroupsCard';

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  withStateHandlers(
    { hidden: false },
    {
      hide: () => () => ({ hidden: true })
    }
  ),
  onlyUpdateForKeys(['hidden', 'theme']),
  styled
)(GroupImportCard);

export default enhanced;
