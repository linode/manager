import { compose } from 'ramda';
import * as React from 'react';
import 'typeface-lato';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Grid from 'src/components/Grid';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import Table from 'src/components/Table';
import { events$ } from 'src/events';
import { withConfigs, withLinode } from 'src/features/linodes/LinodesDetail/context';
import { genEvent } from 'src/features/linodes/LinodesLanding/powerActions';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import { deleteLinodeConfig } from 'src/services/linodes';

import LinodeConfigActionMenu from './LinodeConfigActionMenu';
import LinodeConfigDrawer from './LinodeConfigDrawer';

type ClassNames = 'root' | 'headline';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  headline: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
});

type CombinedProps =
  & LinodeContext
  & ConfigsContext
  & WithStyles<ClassNames>;

interface State {
  configDrawer: ConfigDrawerState;
  confirmDelete: ConfirmDeleteState;
  submitting: boolean;
  success?: string;
}

interface ConfigDrawerState {
  open: boolean;
  linodeConfigId?: number;
}

interface ConfirmDeleteState {
  open: boolean;
  submitting: boolean;
  id?: number;
  label?: string;
}

class LinodeConfigs extends React.Component<CombinedProps, State> {
  defaultConfigDrawerState: ConfigDrawerState = {
    open: false,
  };

  state: State = {
    submitting: false,
    confirmDelete: {
      open: false,
      submitting: false,
    },
    configDrawer: this.defaultConfigDrawerState,
  };

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Grid
          container
          justify="space-between"
          alignItems="flex-end"
        >
          <Grid item>
            <Typography role="header" variant="title" className={classes.headline}>
              Configuration
            </Typography>
          </Grid>
          <Grid item>
            <AddNewLink
              onClick={this.openConfigDrawerForCreation}
              label="Add a Configuration"
            />
          </Grid>
        </Grid>
        <this.linodeConfigsTable />
        <LinodeConfigDrawer
          linodeConfigId={this.state.configDrawer.linodeConfigId}
          linodeId={this.props.linodeId}
          linodeRegion={this.props.linodeRegion}
          maxMemory={this.props.linodeMemory}
          onClose={this.resetConfigDrawer}
          onSuccess={this.props.linodeConfigsRequest}
          open={this.state.configDrawer.open}
        />
        <ConfirmationDialog
          title="Confirm Delete"
          open={this.state.confirmDelete.open}
          onClose={this.resetConfirmConfigDelete}
          actions={this.deleteConfigConfirmationActions}
        >
          <Typography>
            Are you sure you want to delete "{this.state.confirmDelete.label}"
          </Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }

  resetConfigDrawer = () => this.setConfigDrawer({ open: false });

  deleteConfigConfirmationActions = ({ onClose }: { onClose: () => void }) => (
    <ActionsPanel style={{ padding: 0 }}>
      <Button onClick={onClose} type="cancel" data-qa-cancel-delete>
        Cancel
      </Button>
      <Button type="secondary" destructive onClick={this.deleteConfig} data-qa-confirm-delete>
        Delete
    </Button>
    </ActionsPanel>
  );

  resetConfirmConfigDelete = () => this.setConfirmDelete({ open: false, id: undefined })

  setConfigDrawer = (obj: Partial<ConfigDrawerState>, fn?: () => void) => this.setState({
    configDrawer: {
      ...this.state.configDrawer,
      ...obj,
    },
  }, () => { if (fn) { fn(); } })

  setConfirmDelete = (obj: Partial<ConfirmDeleteState>, fn?: () => void) => this.setState({
    confirmDelete: {
      ...this.state.confirmDelete,
      ...obj,
    },
  }, () => { if (fn) { fn(); } })

  openConfigDrawerForCreation = () => {
    this.setConfigDrawer({
      open: true,
      linodeConfigId: undefined,
    })
  };

  openForEditing = (config: Linode.Config) => {
    this.setConfigDrawer({
      open: true,
      linodeConfigId: config.id,
    });
  }

  confirmDelete = (id: number, label: string) => {
    this.setConfirmDelete({ open: true, id, label });
  }

  deleteConfig = () => {
    this.setConfirmDelete({ submitting: true });
    const { linodeId, linodeLabel } = this.props;
    const { confirmDelete: { id: configId } } = this.state;
    if (!configId) { return; }

    deleteLinodeConfig(linodeId, configId)
      .then(() => {
        this.props.linodeConfigsRequest();

        events$.next(genEvent('linode_reboot', linodeId, linodeLabel));

        this.setConfirmDelete({
          submitting: false,
        }, () => { this.setConfirmDelete({ submitting: false, open: false, id: undefined }); });
      })
      .catch((error) => {
        this.setConfirmDelete({ submitting: false, open: false, id: undefined });
        sendToast(`Unable to delete configuration.`);
      });
  }

  linodeConfigsTable = () => {
    return (
      <Table isResponsive={false} aria-label="List of Configurations">
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>

        <TableBody>
          {
            this.props.linodeConfigs.map(config => (
              <TableRow key={config.id} data-qa-config={config.label}>
                <TableCell>{config.label}</TableCell>
                <TableCell>
                  <LinodeConfigActionMenu
                    config={config}
                    onEdit={this.openForEditing}
                    onDelete={this.confirmDelete}
                  />
                </TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const errorBoundary = PanelErrorBoundary({ heading: 'Advanced Configurations' });

interface LinodeContext {
  linodeId: number;
  linodeLabel: string;
  linodeMemory: number;
  linodeTotalDisk: number;
  linodeRegion: string;
  linodeStatus: string;
};

const linodeContext = withLinode<LinodeContext>((context) => ({
  linodeId: context.data!.id,
  linodeLabel: context.data!.label,
  linodeMemory: context.data!.specs.memory,
  linodeTotalDisk: context.data!.specs.disk,
  linodeRegion: context.data!.region,
  linodeStatus: context.data!.status,
}));

interface ConfigsContext {
  linodeConfigs: Linode.Config[];
  linodeConfigsRequest: () => void;
}

const configsContext = withConfigs<ConfigsContext>((context) => ({
  linodeConfigs: context.data,
  linodeConfigsRequest: context.request,
}));

const contexts = compose<any, any, any>(
  linodeContext,
  configsContext,
);

const enhanced = compose(
  errorBoundary,
  contexts,
  styled,
);

export default enhanced(LinodeConfigs);
