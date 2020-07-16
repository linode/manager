import {
  Config,
  linodeReboot,
  Disk,
  getLinodeKernels,
  Kernel
} from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink/AddNewLink_CMR';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import RootRef from 'src/components/core/RootRef';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/TableCell/TableCell_CMR.tsx';
import TableSortCell from 'src/components/TableSortCell/TableSortCell_CMR';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import PaginationFooter from 'src/components/PaginationFooter';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import Table from 'src/components/Table/Table_CMR';
import TableContentWrapper from 'src/components/TableContentWrapper';
import { resetEventsPolling } from 'src/eventsPolling';
import {
  DeleteLinodeConfig,
  withLinodeDetailContext
} from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import { MapState } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import LinodeConfigDrawer from '../LinodeSettings/LinodeConfigDrawer_CMR';
import ConfigRow from './ConfigRow_CMR';
import OrderBy from 'src/components/OrderBy';
import { getAll } from 'src/utilities/getAll';

import Paginate from 'src/components/Paginate';

type ClassNames =
  | 'root'
  | 'gridContainer'
  | 'headline'
  | 'addNewWrapper'
  | 'labelCell'
  | 'tableCell';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.color.white,
      margin: 0,
      width: '100%'
    },
    headline: {
      marginBottom: 3,
      marginLeft: 8,
      lineHeight: '1.5rem',
      [theme.breakpoints.down('xs')]: {
        marginBottom: 0,
        marginTop: theme.spacing(2)
      }
    },
    addNewWrapper: {
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        marginLeft: -(theme.spacing(1) + theme.spacing(1) / 2),
        marginTop: -theme.spacing(1)
      }
    },
    labelCell: {
      width: '25%'
    },
    tableCell: {
      borderRight: `1px solid ${theme.palette.divider}`,
      fontWeight: 'bold'
    }
  });

type CombinedProps = LinodeContext &
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
    open: false
  };

  state: State = {
    submitting: false,
    confirmDelete: {
      open: false,
      submitting: false
    },
    confirmBoot: {
      open: false,
      submitting: false
    },
    configDrawer: this.defaultConfigDrawerState,
    kernels: [],
    kernelError: null,
    kernelsLoading: false
  };

  requestKernels = (linodeHypervisor: 'kvm' | 'xen') => {
    this.setState({ kernelsLoading: true, kernelError: null });

    return getAllKernels({}, { [linodeHypervisor]: true })
      .then(({ data: kernels }) => {
        this.setState({
          kernels,
          kernelsLoading: false
        });
      })
      .catch(error => {
        this.setState({
          kernelError: getAPIErrorOrDefault(error, 'Unable to load kernels.'),
          kernelsLoading: false
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
            <Grid item>
              <Typography variant="h3" className={classes.headline}>
                Configurations
              </Typography>
            </Grid>
          </RootRef>
          <Grid item className={classes.addNewWrapper}>
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
            Are you sure you want to delete "{this.state.confirmDelete.label}?"
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
            Are you sure you want to boot "{this.state.confirmBoot.label}?"
          </Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }

  resetConfigDrawer = () => this.setConfigDrawer({ open: false });

  deleteConfigConfirmationActions = ({ onClose }: { onClose: () => void }) => (
    <ActionsPanel style={{ padding: 0 }}>
      <Button onClick={onClose} buttonType="cancel" data-qa-cancel-delete>
        Cancel
      </Button>
      <Button
        buttonType="secondary"
        destructive
        loading={this.state.confirmDelete.submitting}
        onClick={this.deleteConfig}
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
        buttonType="cancel"
        data-qa-cancel-delete
      >
        Cancel
      </Button>
      <Button
        buttonType="secondary"
        destructive
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
      error: undefined
    });

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

  openForEditing = (config: Config) => {
    this.setConfigDrawer({
      open: true,
      linodeConfigId: config.id
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
        label
      }
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
        submitting: true
      }
    });

    linodeReboot(this.props.linodeId, this.state.confirmBoot.configId)
      .then(() => {
        this.setState({
          confirmBoot: {
            ...this.state.confirmBoot,
            open: false,
            submitting: false
          }
        });

        resetEventsPolling();
      })
      .catch(errorResponse => {
        const error = getAPIErrorOrDefault(
          errorResponse,
          `Error booting ${this.state.confirmBoot.label}`
        )[0].reason;

        this.setState({
          confirmBoot: { ...this.state.confirmBoot, submitting: false, error }
        });
      });
  };

  deleteConfig = () => {
    this.setConfirmDelete({ submitting: true, error: undefined });
    const {
      confirmDelete: { id: configId }
    } = this.state;
    if (!configId) {
      return;
    }

    this.props
      .deleteLinodeConfig(configId)
      .then(() => {
        this.setConfirmDelete(
          {
            submitting: true
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
      .catch(err => {
        this.setConfirmDelete({
          submitting: false,
          error: getAPIErrorOrDefault(err, 'Unable to delete configuration.')[0]
            .reason
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
              count
            }) => {
              const {
                configsLastUpdated,
                configsLoading,
                configsError,
                linodeId,
                readOnly
              } = this.props;
              return (
                <React.Fragment>
                  <Table
                    isResponsive={false}
                    aria-label="List of Configurations"
                    border
                  >
                    <TableHead>
                      <TableRow>
                        <TableSortCell
                          active={orderBy === 'label'}
                          label={'label'}
                          direction={order}
                          handleClick={handleOrderChange}
                          data-qa-config-label-header
                        >
                          <strong>Label</strong>
                        </TableSortCell>
                        <TableSortCell
                          active={orderBy === 'virt_mode'}
                          label={'virt_mode'}
                          direction={order}
                          handleClick={handleOrderChange}
                          data-qa-virt-mode-header
                        >
                          <strong>VM Mode</strong>
                        </TableSortCell>
                        <TableCell className={classes.tableCell}>
                          Kernel
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                          Memory Limit
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                          Root Device
                        </TableCell>
                        <TableCell />
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
                        error={configsError}
                      >
                        {paginatedData.map(thisConfig => {
                          const kernel = this.state.kernels.find(
                            kernelName => kernelName.id === thisConfig.kernel
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
  configs: Config[];
  getLinodeConfigs: () => void;
  linodeDisks: Disk[];
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
    linodeDisks: linode._disks
  })
);

interface StateProps {
  configsError?: APIError[];
  configsLoading: boolean;
  configsLastUpdated: number;
}

const mapStateToProps: MapState<StateProps, LinodeContext> = (
  state,
  ownProps
) => {
  const configState = state.__resources.linodeConfigs[ownProps.linodeId];
  return {
    configsLastUpdated: configState?.lastUpdated ?? 0,
    configsLoading: configState?.loading ?? false,
    configsError: configState?.error.read ?? undefined
  };
};

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, {}>(
  linodeContext,
  connected,
  styled,
  errorBoundary,
  withSnackbar
);

export default enhanced(LinodeConfigs);
