import { pathOr } from 'ramda';
import * as React from 'react';
import _Option from 'react-select/lib/components/Option';
import { compose } from 'recompose';
import FormHelperText from 'src/components/core/FormHelperText';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import { getLinodes } from 'src/services/linodes';
import { doesRegionSupportBlockStorage } from 'src/utilities/doesRegionSupportBlockStorage';
import { debounce } from 'throttle-debounce';

import withRegions, {
  DefaultProps as RegionProps
} from 'src/containers/regions.container';

export const regionSupportMessage =
  'This Linode is in a region that does not currently support Block Storage';

interface Props {
  /** * @todo Does not having value passed here break the cycle? */
  error?: string;
  onChange: (linodeId: number) => void;
  name: string;
  onBlur: (e: any) => void;
  region: string;
  shouldOnlyDisplayRegionsWithBlockStorage?: boolean;
  disabled?: boolean;
}

interface State {
  loading: boolean;
  linodes: Item[];
  selectedLinodeId?: number;
}

type CombinedProps = RegionProps & Props;

export class LinodeSelect extends React.Component<CombinedProps, State> {
  mounted: boolean;

  static defaultProps = {
    region: 'none'
  };

  state: State = {
    linodes: [],
    loading: true
  };

  componentDidMount() {
    this.mounted = true;
    this.searchLinodes();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    const { region, onChange } = this.props;
    if (region !== prevProps.region) {
      this.searchLinodes();
      onChange(-1);
    }
  }

  getSelectedLinode = (linodeId?: number) => {
    if (!linodeId) {
      return -1;
    }

    const { linodes } = this.state;
    const idx = linodes.findIndex(
      linode => Number(linodeId) === Number(linode.value)
    );
    return idx > -1 ? linodes[idx] : -1;
  };

  setSelectedLinode = (selected: Item<number>) => {
    if (selected) {
      const { value } = selected;
      if (this.mounted) {
        this.setState({ selectedLinodeId: value });
      }
      this.props.onChange(value);
    } else {
      this.props.onChange(-1);
      if (this.mounted) {
        this.setState({ selectedLinodeId: -1 });
      }
    }
  };

  renderLinodeOptions = (linodes: Linode.Linode[]) => {
    if (!linodes) {
      return [];
    }
    return linodes.map((linode: Linode.Linode) => {
      return {
        value: linode.id,
        label: linode.label,
        data: { region: linode.region }
      };
    });
  };

  getLinodeFilter = (inputValue: string) => {
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

  searchLinodes = (inputValue: string = '') => {
    if (this.mounted) {
      this.setState({ loading: true });
    }

    const filterLinodes = this.getLinodeFilter(inputValue);
    getLinodes({}, filterLinodes)
      .then(response => {
        const linodes = this.renderLinodeOptions(response.data);
        if (this.mounted) {
          this.setState({ linodes, loading: false });
        }
      })
      .catch(() => {
        if (this.mounted) {
          this.setState({ loading: false });
        }
      });
  };

  onInputChange = (inputValue: string, actionMeta: { action: string }) => {
    if (actionMeta.action !== 'input-change') {
      return;
    }

    if (this.mounted) {
      this.setState({ loading: true });
    }

    this.debouncedSearch(inputValue);
  };

  debouncedSearch = debounce(400, false, this.searchLinodes);

  render() {
    const {
      error,
      onBlur,
      shouldOnlyDisplayRegionsWithBlockStorage,
      onChange,
      regionsData,
      ...rest
    } = this.props;

    const { loading, linodes, selectedLinodeId } = this.state;

    const options = shouldOnlyDisplayRegionsWithBlockStorage
      ? linodes.filter(linode => {
          const region = pathOr('', ['data', 'region'], linode);
          return doesRegionSupportBlockStorage(region, regionsData);
        })
      : linodes;

    return (
      <>
        <EnhancedSelect
          onBlur={onBlur}
          label="Linode"
          placeholder="Select a Linode"
          value={this.getSelectedLinode(selectedLinodeId)}
          isLoading={loading}
          errorText={error}
          options={[{ label: 'Select a Linode', value: -1 }, ...options]}
          onChange={this.setSelectedLinode}
          onInputChange={this.onInputChange}
          textFieldProps={{
            dataAttrs: {
              'data-qa-select-linode': true
            }
          }}
          {...rest}
        />
        {!error && (
          <FormHelperText data-qa-volume-region>
            If you want to attach the new volume to a Linode, select it here.
            Only Linodes in the selected region are displayed.
          </FormHelperText>
        )}
      </>
    );
  }
}

const enhanced = compose<CombinedProps, Props>(withRegions());

export default enhanced(LinodeSelect);
