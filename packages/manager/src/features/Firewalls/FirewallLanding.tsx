import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import AddNewLink from 'src/components/AddNewLink';
import Breadcrumb from 'src/components/Breadcrumb';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import DocumentationButton from 'src/components/DocumentationButton';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import withFirewalls, {
  Props as FireProps
} from 'src/containers/firewalls.container';
import FirewallTable from './FirewallTable';

const useStyles = makeStyles((theme: Theme) => ({
  line: {
    minHeight: '48px',
    marginBottom: theme.spacing(3),
    /** these colors match up with the AppBar component boxShadow colors */
    boxShadow: `inset 0 -1px 0 ${
      theme.name === 'lightTheme' ? theme.color.border2 : theme.color.border3
    }`
  }
}));

type CombinedProps = RouteComponentProps<{}> & FireProps;

const FirewallLanding: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    data: firewalls,
    loading: firewallsLoading,
    error: firewallsError,
    lastUpdated: firewallsLastUpdated,
    listOfIDsInOriginalOrder: firewallsKeys
  } = props;

  React.useEffect(() => {
    if (
      firewallsKeys.length === 0 &&
      firewallsLastUpdated === 0 &&
      !firewallsLoading
    ) {
      props.getFirewalls({ hello: 'hello' }, { world: 'world' });
    }
  }, [firewallsLastUpdated, firewallsLoading, firewallsKeys]);

  return (
    <React.Fragment>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <DocumentTitleSegment segment="List of Firewalls" />
        <Breadcrumb pathname={props.location.pathname} labelTitle="Firewalls" />
        <DocumentationButton href={'https://google.com'} />
      </Box>
      <div className={classes.line} />
      <Grid
        container
        justify="flex-end"
        alignItems="flex-end"
        style={{ paddingBottom: 0 }}
      >
        <Grid item>
          <Grid container alignItems="flex-end">
            <Grid item className="pt0">
              <AddNewLink
                onClick={() => null}
                label="Add a Firewall"
                disabled
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <FirewallTable
        data={firewalls}
        loading={firewallsLoading}
        error={firewallsError}
        lastUpdated={firewallsLastUpdated}
        listOfIDsInOriginalOrder={firewallsKeys}
        results={props.results}
      />
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(
  React.memo,
  withFirewalls<{}, CombinedProps>()
)(FirewallLanding);
