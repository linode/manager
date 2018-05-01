import * as React from 'react';
import { path } from 'ramda';
import { compose, bindActionCreators } from 'redux';
import { connect, Dispatch } from 'react-redux';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
  Typography,
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
import { dcDisplayNames } from 'src/constants';
import { resetEventsPolling } from 'src/events';
import { close } from 'src/store/reducers/volumeDrawer';
import { create, VolumeRequestPayload } from 'src/services/volumes';
import { getLinodes } from 'src/services/linodes';
import { getRegions } from 'src/services/misc';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

export interface Props {
  regions: PromiseLoaderResponse<Linode.ResourcePage<Linode.Volume>>;
  linodes: PromiseLoaderResponse<Linode.ResourcePage<Linode.Linode>>;
  cloneLabel?: string;
  /* actionCreators */
  close: typeof close;
  /* Redux state */
  mode: string;
  label: string;
  size: number;
  region: string;
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

type CombinedProps = Props & WithStyles<ClassNames>;

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
    const { label, size, region, linodeId } = this.state;
    const payload: VolumeRequestPayload = {
      label,
      size,
      region: region === 'none' ? undefined : region,
      linode_id: linodeId === 0 ? undefined : linodeId,
    };

    create(payload)
      .then(() => {
        resetEventsPolling();
        this.props.close();
      })
      .catch((errResponse) => {
        this.setState({
          errors: path(['response', 'data', 'errors'], errResponse),
        });
      });
  }

  render() {
    const { mode } = this.props;
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
          value={label}
          onChange={e => this.setState({ label: (e.target.value) })}
          error={Boolean(labelError)}
          errorText={labelError}
          disabled={mode === modes.RESIZING || mode === modes.CLONING}
          data-qa-volume-label
        />

        <TextField
          label="Size"
          value={size}
          onChange={e => this.setState({ size: +(e.target.value) })}
          error={Boolean(sizeError)}
          errorText={sizeError}
          disabled={mode === modes.CLONING || mode === modes.EDITING}
          InputProps={{
            endAdornment: 'GB',
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
            onChange={e => this.setState({ region: (e.target.value) })}
            inputProps={{ name: 'region', id: 'region' }}
            error={Boolean(regionError)}
          >
            <MenuItem key="none" value="none">Select a Region</MenuItem>,
            {regions && regions.map(region =>
              <MenuItem key={region.id} value={region.id}>{dcDisplayNames[region.id]}</MenuItem>,
            )}
          </Select>
          <Typography variant="body2">
            Optional
          </Typography>
          {regionError &&
            <FormHelperText error={Boolean(regionError)}>
              {regionError}
            </FormHelperText>
          }
        </FormControl>

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
            value={`${linodeId}`}
            onChange={e => this.setState({ linodeId: +(e.target.value) })}
            inputProps={{ name: 'linode', id: 'linode' }}
            error={Boolean(linodeError)}
          >
            <MenuItem key="none" value="0">Select a Linode</MenuItem>,
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
          </Select>
          <Typography variant="body2">
            Optional
          </Typography>
          {linodeError &&
            <FormHelperText error={Boolean(linodeError)}>
              {linodeError}
            </FormHelperText>
          }
        </FormControl>

        <ActionsPanel>
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
  label: path(['volumeDrawer', 'label'], state),
  size: path(['volumeDrawer', 'size'], state),
  region: path(['volumeDrawer', 'region'], state),
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
