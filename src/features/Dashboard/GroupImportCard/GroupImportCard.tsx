import * as classNames from 'classnames';
import * as React from 'react';
// import { RouteComponentProps, withRouter } from 'react-router-dom';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DashboardCard from '../DashboardCard';

type ClassNames = 'root'
| 'itemTitle'
| 'header'
| 'icon'
| 'section'
| 'sectionLink'
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
  icon: {
    color: theme.color.blueDTwhite,
    margin: theme.spacing.unit,
    fontSize: 32,
  },
  itemTitle: {
    marginBottom: theme.spacing.unit,
    color: theme.palette.primary.main,
  },
  section: {
    padding: theme.spacing.unit * 3,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  sectionLink: {
    cursor: 'pointer',
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
  linodesWithGroupsToImport: Record<string, string[]>;
  domainsWithGroupsToImport: Record<string, string[]>
  openImportDrawer: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ImportGroupsCard: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, domainsWithGroupsToImport, linodesWithGroupsToImport, openImportDrawer } = props;

  if (!linodesWithGroupsToImport && !domainsWithGroupsToImport) { return null; }

  return (
    <DashboardCard>
      <Paper className={classNames(
        {
          [classes.section]: true,
          [classes.title]: true
        }
      )}>
        <Typography className={classes.header} variant="h1">
          Import Your Display Group to Tags
        </Typography>
      </Paper>
      <Paper className={classNames(
        {
          [classes.section]: true,
          [classes.sectionLink]: true
        }
        )}
      >
        <Typography variant="body1" >
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

ImportGroupsCard.displayName = "ImportGroupsCard";

const styled = withStyles(styles);

export default styled(ImportGroupsCard);
