import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import { append, filter, lensPath, over, path, set, view, when } from 'ramda';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import 'rxjs/add/operator/filter';
import { Subscription } from 'rxjs/Subscription';
import { debounce } from 'throttle-debounce';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import Select from 'src/components/Select';
import TextField from 'src/components/TextField';
import { withRegions } from 'src/context/regions';
import { events$, resetEventsPolling } from 'src/events';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import { updateVolumes$ } from 'src/features/Volumes/VolumesLanding';
import { getLinodeConfigs, getLinodes } from 'src/services/linodes';
import { cloneVolume, createVolume, resizeVolume, updateVolume, VolumeRequestPayload } from 'src/services/volumes';
import { close } from 'src/store/reducers/volumeDrawer';
import { formatRegion } from 'src/utilities';
import composeState from 'src/utilities/composeState';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root'
  | 'actionPanel';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  actionPanel: {
    marginTop: theme.spacing.unit * 2,
  },
});

export interface Props {
  cloneLabel?: string;
}

interface RegionsContextProps {
  regionsData?: Linode.Region[];
}

interface ActionCreatorProps {
  handleClose: typeof close;
}

interface ActionMeta {
  action: string;
}

interface ReduxProps {
  mode: string;
  volumeID: number;
  label: string;
  size: number;
  region: string;
  linodeLabel: string;
  linodeId: number;
}

interface State {
  cloneLabel?: string;
  label: string;
  size: number;
  region: string;
  linodes: Item[];
  linodesLoading: boolean;
  linodeId: number;
  configs: string[][];
  selectedConfig?: string;
  errors?: Linode.ApiFieldError[];
  submitting: boolean;
  success?: string;
}

type CombinedProps =
  Props &
  ReduxProps &
  RegionsContextProps &
  ActionCreatorProps &
  WithStyles<ClassNames>;

export const modes = {
  CLOSED: 'closed',
  CREATING: 'creating',
  RESIZING: 'resizing',
  CLONING: 'cloning',
  EDITING: 'editing',
};

const titleMap = {
  [modes.CLOSED]: '',
  [modes.CREATING]: 'Create a Volume',
  [modes.RESIZING]: 'Resize a Volume',
  [modes.CLONING]: 'Clone a Volume',
  [modes.EDITING]: 'Rename a Volume',
};

const L = {
  cloneLabel: lensPath(['cloneLabel']),
  configs: lensPath(['configs']),
  errors: lensPath(['errors']),
  label: lensPath(['label']),
  linodeId: lensPath(['linodeId']),
  linodes: lensPath(['linodes']),
  region: lensPath(['region']),
  selectedConfig: lensPath(['selectedConfig']),
  size: lensPath(['size']),
  submitting: lensPath(['submitting']),
  success: lensPath(['success']),
};

class VolumeDrawer extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  eventsSub: Subscription;

  state: State = {
    submitting: false,
    cloneLabel: this.props.cloneLabel,
    label: this.props.label,
    size: this.props.size,
    region: this.props.region,
    linodes: [],
    linodesLoading: false,
    linodeId: this.props.linodeId,
    configs: [],
  };

  handleAPIErrorResponse = (errorResponse: any) => this.composeState([
    set(L.errors, path(['response', 'data', 'errors'], errorResponse)),
    set(L.submitting, false)
  ], () => scrollErrorIntoView());

  composeState = composeState;

  componentDidMount() {
    this.mounted = true;
    this.eventsSub = events$
      .filter(event => (
        !event._initial
        && [
          'volume_detach',
          'volume_create',
          'volume_delete',
        ].includes(event.action)
      ))
      .subscribe((event) => {
        if (event.action === 'volume_detach' && event.status === 'finished') {
          sendToast(`Volume ${event.entity && event.entity.label} finished detaching`);
        }
        /**
         * If a volume is created, but not attached, the event is volume_create with a status of notification.
         * If a volume is created and attached, the event is volume_create with status of scheduled, started, failed, finished.
         */
        if (event.action === 'volume_create' && event.status === 'scheduled') {
          sendToast(`Volume ${event.entity && event.entity.label} scheduled for creation.`);
        }

        if (event.action === 'volume_create' && (event.status === 'notification' || event.status === 'finished')) {
          sendToast(`Volume ${event.entity && event.entity.label} has been created successfully.`);
        }

        if (event.action === 'volume_delete' && event.status === 'notification') {
          sendToast(`Volume ${event.entity && event.entity.label} has been deleted.`);
        }
      });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps: CombinedProps) {
    this.composeState([
      set(L.cloneLabel, nextProps.cloneLabel || ''),
      set(L.label, nextProps.label),
      set(L.size, nextProps.size),
      set(L.region, nextProps.region),
      set(L.linodeId, nextProps.linodeId),
      set(L.errors, undefined),
    ]);

    /* If the drawer is opening */
    if ((this.props.mode === modes.CLOSED) && !(nextProps.mode === modes.CLOSED)) {
      /* re-request the list of Linodes */
      this.searchLinodes();
    }
  }

  updateConfigs(linodeID: number) {
    getLinodeConfigs(linodeID)
      .then((response) => {
        const configChoices = response.data.map((config) => {
          return [`${config.id}`, config.label];
        });
        this.setState({ configs: configChoices });
        if (configChoices.length > 1) {
          this.setState({
            selectedConfig: configChoices[0][0],
          });
        }
      })
      .catch(() => {
        /*
         * @note: If we can't get configs for the Linode, then the user can
         * still create the volume, so we probably shouldn't show any error
         * state if this fails.
         */
      });
  }

  reset = () => this.composeState([
    set(L.cloneLabel, ''),
    set(L.errors, undefined),
    set(L.label, ''),
    set(L.linodeId, 0),
    set(L.region, 'none'),
    set(L.submitting, false),
    set(L.success, undefined),
    set(L.configs, []),
    set(L.selectedConfig, undefined),
  ]);

  onClose = () => {
    this.reset();
    this.props.handleClose();
  }

  onSubmit = () => {
    const { mode, volumeID, handleClose } = this.props;
    const { cloneLabel, label, size, region, linodeId } = this.state;

    switch (mode) {
      case modes.CREATING:

        this.composeState([
          set(L.submitting, true),
          set(L.errors, undefined),
        ]);

        const payload: VolumeRequestPayload = {
          label,
          size,
          region: region === 'none' ? undefined : region,
          linode_id: linodeId === 0 ? undefined : linodeId,
        };

        createVolume(payload)
          .then(() => {
            resetEventsPolling();
            this.composeState([
              set(L.success, 'Volume has been scheduled for creation.'),
              set(L.submitting, false),
            ])

            setTimeout(() => {
              this.composeState([
                set(L.success, undefined),
              ], handleClose)
            }, 4000);;
          })
          .catch(this.handleAPIErrorResponse);
        return;
      case modes.EDITING:
        if (!volumeID) {
          return;
        }

        if (!label) {
          this.composeState([
            set(L.errors, [{ field: 'label', reason: 'Label cannot be blank.' }])
          ], () => scrollErrorIntoView());

          return;
        }

        updateVolume(volumeID, label)
          .then(() => {
            updateVolumes$.next(true);
            handleClose();
          })
          .catch(this.handleAPIErrorResponse);
        return;
      case modes.RESIZING:
        if (!volumeID) {
          return;
        }

        if (!label) {
          if (this.mounted) {
            this.setState({
              errors: [{ field: 'size', reason: 'Size cannot be blank.' }],
            }, () => {
              scrollErrorIntoView();
            });
          }
          return;
        }

        resizeVolume(volumeID, Number(size))
          .then(() => {
            resetEventsPolling();
            handleClose();
          })
          .catch(this.handleAPIErrorResponse);
        return;
      case modes.CLONING:
        if (!volumeID) {
          return;
        }

        if (!cloneLabel) {
          if (this.mounted) {
            this.setState({
              errors: [{ field: 'label', reason: 'Label cannot be blank.' }],
            }, () => {
              scrollErrorIntoView();
            });
          }
          return;
        }

        cloneVolume(volumeID, cloneLabel)
          .then(() => {
            resetEventsPolling();
            handleClose();
          })
          .catch(this.handleAPIErrorResponse);
        return;
      default:
        return;
    }
  }

  setCloneLabel = (e: any) => {
    if (this.mounted) { this.setState({ cloneLabel: (e.target.value) }); }
  }

  setLabel = (e: any) => {
    if (this.mounted) { this.setState({ label: (e.target.value) }); }
  }

  setSelectedConfig = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ selectedConfig: e.target.value });
  }

  setSelectedLinode = (selected:Item) => {
    if (!this.mounted) { return; }
    if (selected) {
      this.setState({
        linodeId: Number(selected.value),
      });
    }
    else {
      this.setState({
        linodeId: 0,
      })
    }
  }

  setSelectedRegion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (this.mounted) {
      this.setState({
        region: (e.target.value),
        linodeId: 0,
        configs: [],
      }, this.searchLinodes);
    }
  }

  setSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([
      when<State, State>(
        (prevState) => prevState.size <= 10240 && Boolean(prevState.errors),
        over(L.errors, filter((event: Linode.ApiFieldError) => event.field !== 'size')),
      ),

      // (prevState: State) => {
      //   const { size, errors } = prevState;
      //   if (size <= 10240 && errors) {
      //     return {
      //       ...prevState,
      //       errors: errors.filter(e => e.field !== 'size'),
      //     };
      //   }

      //   return prevState;
      // }

      when<State, State>(
        (prevState) => prevState.size > 10240,
        over(L.errors, append({ field: 'size', reason: 'Size cannot be over 10240.' })),
      ),

      // (prevState: State) => {
      //   const { size, errors } = prevState;
      //   if (size > 10240) {
      //     return {
      //       ...prevState,
      //       errors: (errors || []).push({ field: 'size', reason: 'Size cannot be over 10240.' }),
      //     };
      //   }

      //   return prevState;
      // }

      set(L.size, +e.target.value || ''),
    ]);
  }

  getLinodeFilter = (inputValue:string) => {
    const { region } = this.state;
    if (region && region !== 'none') {
      return {
        label: {
          '+contains': inputValue,
        },
        region
      }
    } else {
      return {
        label: {
          '+contains': inputValue,
        }
      }
    }
  }

  searchLinodes = (inputValue: string = '') => {
    if (!this.mounted) { return; }
    this.setState({ linodesLoading: true });
    const filterLinodes = this.getLinodeFilter(inputValue);
    getLinodes({}, filterLinodes)
      .then((response) => {
        if (!this.mounted) { return; }
        const linodes = this.renderLinodeOptions(response.data);
        this.setState({ linodes, linodesLoading: false });
      })
      .catch(() => {
        if (!this.mounted) { return; }
        this.setState({ linodesLoading: false });
      })
  }

  debouncedSearch = debounce(400, false, this.searchLinodes);

  onInputChange = (inputValue: string, actionMeta: ActionMeta) => {
    if (!this.mounted) { return; }
    if (actionMeta.action !== 'input-change') { return; }
    this.setState({ linodesLoading: true });
    this.debouncedSearch(inputValue);
  }

  getSelectedLinode = (linodeId: number) => {
    const { linodes } = this.state;
    const idx = linodes.findIndex((linode) => Number(linodeId) === Number(linode.value));
    return idx > -1 ? linodes[idx] : 0;
  }

  renderLinodeOptions = (linodes: Linode.Linode[]) => {
    const { linodeLabel, mode } = this.props;
    if (!linodes) { return []; }
    const options: Item[] = linodes.map((linode: Linode.Linode) => {
        return {
          value: linode.id,
          label: linode.label,
          data: { region: linode.region }
        }
      });
    if (mode === modes.EDITING || mode === modes.RESIZING) {
      /*
      * We optimize the lookup of the linodeLabel by providing it
      * explicitly when editing or resizing
      */
      return [{ value: 'none', label: linodeLabel, data: { region: 'none'} }];
    }
    return options;
  }

  render() {
    const { mode } = this.props;
    const regions = this.props.regionsData;

    const {
      cloneLabel,
      label,
      size,
      region,
      configs,
      selectedConfig,
      errors,
      linodes,
      linodesLoading,
      linodeId,
    } = this.state;

    const hasErrorFor = getAPIErrorFor({
      linode_id: 'Linode',
      config_id: 'Config',
      region: 'Region',
      size: 'Size',
      label: 'Label',
    }, errors);
    const success = view<State, string>(L.success, this.state);
    const submitting = view<State, boolean>(L.submitting, this.state);
    const labelError = hasErrorFor('label');
    const sizeError = hasErrorFor('size');
    const regionError = hasErrorFor('region');
    const linodeError = hasErrorFor('linode_id');
    const configError = hasErrorFor('config_id');
    const generalError = hasErrorFor('none');

    return (
      <Drawer
        open={mode !== modes.CLOSED}
        onClose={this.onClose}
        title={titleMap[mode]}
      >
        {success &&
          <Notice
            success
            text={success}
          />
        }

        {generalError &&
          <Notice
            error
            text={generalError}
            data-qa-notice
          />
        }

        {mode === modes.CLONING &&
          <TextField
            label="Cloned Label"
            value={cloneLabel}
            onChange={this.setCloneLabel}
            error={Boolean(labelError)}
            errorText={labelError}
            data-qa-clone-from
          />
        }

        <TextField
          label="Label"
          required
          value={label}
          onChange={this.setLabel}
          error={Boolean(labelError)}
          errorText={labelError}
          disabled={mode === modes.RESIZING || mode === modes.CLONING}
          data-qa-volume-label
        />

        <TextField
          label="Size"
          required
          value={size}
          onChange={this.setSize}
          error={Boolean(sizeError)}
          errorText={sizeError}
          disabled={mode === modes.CLONING || mode === modes.EDITING}
          helperText={'Maximum: 10240 GB'}
          InputProps={{
            endAdornment:
              <InputAdornment position="end">
                GB
              </InputAdornment>,
          }}
          data-qa-size
        />

        <FormControl fullWidth>
          <InputLabel
            htmlFor="region"
            disableAnimation
            shrink={true}
            error={Boolean(regionError)}
          >
            Region
          </InputLabel>
          <Select
            value={region}
            disabled={
              mode === modes.CLONING
              || mode === modes.EDITING
              || mode === modes.RESIZING
            }
            onChange={this.setSelectedRegion}
            inputProps={{ name: 'region', id: 'region' }}
            error={Boolean(regionError)}
            data-qa-select-region
          >
            <MenuItem key="none" value="none">Select a Region</MenuItem>,
            {regions && regions.map(eachRegion =>
              <MenuItem
                key={eachRegion.id}
                value={eachRegion.id}
                data-qa-attach-to-region={eachRegion.id}
              >
                {formatRegion('' + eachRegion.id)}
              </MenuItem>,
            )}
          </Select>
          {regionError &&
            <FormHelperText error={Boolean(regionError)}>
              {regionError}
            </FormHelperText>
          }
        </FormControl>

        {mode !== modes.CLONING &&
          <FormControl fullWidth>
            <EnhancedSelect
              label="Linode"
              placeholder="Select a Linode"
              value={this.getSelectedLinode(linodeId)}
              isLoading={linodesLoading}
              errorText={linodeError}
              disabled={
                mode === modes.EDITING
                || mode === modes.RESIZING
              }
              options={linodes}
              onChange={this.setSelectedLinode}
              onInputChange={this.onInputChange}
              data-qa-select-linode
            />
            {region !== 'none' && mode !== modes.RESIZING &&
              <FormHelperText>
                Only Linodes in the selected region are displayed.
              </FormHelperText>
            }
          </FormControl>
        }

        {configs.length > 1 &&
          <FormControl fullWidth>
            <InputLabel
              htmlFor="config"
              disableAnimation
              shrink={true}
              error={Boolean(configError)}
            >
              Config
            </InputLabel>
            <Select
              value={selectedConfig || ''}
              onChange={this.setSelectedConfig}
              inputProps={{ name: 'config', id: 'config' }}
              error={Boolean(configError)}
            >
              {
                configs && configs.map((el) => {
                  return <MenuItem key={el[0]} value={el[0]}>{el[1]}</MenuItem>;
                })
              }
            </Select>
            {Boolean(configError) && <FormHelperText error>{configError}</FormHelperText>}
          </FormControl>
        }

        <ActionsPanel style={{ marginTop: 16 }}>
          <Button
            onClick={this.onSubmit}
            type="primary"
            loading={submitting}
            data-qa-submit
          >
            Submit
          </Button>
          <Button
            onClick={this.onClose}
            type="cancel"
            data-qa-cancel
          >
            Cancel
          </Button>
        </ActionsPanel>
      </Drawer>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  {
    handleClose: () => close()
  },
  dispatch,
);

const mapStateToProps = (state: ApplicationState) => ({
  mode: path(['volumeDrawer', 'mode'], state),
  volumeID: path(['volumeDrawer', 'volumeID'], state),
  label: path(['volumeDrawer', 'label'], state),
  size: path(['volumeDrawer', 'size'], state),
  region: path(['volumeDrawer', 'region'], state),
  linodeLabel: path(['volumeDrawer', 'linodeLabel'], state),
  linodeId: path(['volumeDrawer', 'linodeId'], state),
});

const regionsContext = withRegions(({ data }) => ({
  regionsData: data,
}))

const connected = connect(mapStateToProps, mapDispatchToProps);

const styled = withStyles(styles, { withTheme: true });

export default compose<any, any, any, any, any>(
  connected,
  regionsContext,
  styled,
  SectionErrorBoundary,
)(VolumeDrawer);
