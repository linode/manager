import * as React from 'react';

import * as Rx from 'rxjs/Rx';

import { path } from 'ramda';

import { bindActionCreators, compose } from 'redux';

import { connect, Dispatch } from 'react-redux';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import { close } from 'src/store/reducers/volumeDrawer';

import { clone, create, resize, update, VolumeRequestPayload } from 'src/services/volumes';

import { dcDisplayNames } from 'src/constants';
import { events$, resetEventsPolling } from 'src/events';
import { getLinodeConfigs, getLinodes } from 'src/services/linodes';

import { sendToast } from 'src/features/ToastNotifications/toasts';
import { updateVolumes$ } from 'src/features/Volumes/Volumes';

import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import ActionsPanel from 'src/components/ActionsPanel';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import Select from 'src/components/Select';
import TextField from 'src/components/TextField';

type ClassNames = 'root'
|  'suffix'
|  'actionPanel';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  suffix: {
    fontSize: '.9rem',
    marginRight: theme.spacing.unit,
  },
  actionPanel: {
    marginTop: theme.spacing.unit * 2,
  },
});

export interface Props {
  regions: Linode.Volume[];
  linodes: PromiseLoaderResponse<Linode.ResourcePage<Linode.Linode>>;
  cloneLabel?: string;
}

interface ActionCreatorProps {
  close: typeof close;
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
  linodes: Linode.Linode[];
  linodeId: number;
  configs: string[][];
  selectedConfig?: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & ReduxProps & ActionCreatorProps & WithStyles<ClassNames>;

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

class VolumeDrawer extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  eventsSub: Rx.Subscription;

  state: State = {
    cloneLabel: this.props.cloneLabel,
    label: this.props.label,
    size: this.props.size,
    region: this.props.region,
    linodes: path(['response', 'data'], this.props.linodes) || [],
    linodeId: this.props.linodeId,
    configs: [],
  };

  componentDidMount() {
    this.mounted = true;

    this.eventsSub = events$
      .filter(event => (
        !event._initial
        && [
          'volume_detach',
        ].includes(event.action)
      ))
      .subscribe((event) => {
        if (event.action === 'volume_detach'
            && event.status === 'finished') {
          sendToast(`Volume ${event.entity && event.entity.label} finished detaching`);
        }
      });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps: CombinedProps) {
    if (this.mounted) {
      this.setState({
        cloneLabel: nextProps.cloneLabel || '',
        label: nextProps.label,
        size: nextProps.size,
        region: nextProps.region,
        linodeId: nextProps.linodeId,
        errors: undefined,
      });
    }

    /* If the drawer is opening */
    if ((this.props.mode === modes.CLOSED) && !(nextProps.mode === modes.CLOSED)) {
      /* re-request the list of Linodes */
      getLinodes()
        .then((response) => {
          this.setState({ linodes: response.data });
        })
        .catch(() => {
          /* keep the existing list of Linodes in the case that this call fails */
        });
    }
  }

  updateConfigs(linodeID: number) {
    getLinodeConfigs(linodeID)
      .then((response) => {
        const configChoices = response.data.map((config) => {
          return [`${config.id}`, config.label];
        });
        this.setState({ configs: configChoices });
        configChoices.length > 1 && this.setState({
          selectedConfig: configChoices[0][0],
        });
      })
      .catch(() => {
        /*
         * @note: If we can't get configs for the Linode, then the user can
         * still create the volume, so we probably shouldn't show any error
         * state if this fails.
         */
      });
  }

  onClose = () => {
    this.props.close();
  }

  onSubmit = () => {
    const { mode, volumeID, close } = this.props;
    const { cloneLabel, label, size, region, linodeId } = this.state;

    switch (mode) {
      case modes.CREATING:
        const payload: VolumeRequestPayload = {
          label,
          size,
          region: region === 'none' ? undefined : region,
          linode_id: linodeId === 0 ? undefined : linodeId,
        };

        create(payload)
          .then(() => {
            resetEventsPolling();
            close();
          })
          .catch((errorResponse) => {
            if (this.mounted) {
              this.setState({
                errors: path(['response', 'data', 'errors'], errorResponse),
              }, () => {
                scrollErrorIntoView();
              });
            }
          });
        return;
      case modes.EDITING:
        if (!volumeID) {
          return;
        }

        if (!label) {
          if (this.mounted) {
            this.setState({
              errors: [{ field: 'label', reason: 'Label cannot be blank.' }],
            }, () => {
              scrollErrorIntoView();
            });
          }
          return;
        }

        update(volumeID, label)
          .then(() => {
            updateVolumes$.next(true);
            close();
          })
          .catch((errorResponse) => {
            if (this.mounted) {
              this.setState({
                errors: path(['response', 'data', 'errors'], errorResponse),
              }, () => {
                scrollErrorIntoView();
              });
            }
          });
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

        resize(volumeID, Number(size))
          .then(() => {
            resetEventsPolling();
            close();
          })
          .catch((errorResponse) => {
            if (this.mounted) {
              this.setState({
                errors: path(['response', 'data', 'errors'], errorResponse),
              }, () => {
                scrollErrorIntoView();
              });
            }
          });
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

        clone(volumeID, cloneLabel)
          .then(() => {
            resetEventsPolling();
            close();
          })
          .catch((errorResponse) => {
            if (this.mounted) {
              this.setState({
                errors: path(['response', 'data', 'errors'], errorResponse),
              }, () => {
                scrollErrorIntoView();
              });
            }
          });
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

  setSelectedLinode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (this.mounted) { this.setState({ linodeId: +(e.target.value) }); }
    if (e.target.value) {
      this.updateConfigs(+e.target.value);
    }
  }

  setSelectedRegion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (this.mounted) {
      this.setState({
        region: (e.target.value),
        linodeId: 0,
        configs: [],
      });
    }
  }

  setSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (this.mounted) { this.setState({ size: +(e.target.value) || 0 }); }
  }

  render() {
    const { mode, classes } = this.props;
    const { linodes } = this.state;
    const regions = this.props.regions;
    const linodeLabel = this.props.linodeLabel || '';

    const {
      cloneLabel,
      label,
      size,
      region,
      linodeId,
      configs,
      selectedConfig,
      errors,
    } = this.state;

    const hasErrorFor = getAPIErrorFor({
      linode_id: 'Linode',
      config_id: 'Config',
      region: 'Region',
      size: 'Size',
      label: 'Label',
    }, errors);
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
          InputProps={{
            endAdornment: <span className={classes.suffix}>GB</span>,
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
            {regions && regions.map(region =>
              <MenuItem
                key={region.id}
                value={region.id}
                data-qa-attach-to-region={region.id}
              >
                {dcDisplayNames[region.id]}
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
            <InputLabel
              htmlFor="linode"
              disableAnimation
              shrink={true}
              error={Boolean(linodeError)}
            >
              Linode
            </InputLabel>
            <Select
              value={mode === modes.EDITING || mode === modes.RESIZING
                ? linodeLabel
                : `${linodeId}`}
              disabled={
                mode === modes.EDITING
                || mode === modes.RESIZING
              }
              onChange={this.setSelectedLinode}
              inputProps={{ name: 'linode', id: 'linode' }}
              error={Boolean(linodeError)}
              data-qa-select-linode
            >
              <MenuItem key="none" value="0">
                {mode !== modes.CLONING
                  ? 'Select a Linode'
                  : ''
                }
              </MenuItem>,
              {linodes && linodes
                .filter((linode) => {
                  return (
                    (region && region !== 'none')
                      /* if the user has selection a region above, limit linodes to that region */
                      ? linode.region === region
                      : true
                  );
                })
                .map(linode =>
                  <MenuItem
                    key={linode.id}
                    value={`${linode.id}`}
                    data-qa-attached-linode={linode.label}
                  >
                    {linode.label}
                  </MenuItem>,
              )}
              {(mode === modes.EDITING
                || mode === modes.RESIZING) &&
                /*
                * We optimize the lookup of the linodeLabel by providing it
                * explicitly when editing or resizing
                */
                <MenuItem key={linodeLabel} value={linodeLabel}>
                  {linodeLabel}
                </MenuItem>
              }
            </Select>
            {linodeError &&
              <FormHelperText error={Boolean(linodeError)}>
                {linodeError}
              </FormHelperText>
            }
            {region !== 'none' &&
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
            { Boolean(configError) && <FormHelperText error>{ configError }</FormHelperText> }
          </FormControl>
        }

        <ActionsPanel style={{ marginTop: 16 }}>
          <Button
            onClick={this.onSubmit}
            variant="raised"
            color="primary"
            data-qa-submit
          >
            Submit
          </Button>
          <Button
            onClick={this.onClose}
            variant="raised"
            color="secondary"
            className="cancel"
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
  { close },
  dispatch,
);

const mapStateToProps = (state: Linode.AppState) => ({
  mode: path(['volumeDrawer', 'mode'], state),
  volumeID: path(['volumeDrawer', 'volumeID'], state),
  label: path(['volumeDrawer', 'label'], state),
  size: path(['volumeDrawer', 'size'], state),
  region: path(['volumeDrawer', 'region'], state),
  linodeLabel: path(['volumeDrawer', 'linodeLabel'], state),
  linodeId: path(['volumeDrawer', 'linodeId'], state),
  regions: path(['resources', 'regions', 'data', 'data'], state),
});

const preloaded = PromiseLoader<CombinedProps>({
  linodes: () => getLinodes(),
});

const connected = connect(mapStateToProps, mapDispatchToProps);

const styled = withStyles(styles, { withTheme: true });

export default compose<any, any, any, any, any>(
  preloaded,
  connected,
  styled,
  SectionErrorBoundary,
)(VolumeDrawer);
