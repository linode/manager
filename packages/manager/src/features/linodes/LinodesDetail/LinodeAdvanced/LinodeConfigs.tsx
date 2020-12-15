import { Config, linodeReboot } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
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
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import PaginationFooter from 'src/components/PaginationFooter';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import Table from 'src/components/Table';
import TableContentWrapper from 'src/components/TableContentWrapper';
import { resetEventsPolling } from 'src/eventsPolling';
import {
  DeleteLinodeConfig,
  withLinodeDetailContext
} from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import { MapState } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import LinodeConfigDrawer from '../LinodeSettings/LinodeConfigDrawer';
import ConfigRow from './ConfigRow';

import Paginate from 'src/components/Paginate';

type ClassNames = 'root' | 'headline' | 'addNewWrapper';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    headline: {
      marginBottom: theme.spacing(2),
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
      },
      paddingRight: 5
    }
  });

type CombinedProps = LinodeContext &
  WithStyles<ClassNames> &
  WithSnackbarProps &
  StateProps;

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
  error?: string;
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

  configsPanel = React.createRef();

  render() {
    const { classes, readOnly } = this.props;

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end">
          <RootRef rootRef={this.configsPanel}>
            <Grid item>
              <Typography variant="h3" className={classes.headline}>
                Configuration
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
        buttonType="primary"
        destructive
        loading={this.state.confirmDelete.submitting}
        onClick={this.deleteConfig}
        data-qa-confirm-delete
      >
        Delete
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

  handleBoot = (linodeId: number, configId: number, label: string) => {
    linodeReboot(linodeId, configId)
      .then(() => {
        resetEventsPolling();
      })
      .catch(errorResponse => {
        const errors = getAPIErrorOrDefault(
          errorResponse,
          `Error booting ${label}`
        );
        errors.forEach((error: APIError) => {
          this.props.enqueueSnackbar(error.reason, {
            variant: 'error'
          });
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
    return (
      <Paginate data={this.props.configs} scrollToRef={this.configsPanel}>
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
                    <TableCell>Label</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableContentWrapper
                    loading={configsLoading && configsLastUpdated === 0}
                    lastUpdated={configsLastUpdated}
                    length={paginatedData.length}
                    error={configsError}
                  >
                    {paginatedData.map(thisConfig => {
                      return (
                        <ConfigRow
                          key={`config-row-${thisConfig.id}`}
                          config={thisConfig}
                          linodeId={linodeId}
                          onBoot={this.handleBoot}
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
    getLinodeConfigs
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
