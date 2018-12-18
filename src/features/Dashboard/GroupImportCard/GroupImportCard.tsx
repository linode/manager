import * as classNames from 'classnames';
import * as React from 'react';
import { compose, onlyUpdateForKeys, withStateHandlers } from 'recompose';

import Close from '@material-ui/icons/Close';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
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
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${theme.spacing.unit}px !important`,
  },
  button: {
    marginTop: '18px'
  },
  icon: {
    cursor: 'pointer',
    float: 'right',
    border: 'none',
    backgroundColor: 'transparent',
  }
});

interface Props {
  openImportDrawer: () => void;
  dismiss: () => void;
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
        <Grid container direction="row" justify="center" alignItems="center">
          <Grid item xs={11}>
            <Typography className={classes.header} variant="h1" data-qa-group-cta-header>
              Import Your Display Groups to Tags
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <button
              className={classes.icon}
              onClick={handleClick}
              data-qa-dismiss-cta
            >
              <Close />
            </button>
          </Grid>
        </Grid>
      </Paper>
      <Paper className={classes.section}>
        <Typography variant="body1" data-qa-group-cta-body>
          This will import Display Groups from Classic Manager and convert them to tags.
          Your existing tags will not be affected.
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
  onlyUpdateForKeys(['hidden'])
)(GroupImportCard)

export default enhanced;
