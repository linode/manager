import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import AddNewLink from 'src/components/AddNewLink';
import Breadcrumb from 'src/components/Breadcrumb';
import Box from 'src/components/core/Box';
import Divider from 'src/components/core/Divider';
import DocumentationButton from 'src/components/DocumentationButton';
import Grid from 'src/components/Grid';

import withLongviewClients, {
  Props as LongviewProps
} from 'src/containers/longview.container';

import AddClientDrawer from './AddClientDrawer';
import DeleteDialog from './LongviewDeleteDialog';
import LongviewTable from './LongviewTable';

const useStyles = makeStyles((theme: Theme) => ({
  line: {
    marginTop: theme.spacing(10),
    marginBottom: theme.spacing(3)
  }
}));

type CombinedProps = RouteComponentProps & LongviewProps;

const LongviewContent: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const [addDrawerOpen, toggleAddDrawer] = React.useState<boolean>(false);
  const [deleteDialogOpen, toggleDeleteDialog] = React.useState<boolean>(false);
  const [selectedClientID, setClientID] = React.useState<number | undefined>(
    undefined
  );
  const [selectedClientLabel, setClientLabel] = React.useState<string>('');

  React.useEffect(() => {
    props.getLongviewClients();
  }, []);

  const openDeleteDialog = (id: number, label: string) => {
    toggleDeleteDialog(true);
    setClientID(id);
    setClientLabel(label);
  };

  const {
    longviewClientsData,
    longviewClientsError,
    longviewClientsLastUpdated,
    longviewClientsLoading,
    longviewClientsResults,
    createLongviewClient,
    deleteLongviewClient
  } = props;

  return (
    <React.Fragment>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Breadcrumb pathname={props.location.pathname} labelTitle="Longview" />
        <DocumentationButton href={'https://google.com'} />
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
                onClick={() => toggleAddDrawer(true)}
                label="Add a Client"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <LongviewTable
        longviewClientsData={longviewClientsData}
        longviewClientsError={longviewClientsError}
        longviewClientsLastUpdated={longviewClientsLastUpdated}
        longviewClientsLoading={longviewClientsLoading}
        longviewClientsResults={longviewClientsResults}
        triggerDeleteLongviewClient={openDeleteDialog}
        triggerEditLongviewClient={() => null}
      />
      <AddClientDrawer
        title="Add Longview Client"
        onClose={() => toggleAddDrawer(false)}
        open={addDrawerOpen}
        createClient={createLongviewClient}
      />
      <DeleteDialog
        selectedLongviewClientID={selectedClientID}
        selectedLongviewClientLabel={selectedClientLabel}
        deleteClient={deleteLongviewClient}
        open={deleteDialogOpen}
        closeDialog={() => toggleDeleteDialog(false)}
      />
    </React.Fragment>
  );
};

export default compose<CombinedProps, RouteComponentProps>(
  React.memo,
  withLongviewClients()
)(LongviewContent);
