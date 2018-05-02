import * as React from 'react';
import { path } from 'ramda';
import { compose, bindActionCreators } from 'redux';
import { connect, Dispatch } from 'react-redux';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Button from 'material-ui/Button';
import { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import { FormControl, FormHelperText } from 'material-ui/Form';

import TextField from 'src/components/TextField';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import Drawer from 'src/components/Drawer';
import ActionsPanel from 'src/components/ActionsPanel';
import Select from 'src/components/Select';
import Notice from 'src/components/Notice';
import { updateVolumes$ } from 'src/features/Volumes/Volumes';
import { dcDisplayNames } from 'src/constants';
import { resetEventsPolling } from 'src/events';
import { close } from 'src/store/reducers/volumeDrawer';
import {
  create,
  resize,
  update,
  clone,
  VolumeRequestPayload,
} from 'src/services/volumes';
import { getLinodes } from 'src/services/linodes';
import { getRegions } from 'src/services/misc';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

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
  regions: PromiseLoaderResponse<Linode.ResourcePage<Linode.Volume>>;
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
  linodeId: number;
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
  state: State = {
    cloneLabel: this.props.cloneLabel,
    label: this.props.label,
    size: this.props.size,
    region: this.props.region,
    linodeId: this.props.linodeId,
  };

  componentWillReceiveProps(nextProps: CombinedProps) {
    this.setState({
      cloneLabel: nextProps.cloneLabel || '',
      label: nextProps.label,
      size: nextProps.size,
      region: nextProps.region,
      linodeId: nextProps.linodeId,
      errors: undefined,
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
            this.setState({
              errors: path(['response', 'data', 'errors'], errorResponse),
            });
          });
        return;
      case modes.EDITING:
        if (!volumeID) {
          return;
        }

        if (!label) {
          this.setState({
            errors: [{ field: 'label', reason: 'Label cannot be blank.' }],
          });
          return;
        }

        update(volumeID, label)
          .then(() => {
            updateVolumes$.next(true);
            close();
          })
          .catch((errorResponse) => {
            this.setState({
              errors: path(['response', 'data', 'errors'], errorResponse),
            });
          });
        return;
      case modes.RESIZING:
        if (!volumeID) {
          return;
        }

        if (!label) {
          this.setState({
            errors: [{ field: 'size', reason: 'Size cannot be blank.' }],
          });
          return;
        }

        resize(volumeID, Number(size))
          .then(() => {
            resetEventsPolling();
            close();
          })
          .catch((errorResponse) => {
            this.setState({
              errors: path(['response', 'data', 'errors'], errorResponse),
            });
          });
        return;
      case modes.CLONING:
        if (!volumeID) {
          return;
        }

        if (!cloneLabel) {
          this.setState({
            errors: [{ field: 'label', reason: 'Label cannot be blank.' }],
          });
          return;
        }

        clone(volumeID, cloneLabel)
          .then(() => {
            resetEventsPolling();
            close();
          })
          .catch((errorResponse) => {
            this.setState({
              errors: path(['response', 'data', 'errors'], errorResponse),
            });
          });
        return;
      default:
        return;
    }
  }

  render() {
    const { mode, linodeLabel, classes } = this.props;
    const regions = path(['response', 'data'], this.props.regions) as Linode.Region[];
    const linodes = path(['response', 'data'], this.props.linodes) as Linode.Linode[];

    const {
      cloneLabel,
      label,
      size,
      region,
      linodeId,
      errors,
    } = this.state;

    const hasErrorFor = getAPIErrorFor({
      linode_id: 'Linode ID',
      region: 'Region',
      size: 'Size',
      label: 'Label',
    }, errors);
    const labelError = hasErrorFor('label');
    const sizeError = hasErrorFor('size');
    const regionError = hasErrorFor('region');
    const linodeError = hasErrorFor('linode_id');
    const generalError = hasErrorFor('none');

    return (
      <Drawer
        open={mode !== modes.CLOSED}
        onClose={() => this.onClose()}
        title={titleMap[mode]}
      >
        {generalError &&
          <Notice
            error
            text={generalError}
          />
        }

        {mode === modes.CLONING &&
          <TextField
            label="Cloned Label"
            value={cloneLabel}
            onChange={e => this.setState({ cloneLabel: (e.target.value) })}
            error={Boolean(labelError)}
            errorText={labelError}
            data-qa-clone-from
          />
        }

        <TextField
          label="Label"
          required
          value={label}
          onChange={e => this.setState({ label: (e.target.value) })}
          error={Boolean(labelError)}
          errorText={labelError}
          disabled={mode === modes.RESIZING || mode === modes.CLONING}
          data-qa-volume-label
        />

        <TextField
          label="Size"
          required
          value={size}
          onChange={e => this.setState({ size: +(e.target.value) })}
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
            onChange={e => this.setState({ region: (e.target.value) })}
            inputProps={{ name: 'region', id: 'region' }}
            error={Boolean(regionError)}
          >
            <MenuItem key="none" value="none">Select a Region</MenuItem>,
            {regions && regions.map(region =>
              <MenuItem key={region.id} value={region.id}>{dcDisplayNames[region.id]}</MenuItem>,
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
              onChange={e => this.setState({ linodeId: +(e.target.value) })}
              inputProps={{ name: 'linode', id: 'linode' }}
              error={Boolean(linodeError)}
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
                      ? linode.region === region
                      : true
                  );
                })
                .map(linode =>
                  <MenuItem key={linode.id} value={`${linode.id}`}>{linode.label}</MenuItem>,
              )}
              {(mode === modes.EDITING
                || mode === modes.RESIZING)
                /*
                * We optimize the lookup of the linodeLabel by providing it
                * explicitly when editing or cloning
                */
                && <MenuItem key={linodeLabel} value={linodeLabel}>{linodeLabel}</MenuItem>
              }
            </Select>
            {linodeError &&
              <FormHelperText error={Boolean(linodeError)}>
                {linodeError}
              </FormHelperText>
            }
          </FormControl>
        }

        <ActionsPanel style={{ marginTop: 16 }}>
          <Button
            onClick={() => this.onSubmit()}
            variant="raised"
            color="primary"
            data-qa-submit
          >
            Submit
          </Button>
          <Button
            onClick={() => this.onClose()}
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
});

const preloaded = PromiseLoader<CombinedProps>({
  regions: () => getRegions(),
  linodes: () => getLinodes(),
});

const connected = connect(mapStateToProps, mapDispatchToProps);

const styled = withStyles(styles, { withTheme: true });

export default compose<any, any, any, any>(
  preloaded,
  connected,
  styled,
)(VolumeDrawer);
