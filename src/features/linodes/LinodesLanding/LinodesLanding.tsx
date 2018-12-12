import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { parse, stringify } from 'qs';
import { omit, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose, withStateHandlers } from 'recompose';
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
import Toggle from 'src/components/Toggle';
import { LinodeGettingStarted, SecuringYourServer } from 'src/documentation';
import LinodeConfigSelectionDrawer, { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { getImages } from 'src/services/images';
import { views } from 'src/utilities/storage';
import DisplayGroupedLinodes from './DisplayGroupedLinodes';
import DisplayLinodes from './DisplayLinodes';
import styled, { StyleProps } from './LinodesLanding.styles';
import { powerOffLinode, rebootLinode } from './powerActions';
import ToggleBox from './ToggleBox';

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

interface Params {
  view?: string;
  groupByTag?: string;
}

type RouteProps = RouteComponentProps<Params>

type CombinedProps =
  & ToggleGroupByTagsProps
  & StateProps
  & RouteProps
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

  changeView = (style: 'grid' | 'list') => {
    const { history, location } = this.props;

    const updatedParams = updateParams<Params>(location.search, (params) => ({ ...params, view: style }));

    history.push(`?${updatedParams}`);

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



  render() {
    const { linodesRequestError, linodesRequestLoading } = this.props;

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

    if (imagesError || linodesRequestError) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment="Linodes" />
          <ErrorState errorText="Error loading data" />
        </React.Fragment>
      );
    }

    const params: Params = parse(this.props.location.search, { ignoreQueryPrefix: true });

    const usersDisplayChoice = getDisplayFormat(params.view);

    const view = usersDisplayChoice
      ? usersDisplayChoice
      : this.props.linodesCount >= 3
        ? 'list'
        : 'grid'

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
                    onChange={this.props.toggleGroupByTag}
                    checked={this.props.groupByTags} />
                }
                label="Group by Tag:"
              />
            </div>
            <ToggleBox handleClick={this.changeView} status={view} />
          </Hidden>
        </Grid>
        <Grid item xs={12}>
          <RenderContent
            view={usersDisplayChoice}
            images={imagesData}
            group={this.props.groupByTags}
            openConfigDrawer={this.openConfigDrawer}
            toggleConfirmation={this.toggleDialog}
          />
        </Grid>
        <LinodeConfigSelectionDrawer
          onClose={this.closeConfigDrawer}
          onSubmit={this.submitConfigChoice}
          onChange={this.selectConfig}
          open={configDrawer.open}
          configs={configDrawer.configs}
          selected={String(configDrawer.selected)}
          error={configDrawer.error}
        />
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

const getDisplayFormat = (value?: string): undefined | 'grid' | 'list' => {
  /** Value comes from the URL */
  if (value) {
    return value === 'grid' ? 'grid' : 'list';
  }

  /* If local storage exists, set the view based on that */
  const localStorageValue = views.linode.get();
  if (localStorageValue !== null) {
    return localStorageValue;
  }

  return;
};

interface StateProps {
  managed: boolean;
  linodesCount: number;
  linodesRequestLoading: boolean;
  linodesRequestError?: Linode.ApiFieldError[];
}

/**
 * 'linodes' are provided by pagination and 'notifications' are provided by redux. We're using MSTP
 * to join the Notifications to the appropriate Linode and provide that to the component.
 */
const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state, ownProps) => {
  return {
    managed: pathOr(false, ['__resources', 'accountSettings', 'data', 'managed'], state),
    linodesCount: state.__resources.linodes.results.length,
    linodesRequestLoading: state.__resources.linodes.loading,
    linodesRequestError: state.__resources.linodes.error,
  }
};

interface ToggleGroupByTagsProps {
  groupByTags: boolean;
  toggleGroupByTag: (e: React.ChangeEvent<any>, checked: boolean) => void;
}

const connected = connect(mapStateToProps);

export const enhanced = compose(
  withRouter,

  withStateHandlers(
    (ownProps: RouteProps) => {
      const { location } = ownProps;
      const params: Params = parse(location.search, { ignoreQueryPrefix: true })

      return { groupByTags: params.groupByTag }
    },
    {
      toggleGroupByTag: (state, ownProps) => (e, checked) => {
        const { history, location } = ownProps;

        const updatedParams = updateParams<Params>(location.search, (params) => {
          return params.groupByTag ? omit(['groupByTag'], params) : { ...params, groupByTag: 'true' }
        });

        history.push(`?${updatedParams}`);

        return { ...state, groupByTags: checked };
      },
    },
  ),

  styled,
  setDocs(ListLinodes.docs),
  withSnackbar,
  connected,
);

export default enhanced(ListLinodes);

const updateParams = <T extends any>(params: string, updater: (s: T) => T) => {
  const paramsAsObject: T = parse(params, { ignoreQueryPrefix: true });
  return stringify(updater(paramsAsObject));
};

const RenderContent: React.StatelessComponent<{
  images: any;
  group: boolean;
  view: undefined | 'grid' | 'list';
  openConfigDrawer: (configs: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction, selectedLinodeId: number, selectedLinodeLabel: string) => void;
}> = (props) => {
  const { group } = props;

  if (group) {
    return <DisplayGroupedLinodes {...props} />
  }

  return <DisplayLinodes {...props} />
}
