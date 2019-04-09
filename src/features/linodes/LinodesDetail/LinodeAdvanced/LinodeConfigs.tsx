/**
 * @todo Since configs are requested and stored in Redux, this needs to be updated to use
 * the OrderBy and Paginated components, rather than Pagey.
 */

import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import Table from 'src/components/Table';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { resetEventsPolling } from 'src/events';
import {
  DeleteLinodeConfig,
  withLinodeDetailContext
} from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import { getLinodeConfigs, linodeReboot } from 'src/services/linodes';
import LinodeConfigActionMenu from '../LinodeSettings/LinodeConfigActionMenu';
import LinodeConfigDrawer from '../LinodeSettings/LinodeConfigDrawer';

type ClassNames = 'root' | 'headline';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  headline: {
    marginBottom: theme.spacing.unit * 2
  }
});

interface Props {
  active: boolean;
}

type CombinedProps = Props &
  LinodeContext &
  PaginationProps<Linode.Config> &
  WithStyles<ClassNames> &
  InjectedNotistackProps;

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
    open: false
  };

  state: State = {
    submitting: false,
    confirmDelete: {
      open: false,
      submitting: false
    },
    configDrawer: this.defaultConfigDrawerState
  };

  componentDidUpdate(prevProps: CombinedProps) {
    if (prevProps.active === false && this.props.active === true) {
      this.props.handleOrderChange('label');
    }
  }

  render() {
    const { classes, readOnly } = this.props;

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end">
          <Grid item>
            <Typography variant="h3" className={classes.headline}>
              Configuration
            </Typography>
          </Grid>
          <Grid item>
            <AddNewLink
              onClick={this.openConfigDrawerForCreation}
              label="Add a Configuration"
              disabled={readOnly}
            />
          </Grid>
        </Grid>
        <this.linodeConfigsTable />
        <LinodeConfigDrawer
          linodeConfigId={this.state.configDrawer.linodeConfigId}
          linodeHypervisor={this.props.linodeHypervisor}
          linodeRegion={this.props.linodeRegion}
          maxMemory={this.props.linodeMemory}
          onClose={this.resetConfigDrawer}
          onSuccess={this.props.request}
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
      <Button
        type="secondary"
        destructive
        onClick={this.deleteConfig}
        data-qa-confirm-delete
      >
        Delete
      </Button>
    </ActionsPanel>
  );

  resetConfirmConfigDelete = () =>
    this.setConfirmDelete({ open: false, id: undefined });

  setConfigDrawer = (obj: Partial<ConfigDrawerState>, fn?: () => void) =>
    this.setState(
      {
        configDrawer: {
          ...this.state.configDrawer,
          ...obj
        }
      },
      () => {
        if (fn) {
          fn();
        }
      }
    );

  setConfirmDelete = (obj: Partial<ConfirmDeleteState>, fn?: () => void) =>
    this.setState(
      {
        confirmDelete: {
          ...this.state.confirmDelete,
          ...obj
        }
      },
      () => {
        if (fn) {
          fn();
        }
      }
    );

  openConfigDrawerForCreation = () => {
    this.setConfigDrawer({
      open: true,
      linodeConfigId: undefined
    });
  };

  openForEditing = (config: Linode.Config) => {
    this.setConfigDrawer({
      open: true,
      linodeConfigId: config.id
    });
  };

  confirmDelete = (id: number, label: string) => {
    this.setConfirmDelete({ open: true, id, label });
  };

  handleBoot = (linodeId: number, configId: number, label: string) => {
    linodeReboot(linodeId, configId)
      .then(() => {
        resetEventsPolling();
      })
      .catch(errorResponse => {
        const errors = pathOr(
          [{ reason: `Error booting ${label}` }],
          ['response', 'data', 'errors'],
          errorResponse
        );
        errors.map((error: Linode.ApiFieldError) => {
          this.props.enqueueSnackbar(error.reason, {
            variant: 'error'
          });
        });
      });
  };

  deleteConfig = () => {
    this.setConfirmDelete({ submitting: true });
    const { deleteLinodeConfig } = this.props;
    const {
      confirmDelete: { id: configId }
    } = this.state;
    if (!configId) {
      return;
    }

    deleteLinodeConfig(configId)
      .then(() => this.props.onDelete())
      .then(() => {
        this.setConfirmDelete(
          {
            submitting: false
          },
          () => {
            this.setConfirmDelete({
              submitting: false,
              open: false,
              id: undefined
            });
          }
        );
      })
      .catch(error => {
        this.setConfirmDelete({
          submitting: false,
          open: false,
          id: undefined
        });
        /** @todo move this inside the actual delete modal */
        this.props.enqueueSnackbar(`Unable to delete configuration.`, {
          variant: 'error'
        });
      });
  };

  linodeConfigsTable = () => {
    return (
      <React.Fragment>
        <Table isResponsive={false} aria-label="List of Configurations" border>
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {this.renderConfigTableContent(
              this.props.loading,
              this.props.error,
              this.props.data
            )}
          </TableBody>
        </Table>
        <PaginationFooter
          count={this.props.count}
          page={this.props.page}
          pageSize={this.props.pageSize}
          handlePageChange={this.props.handlePageChange}
          handleSizeChange={this.props.handlePageSizeChange}
          eventCategory="linode configs"
        />
      </React.Fragment>
    );
  };

  renderConfigTableContent = (
    loading: boolean,
    error?: Error,
    data?: Linode.Config[]
  ) => {
    if (error) {
      return (
        <TableRowError colSpan={2} message={`Unable to load configurations.`} />
      );
    }

    if (loading) {
      return <TableRowLoading colSpan={2} />;
    }

    if (!data || data.length === 0) {
      return <TableRowEmptyState colSpan={2} />;
    }

    return data.map(config => (
      <TableRow key={config.id} data-qa-config={config.label}>
        <TableCell>{config.label}</TableCell>
        <TableCell>
          <LinodeConfigActionMenu
            config={config}
            linodeId={this.props.linodeId}
            onBoot={this.handleBoot}
            onEdit={this.openForEditing}
            onDelete={this.confirmDelete}
            readOnly={this.props.readOnly}
          />
        </TableCell>
      </TableRow>
    ));
  };
}

const styled = withStyles(styles);

const errorBoundary = PanelErrorBoundary({
  heading: 'Advanced Configurations'
});

interface LinodeContext {
  linodeHypervisor: 'kvm' | 'xen';
  linodeId: number;
  linodeLabel: string;
  linodeMemory: number;
  linodeRegion: string;
  linodeStatus: string;
  linodeTotalDisk: number;
  deleteLinodeConfig: DeleteLinodeConfig;
  readOnly: boolean;
}

const linodeContext = withLinodeDetailContext<LinodeContext>(
  ({ linode, deleteLinodeConfig }) => ({
    linodeHypervisor: linode.hypervisor,
    linodeId: linode.id,
    linodeLabel: linode.label,
    linodeMemory: linode.specs.memory,
    linodeRegion: linode.region,
    linodeStatus: linode.status,
    linodeTotalDisk: linode.specs.disk,
    readOnly: linode._permissions === 'read_only',
    deleteLinodeConfig
  })
);

const paginated = Pagey((ownProps: LinodeContext, params, filters) => {
  return getLinodeConfigs(ownProps.linodeId, params, filters);
});

const enhanced = compose<CombinedProps, Props>(
  linodeContext,
  paginated,
  styled,
  errorBoundary,
  withSnackbar
);

export default enhanced(LinodeConfigs);
