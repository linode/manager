import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import AddNewLink from 'src/components/AddNewLink';
import Breadcrumb from 'src/components/Breadcrumb';
import Box from 'src/components/core/Box';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import DocumentationButton from 'src/components/DocumentationButton';
import Grid from 'src/components/Grid';
import withFirewalls, {
  Props as FireProps
} from 'src/containers/firewalls.container';
import AddFirewallDrawer from './AddFirewallDrawer';
import FirewallDialog, { Mode } from './FirewallDialog';
import FirewallTable from './FirewallTable';

const useStyles = makeStyles((theme: Theme) => ({
  line: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(3)
  }
}));

type CombinedProps = RouteComponentProps<{}> & FireProps;

const FirewallLanding: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { deleteFirewall, disableFirewall, enableFirewall } = props;

  const [addFirewallDrawerOpen, toggleAddFirewallDrawer] = React.useState<
    boolean
  >(false);
  const [modalOpen, toggleModal] = React.useState<boolean>(false);
  const [dialogMode, setDialogMode] = React.useState<Mode>('enable');
  const [selectedFirewallID, setSelectedFirewallID] = React.useState<
    number | undefined
  >(undefined);
  const [selectedFirewallLabel, setSelectedFirewallLabel] = React.useState<
    string
  >('');

  const openModal = (mode: Mode, id: number, label: string) => {
    setSelectedFirewallID(id);
    setSelectedFirewallLabel(label);
    setDialogMode(mode);
    toggleModal(true);
  };

  const handleOpenDeleteFirewallModal = (id: number, label: string) => {
    openModal('delete', id, label);
  };

  const handleOpenEnableFirewallModal = (id: number, label: string) => {
    openModal('enable', id, label);
  };

  const handleOpenDisableFirewallModal = (id: number, label: string) => {
    openModal('disable', id, label);
  };

  const {
    itemsById: firewalls,
    loading: firewallsLoading,
    error: firewallsError,
    lastUpdated: firewallsLastUpdated
  } = props;

  return (
    <React.Fragment>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Breadcrumb pathname={props.location.pathname} labelTitle="Firewalls" />
        <DocumentationButton
          href={
            'https://linode.com/docs/platform/cloud-firewall/getting-started-with-cloud-firewall/'
          }
        />
      </Box>
      <Divider className={classes.line} type="landingHeader" />
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
                onClick={() => toggleAddFirewallDrawer(true)}
                label="Add a Firewall"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <FirewallTable
        itemsById={firewalls}
        loading={firewallsLoading}
        error={firewallsError}
        lastUpdated={firewallsLastUpdated}
        results={props.results}
        triggerDeleteFirewall={handleOpenDeleteFirewallModal}
        triggerDisableFirewall={handleOpenDisableFirewallModal}
        triggerEnableFirewall={handleOpenEnableFirewallModal}
      />
      <AddFirewallDrawer
        open={addFirewallDrawerOpen}
        onClose={() => toggleAddFirewallDrawer(false)}
        onSubmit={props.createFirewall}
        title="Add a Firewall"
      />
      <FirewallDialog
        open={modalOpen}
        mode={dialogMode}
        enableFirewall={enableFirewall}
        disableFirewall={disableFirewall}
        deleteFirewall={deleteFirewall}
        selectedFirewallID={selectedFirewallID}
        selectedFirewallLabel={selectedFirewallLabel}
        closeDialog={() => toggleModal(false)}
      />
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(
  React.memo,
  withFirewalls<{}, CombinedProps>()
)(FirewallLanding);
