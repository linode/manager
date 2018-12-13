import * as classNames from 'classnames';
import * as React from 'react';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DashboardCard from '../DashboardCard';

type ClassNames = 'root'
| 'header'
| 'section'
| 'title'
| 'button';

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
  }
});

interface Props {
  openImportDrawer: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const GroupImportCard: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, openImportDrawer } = props;

  return (
    <DashboardCard>
      <Paper className={classNames(
        {
          [classes.section]: true,
          [classes.title]: true
        }
      )}>
        <Typography className={classes.header} variant="h1" data-qa-group-cta-header>
          Import Your Display Group to Tags
        </Typography>
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

export default styled(GroupImportCard);
