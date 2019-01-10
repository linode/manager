import * as classNames from 'classnames';
import * as React from 'react';
import { compose, onlyUpdateForKeys, withStateHandlers } from 'recompose';

import Close from '@material-ui/icons/Close';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DashboardCard from '../DashboardCard';

type ClassNames = 'root'
| 'header'
| 'section'
| 'title'
| 'button'
| 'icon';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    width: '100%',
  },
  header: {
    textAlign: 'center',
    fontSize: 18,
  },
  section: {
    padding: theme.spacing.unit * 3,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  title: {
    background: theme.bg.tableHeader,
    position: 'relative',
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${theme.spacing.unit}px !important`,
    [theme.breakpoints.down('md')]: {
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
  },
  button: {
    marginTop: '18px',
  },
  icon: {
    position: 'absolute',
    top: 10,
    right: 0,
    cursor: 'pointer',
    border: 'none',
    color: theme.palette.text.primary,
    backgroundColor: 'transparent',
    [theme.breakpoints.down('md')]: {
      position: 'relative',
      top: 3,
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

export const GroupImportCard: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, dismiss, hide, hidden, openImportDrawer } = props;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    hide();
    dismiss();
  } // @todo needs to be memoized

  if (hidden) { return null; }
  return (
    <DashboardCard>
      <Paper className={classNames(
        {
          [classes.section]: true,
          [classes.title]: true
        }
      )}>
        <Typography className={classes.header} variant="h1" component="h3" data-qa-group-cta-header>
          Import Display Groups as Tags
        </Typography>
        <div>
          <button
          className={classes.icon}
          onClick={handleClick}
          data-qa-dismiss-cta
        >
          <Close />
        </button></div>
      </Paper>
      <Paper className={classes.section}>
        <Typography variant="body1" data-qa-group-cta-body>
        You now have the ability to import your Display Groups from Classic Manager as tags and they will be associated with your Domains and Linodes. This will give you the ability to organize and view your Domains and Linodes by tags. <strong>Your existing tags will not be affected.</strong>
        </Typography>
        <Button
          type="primary"
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

GroupImportCard.displayName = "ImportGroupsCard";

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  styled,
  withStateHandlers({ hidden: false },
    {
      hide: () => () => ({ hidden: true })
    }),
  onlyUpdateForKeys(['hidden', 'theme'])
)(GroupImportCard)

export default enhanced;
