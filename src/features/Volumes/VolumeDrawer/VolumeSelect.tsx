import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import { isRestrictedUser } from 'src/features/Profile/permissionsHelpers';
import { getVolumes } from 'src/services/volumes';
import { MapState } from 'src/store/types';
import { debounce } from 'throttle-debounce';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  error?: string;
  onChange: (linodeId: number) => void;
  name: string;
  onBlur: (e: any) => void;
  value: number;
  region: string;
  disabled?: boolean;
}

interface State {
  loading: boolean;
  volumes: Item[];
  selectedVolumeId?: number;
}

type CombinedProps = Props & StateProps & WithStyles<ClassNames>;

class VolumeSelect extends React.Component<CombinedProps, State> {
  state: State = {
    volumes: [],
    loading: true
  };

  componentDidMount() {
    this.searchVolumes();
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    const { region } = this.props;
    if (region !== prevProps.region) {
      this.searchVolumes();
    }
  }

  getSelectedVolume = (linodeId?: number) => {
    if (!linodeId) {
      return -1;
    }

    const { volumes } = this.state;
    const idx = volumes.findIndex(
      linode => Number(linodeId) === Number(linode.value)
    );
    return idx > -1 ? volumes[idx] : -1;
  };

  setSelectedVolume = (selected: Item<number>) => {
    if (selected) {
      const { value } = selected;
      this.setState({ selectedVolumeId: value });
      this.props.onChange(value);
    } else {
      this.props.onChange(-1);
      this.setState({ selectedVolumeId: -1 });
    }
  };

  renderLinodeOptions = (volumes: Linode.Volume[]) => {
    if (!volumes) {
      return [];
    }

    const { volumeGrants } = this.props;

    let volumeOptions = [];

    if (volumeGrants) {
      const allowedVolumeGrants = volumeGrants.reduce(
        (acc: number[], volume: Linode.Grant) => {
          if (volume.permissions === 'read_write') {
            acc.push(volume.id);
          }
          return acc;
        },
        []
      );

      volumeOptions = volumes.filter(
        volume => allowedVolumeGrants.indexOf(volume.id) !== -1
      );
    } else {
      volumeOptions = volumes;
    }

    return volumeOptions.map(volume => ({
      value: volume.id,
      label: volume.label,
      data: {
        region: volume.region
      }
    }));
  };

  getVolumeFilter = (inputValue: string) => {
    const { region } = this.props;

    if (region && region !== 'none') {
      return {
        label: {
          '+contains': inputValue
        },
        region
      };
    } else {
      return {
        label: {
          '+contains': inputValue
        }
      };
    }
  };

  searchVolumes = (inputValue: string = '') => {
    this.setState({ loading: true });

    const filterVolumes = this.getVolumeFilter(inputValue);

    getVolumes({}, filterVolumes)
      .then(response => {
        return {
          ...response,
          data: response.data.filter(
            v => v.region === this.props.region && v.linode_id === null
          )
        };
      })
      .then(response => {
        const volumes = this.renderLinodeOptions(response.data);
        this.setState({ volumes, loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  onInputChange = (inputValue: string, actionMeta: { action: string }) => {
    if (actionMeta.action !== 'input-change') {
      return;
    }
    this.setState({ loading: true });
    this.debouncedSearch(inputValue);
  };

  debouncedSearch = debounce(400, false, this.searchVolumes);

  render() {
    const { error, name, onBlur, disabled } = this.props;
    const { loading, volumes, selectedVolumeId } = this.state;

    return (
      <FormControl fullWidth>
        <EnhancedSelect
          onBlur={onBlur}
          name={name}
          label="Volume"
          placeholder="Select a Volume"
          value={this.getSelectedVolume(selectedVolumeId)}
          isLoading={loading}
          errorText={error}
          options={volumes}
          onChange={this.setSelectedVolume}
          onInputChange={this.onInputChange}
          disabled={disabled}
        />
        {!error && (
          <FormHelperText data-qa-volume-region>
            Only volumes in this Linode's region are displayed.
          </FormHelperText>
        )}
      </FormControl>
    );
  }
}

interface StateProps {
  volumeGrants?: Linode.Grant[];
}

const mapStateToProps: MapState<StateProps, CombinedProps> = state => ({
  volumeGrants: isRestrictedUser(state)
    ? pathOr(
        undefined,
        ['__resources', 'profile', 'data', 'grants', 'volume'],
        state
      )
    : undefined
});

const connected = connect(mapStateToProps);

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  styled,
  connected
)(VolumeSelect);
