import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Hidden from 'src/components/core/Hidden';
import Typography from 'src/components/core/Typography';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import PaginationFooter from 'src/components/PaginationFooter';
import Toggle from 'src/components/Toggle';
import { LinodeGettingStarted, SecuringYourServer } from 'src/documentation';
import LinodeConfigSelectionDrawer, { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { getImages } from 'src/services/images';
import { views } from 'src/utilities/storage';
import styled, { StyleProps } from './LinodesLanding.styles';
import LinodesViewWrapper from './LinodesViewWrapper';
import ListLinodesEmptyState from './ListLinodesEmptyState';
import { powerOffLinode, rebootLinode } from './powerActions';
import ToggleBox from './ToggleBox';
import withPaginatedLinodes, { PaginatedLinodes } from './withPaginatedLinodes';

interface ConfigDrawerState {
  open: boolean;
  configs: Linode.Config[];
  error?: string;
  selected?: number;
  action?: LinodeConfigSelectionDrawerCallback;
}

interface State {
  configDrawer: ConfigDrawerState;
  powerAlertOpen: boolean;
  bootOption: Linode.BootAction;
  selectedLinodeId: number | null;
  selectedLinodeLabel: string;
  images: {
    loading: boolean;
    data: Linode.Image[];
    error?: Error;
  },
  groupByTag: boolean;
}

type CombinedProps =
  & PaginatedLinodes
  & StateProps
  & RouteComponentProps<{}>
  & StyleProps
  & SetDocsProps
  & InjectedNotistackProps;

export class ListLinodes extends React.Component<CombinedProps, State> {
  mounted: boolean = false;

  state: State = {
    configDrawer: {
      open: false,
      configs: [],
      error: undefined,
      selected: undefined,
      action: (id: number) => null,
    },
    images: {
      loading: true,
      data: [],
    },
    powerAlertOpen: false,
    bootOption: null,
    selectedLinodeId: null,
    selectedLinodeLabel: '',
    groupByTag: false,
  };

  static docs = [
    LinodeGettingStarted,
    SecuringYourServer,
  ];

  getImages = () => {
    if (this.state.images.loading === false) {
      this.setState({ images: { ...this.state.images, loading: true } });
    }

    getImages()
      .then(response => this.setState({
        images: {
          ...this.state.images,
          loading: false,
          data: response.data,
        }
      }))
      .catch(response => this.setState({
        images: {
          ...this.state.images,
          loading: false,
          error: new Error('Unable to load image data.'),
        }
      }))
  }

  componentDidMount() {

    this.mounted = true;

    this.getImages();
  }

  componentWillUnmount() {
    this.mounted = false
  }

  openConfigDrawer = (configs: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => {
    this.setState({
      configDrawer: {
        open: true,
        configs,
        selected: configs[0].id,
        action,
      },
    });
  }

  closeConfigDrawer = () => {
    this.setState({
      configDrawer: {
        open: false,
        configs: [],
        error: undefined,
        selected: undefined,
        action: (id: number) => null,
      },
    });
  }

  changeViewStyle = (style: 'grid' | 'list') => {
    const { history } = this.props;
    history.push(`#${style}`);
    if (style === 'grid') {
      views.linode.set('grid');
    } else {
      views.linode.set('list');
    }
  }

  selectConfig = (id: number) => {
    this.setState(prevState => ({
      configDrawer: {
        ...prevState.configDrawer,
        selected: id,
      },
    }));
  }

  submitConfigChoice = () => {
    const { action, selected } = this.state.configDrawer;
    if (selected && action) {
      action(selected);
      this.closeConfigDrawer();
    }
  }

  toggleDialog = (
    bootOption: Linode.BootAction,
    selectedLinodeId: number,
    selectedLinodeLabel: string,
  ) => {
    this.setState({
      powerAlertOpen: !this.state.powerAlertOpen,
      selectedLinodeId,
      selectedLinodeLabel,
      bootOption,
    });
  }

  rebootOrPowerLinode = () => {
    const { bootOption, selectedLinodeId, selectedLinodeLabel } = this.state;
    if (bootOption === 'reboot') {
      rebootLinode(
        this.openConfigDrawer,
        selectedLinodeId!,
        selectedLinodeLabel,
        this.props.enqueueSnackbar,
      );
    } else {
      powerOffLinode(selectedLinodeId!, selectedLinodeLabel);
    }
    this.setState({ powerAlertOpen: false });
  }

  renderContent = (linodes: Linode.Linode[], images: Linode.Image[], view: 'grid' | 'list') => {
    return (
      <LinodesViewWrapper
        view={view}
        linodes={linodes}
        images={images}
        openConfigDrawer={this.openConfigDrawer}
        toggleConfirmation={this.toggleDialog}
        order={this.props.order}
        orderBy={this.props.orderBy}
        handleOrderChange={this.props.handleOrderChange}
      />
    )
  }

  render() {
    const {
      location: { hash },
      linodesCount,
      linodesData: linodes,
      linodesRequestError,
      linodesRequestLoading,
    } = this.props;

    const {
      configDrawer,
      bootOption,
      powerAlertOpen,
      images: {
        error: imagesError,
        loading: imagesLoading,
        data: imagesData,
      },
    } = this.state;

    if (linodesRequestLoading || imagesLoading) {
      return <CircleProgress />;
    }

    if (linodes.length === 0) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment="Linodes" />
          <ListLinodesEmptyState />
        </React.Fragment>
      );
    }

    if (linodesRequestError) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment="Linodes" />
          <ErrorState errorText="Error loading data" />
        </React.Fragment>
      );
    }

    if (imagesError) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment="Linodes" />
          <ErrorState errorText="Error loading data" />
        </React.Fragment>
      );
    }

    const displayGrid: 'grid' | 'list' = getDisplayFormat({ hash, length: linodesCount });

    return (
      <Grid container>
        <DocumentTitleSegment segment="Linodes" />
        <Grid item xs={12}>
          <Typography
            role="header"
            variant="h1"
            className={this.props.classes.title}
            data-qa-title
          >
            Linodes
          </Typography>
          <Hidden smDown>
            <div>
              <FormControlLabel
                className="toggleLabel"
                control={
                  <Toggle
                    value={this.state.groupByTag}
                    onClick={(e: React.MouseEvent<any>) => this.setState({ groupByTag: !this.state.groupByTag })}
                  />
                }
                label="Group by Tag:"
              />
            </div>
            <ToggleBox
              handleClick={this.changeViewStyle}
              status={displayGrid}
            />
          </Hidden>
        </Grid>
        <Grid item xs={12}>
          <Hidden mdUp>
            {this.renderContent(linodes, imagesData, 'grid')}
          </Hidden>
          <Hidden smDown>
            {displayGrid === 'grid'
              ? this.renderContent(linodes, imagesData, 'grid')
              : this.renderContent(linodes, imagesData, 'list')
            }
          </Hidden>
        </Grid>
        <Grid item xs={12}>
          {
            <PaginationFooter
              count={this.props.linodesCount}
              handlePageChange={this.props.handlePageChange}
              handleSizeChange={this.props.handlePageSizeChange}
              pageSize={this.props.pageSize}
              page={this.props.page}
            />
          }
          <LinodeConfigSelectionDrawer
            onClose={this.closeConfigDrawer}
            onSubmit={this.submitConfigChoice}
            onChange={this.selectConfig}
            open={configDrawer.open}
            configs={configDrawer.configs}
            selected={String(configDrawer.selected)}
            error={configDrawer.error}
          />
        </Grid>
        <ConfirmationDialog
          title={(bootOption === 'reboot') ? 'Confirm Reboot' : 'Powering Off'}
          actions={this.renderConfirmationActions}
          open={powerAlertOpen}
          onClose={this.closePowerAlert}
        >
          <Typography>
            {bootOption === 'reboot'
              ? 'Are you sure you want to reboot your Linode?'
              : 'Are you sure you want to power down your Linode?'
            }
          </Typography>
        </ConfirmationDialog>
      </Grid>
    );
  }

  renderConfirmationActions = () => {
    const { bootOption } = this.state;
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button
          type="cancel"
          onClick={this.closePowerAlert}
          data-qa-cancel-cancel
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={this.rebootOrPowerLinode}
          data-qa-confirm-cancel
        >
          {bootOption === 'reboot' ? 'Reboot' : 'Power Off'}
        </Button>
      </ActionsPanel>
    );
  };

  closePowerAlert = () => this.setState({ powerAlertOpen: false });
}

const getDisplayFormat = ({ hash, length }: { hash?: string, length: number }): 'grid' | 'list' => {

  if (hash) {
    return hash === '#grid' ? 'grid' : 'list';
  }

  /*
  * If local storage exists, set the view based on that
  */
  if (views.linode.get() !== null) {
    return views.linode.get();
  }

  return (length >= 3) ? 'list' : 'grid';
};

interface StateProps {
  managed: boolean;
}

/**
 * 'linodes' are provided by pagination and 'notifications' are provided by redux. We're using MSTP
 * to join the Notifications to the appropriate Linode and provide that to the component.
 */
const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state, ownProps) => {
  return {
    managed: pathOr(false, ['__resources', 'accountSettings', 'data', 'managed'], state)
  }
};

const connected = connect(mapStateToProps);

export const enhanced = compose(
  withRouter,
  styled,
  setDocs(ListLinodes.docs),
  withPaginatedLinodes,
  withSnackbar,
  connected,
);

export default enhanced(ListLinodes);
