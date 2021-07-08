import { Account } from '@linode/api-v4/lib/account';
import {
  Config,
  Disk,
  getLinodeKernels,
  Kernel,
  linodeReboot,
} from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { Volume } from '@linode/api-v4/lib/volumes';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import RootRef from 'src/components/core/RootRef';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableContentWrapper from 'src/components/TableContentWrapper';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import withFeatureFlags, {
  FeatureFlagConsumerProps,
} from 'src/containers/withFeatureFlagConsumer.container.ts';
import { resetEventsPolling } from 'src/eventsPolling';
import {
  DeleteLinodeConfig,
  withLinodeDetailContext,
} from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import { MapState } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import LinodeConfigDrawer from '../LinodeSettings/LinodeConfigDialog';
import ConfigRow from './ConfigRow';

type ClassNames =
  | 'root'
  | 'headline'
  | 'addNewWrapper'
  | 'tableCell'
  | 'labelColumn'
  | 'interfacesColumn'
  | 'deviceColumn'
  | 'actionsColumn';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.color.white,
      margin: 0,
      width: '100%',
    },
    headline: {
      marginTop: 8,
      marginBottom: 8,
      marginLeft: 15,
      lineHeight: '1.5rem',
    },
    addNewWrapper: {
      [theme.breakpoints.down('xs')]: {
        marginLeft: -(theme.spacing(1) + theme.spacing(1) / 2),
        marginTop: -theme.spacing(1),
      },
      padding: '5px !important',
    },
    tableCell: {
      borderRight: `1px solid ${theme.palette.divider}`,
      fontWeight: 'bold',
    },
    labelColumn: {
      ...theme.applyTableHeaderStyles,
      width: '35%',
    },
    interfacesColumn: {
      width: '30%',
    },
    deviceColumn: {
      width: '25%',
    },
    actionsColumn: {
      width: '10%',
    },
  });

type CombinedProps = LinodeContext &
  FeatureFlagConsumerProps &
  WithStyles<ClassNames> &
  WithSnackbarProps &
  StateProps;

interface State {
  configDrawer: ConfigDrawerState;
  confirmDelete: ConfirmDeleteState;
  confirmBoot: ConfirmBootState;
  submitting: boolean;
  success?: string;
  kernels: Kernel[];
  kernelError: APIError[] | null;
  kernelsLoading: boolean;
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
  error?: string;
}

interface ConfirmBootState {
  open: boolean;
  submitting: boolean;
  configId?: number;
  label?: string;
  error?: string;
}

const getAllKernels = getAll<Kernel>(getLinodeKernels);

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
    confirmBoot: {
      open: false,
      submitting: false,
    },
    configDrawer: this.defaultConfigDrawerState,
    kernels: [],
    kernelError: null,
    kernelsLoading: false,
  };

  requestKernels = (linodeHypervisor: 'kvm' | 'xen') => {
    this.setState({ kernelsLoading: true, kernelError: null });

    return getAllKernels({}, { [linodeHypervisor]: true })
      .then(({ data: kernels }) => {
        this.setState({
          kernels,
          kernelsLoading: false,
        });
      })
      .catch((error) => {
        this.setState({
          kernelError: getAPIErrorOrDefault(error, 'Unable to load kernels.'),
          kernelsLoading: false,
        });
      });
  };

  componentDidMount() {
    this.requestKernels(this.props.linodeHypervisor);
  }

  configsPanel = React.createRef();

  render() {
    const { classes, readOnly } = this.props;

    return (
      <React.Fragment>
        <Grid
          container
          justify="space-between"
          alignItems="flex-end"
          className={classes.root}
        >
          <RootRef rootRef={this.configsPanel}>
            <Grid item className="p0">
              <Typography variant="h3" className={classes.headline}>
                Configurations
              </Typography>
            </Grid>
          </RootRef>
          <Grid item className={classes.addNewWrapper}>
            <AddNewLink
              onClick={this.openConfigDrawerForCreation}
              label="Add Configuration"
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
          open={this.state.configDrawer.open}
          kernels={this.state.kernels}
          kernelError={this.state.kernelError}
          kernelsLoading={this.state.kernelsLoading}
        />
        <ConfirmationDialog
          title="Confirm Delete"
          error={this.state.confirmDelete.error}
          open={this.state.confirmDelete.open}
          onClose={this.resetConfirmConfigDelete}
          actions={this.deleteConfigConfirmationActions}
        >
          <Typography>
            Are you sure you want to delete &quot;
            {this.state.confirmDelete.label}?&quot;
          </Typography>
        </ConfirmationDialog>
        <ConfirmationDialog
          title="Confirm Boot"
          error={this.state.confirmBoot.error}
          open={this.state.confirmBoot.open}
          onClose={this.cancelBoot}
          actions={this.bootConfigConfirmationActions}
        >
          <Typography>
            Are you sure you want to boot &quot;{this.state.confirmBoot.label}
            ?&quot;
          </Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }

  resetConfigDrawer = () => this.setConfigDrawer({ open: false });

  deleteConfigConfirmationActions = ({ onClose }: { onClose: () => void }) => (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="secondary" onClick={onClose} data-qa-cancel-delete>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={this.deleteConfig}
        loading={this.state.confirmDelete.submitting}
        data-qa-confirm-delete
      >
        Delete
      </Button>
    </ActionsPanel>
  );

  bootConfigConfirmationActions = () => (
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        onClick={this.cancelBoot}
        buttonType="secondary"
        data-qa-cancel-delete
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        loading={this.state.confirmBoot.submitting}
        onClick={this.handleBoot}
        data-qa-confirm-reboot
      >
        Boot
      </Button>
    </ActionsPanel>
  );

  resetConfirmConfigDelete = () =>
    this.setConfirmDelete({
      open: false,
      id: undefined,
      submitting: false,
      error: undefined,
    });

  setConfigDrawer = (obj: Partial<ConfigDrawerState>, fn?: () => void) =>
    this.setState(
      {
        configDrawer: {
          ...this.state.configDrawer,
          ...obj,
        },
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
          ...obj,
        },
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
      linodeConfigId: undefined,
    });
  };

  openForEditing = (config: Config) => {
    this.setConfigDrawer({
      open: true,
      linodeConfigId: config.id,
    });
  };

  confirmDelete = (id: number, label: string) => {
    this.setConfirmDelete({ open: true, id, label, error: undefined });
  };

  confirmBoot = (configId: number, label: string) => {
    this.setState({
      confirmBoot: {
        ...this.state.confirmBoot,
        open: true,
        error: undefined,
        configId,
        label,
      },
    });
  };

  cancelBoot = () => {
    this.setState({ confirmBoot: { ...this.state.confirmBoot, open: false } });
  };

  handleBoot = () => {
    this.setState({
      confirmBoot: {
        ...this.state.confirmBoot,
        error: undefined,
        submitting: true,
      },
    });

    linodeReboot(this.props.linodeId, this.state.confirmBoot.configId)
      .then(() => {
        this.setState({
          confirmBoot: {
            ...this.state.confirmBoot,
            open: false,
            submitting: false,
          },
        });

        resetEventsPolling();
      })
      .catch((errorResponse) => {
        const error = getAPIErrorOrDefault(
          errorResponse,
          `Error booting ${this.state.confirmBoot.label}`
        )[0].reason;

        this.setState({
          confirmBoot: { ...this.state.confirmBoot, submitting: false, error },
        });
      });
  };

  deleteConfig = () => {
    this.setConfirmDelete({ submitting: true, error: undefined });
    const {
      confirmDelete: { id: configId },
    } = this.state;
    if (!configId) {
      return;
    }

    this.props
      .deleteLinodeConfig(configId)
      .then(() => {
        this.setConfirmDelete(
          {
            submitting: true,
          },
          () => {
            this.setConfirmDelete({
              submitting: false,
              open: false,
              id: undefined,
            });
          }
        );
      })
      .catch((err) => {
        this.setConfirmDelete({
          submitting: false,
          error: getAPIErrorOrDefault(err, 'Unable to delete configuration.')[0]
            .reason,
        });
      });
  };

  linodeConfigsTable = () => {
    const { classes } = this.props;

    return (
      <OrderBy data={this.props.configs} orderBy={'label'} order={'asc'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <Paginate data={orderedData} scrollToRef={this.configsPanel}>
            {({
              data: paginatedData,
              handlePageChange,
              handlePageSizeChange,
              page,
              pageSize,
              count,
            }) => {
              const {
                configsLastUpdated,
                configsLoading,
                configsError,
                linodeId,
                readOnly,
              } = this.props;
              return (
                <React.Fragment>
                  <Table aria-label="List of Configurations">
                    <TableHead>
                      <TableRow>
                        <TableSortCell
                          active={orderBy === 'label'}
                          label={'label'}
                          direction={order}
                          handleClick={handleOrderChange}
                          data-qa-config-label-header
                          className={classes.labelColumn}
                        >
                          <strong>Config</strong>
                        </TableSortCell>
                        <TableCell
                          className={`${classes.tableCell} ${classes.deviceColumn}`}
                        >
                          Disks
                        </TableCell>
                        <TableCell
                          className={`${classes.tableCell} ${classes.interfacesColumn}`}
                        >
                          Network Interfaces
                        </TableCell>
                        <TableCell className={classes.actionsColumn} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableContentWrapper
                        loading={
                          (configsLoading && configsLastUpdated === 0) ||
                          this.state.kernelsLoading
                        }
                        lastUpdated={configsLastUpdated}
                        length={paginatedData.length}
                        error={configsError ?? undefined}
                      >
                        {paginatedData.map((thisConfig) => {
                          const kernel = this.state.kernels.find(
                            (kernelName) => kernelName.id === thisConfig.kernel
                          );
                          return (
                            <ConfigRow
                              key={`config-row-${thisConfig.id}`}
                              config={thisConfig}
                              linodeId={linodeId}
                              linodeMemory={this.props.linodeMemory}
                              linodeDisks={this.props.linodeDisks}
                              linodeKernel={kernel?.label ?? thisConfig.kernel}
                              onBoot={this.confirmBoot}
                              onEdit={this.openForEditing}
                              onDelete={this.confirmDelete}
                              readOnly={readOnly}
                              linodeVolumes={this.props.linodeVolumes}
                            />
                          );
                        })}
                      </TableContentWrapper>
                    </TableBody>
                  </Table>
                  <PaginationFooter
                    count={count}
                    page={page}
                    pageSize={pageSize}
                    handlePageChange={handlePageChange}
                    handleSizeChange={handlePageSizeChange}
                    eventCategory="linode configs"
                  />
                </React.Fragment>
              );
            }}
          </Paginate>
        )}
      </OrderBy>
    );
  };
}

const styled = withStyles(styles);

const errorBoundary = PanelErrorBoundary({
  heading: 'Advanced Configurations',
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
  configs: Config[];
  getLinodeConfigs: () => void;
  linodeDisks: Disk[];
  linodeVolumes: Volume[];
}

const linodeContext = withLinodeDetailContext<LinodeContext>(
  ({ linode, deleteLinodeConfig, getLinodeConfigs }) => ({
    linodeHypervisor: linode.hypervisor,
    linodeId: linode.id,
    linodeLabel: linode.label,
    linodeMemory: linode.specs.memory,
    linodeRegion: linode.region,
    linodeStatus: linode.status,
    linodeTotalDisk: linode.specs.disk,
    readOnly: linode._permissions === 'read_only',
    deleteLinodeConfig,
    configs: linode._configs,
    getLinodeConfigs,
    linodeDisks: linode._disks,
    linodeVolumes: linode._volumes,
  })
);

interface StateProps {
  configsError?: APIError[];
  configsLoading: boolean;
  configsLastUpdated: number;
  accountData?: Account;
}

const mapStateToProps: MapState<StateProps, LinodeContext> = (
  state,
  ownProps
) => {
  const configState = state.__resources.linodeConfigs[ownProps.linodeId];
  return {
    configsLastUpdated: configState?.lastUpdated ?? 0,
    configsLoading: configState?.loading ?? false,
    configsError: configState?.error.read ?? undefined,
    accountData: state.__resources.account.data,
  };
};

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, {}>(
  linodeContext,
  withFeatureFlags,
  connected,
  styled,
  errorBoundary,
  withSnackbar
);

export default enhanced(LinodeConfigs);
