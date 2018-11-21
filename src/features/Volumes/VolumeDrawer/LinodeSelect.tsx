import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import { getLinodes } from 'src/services/linodes';
import { debounce } from 'throttle-debounce';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  /** * @todo Does not having value passed here break the cycle? */
  error?: string;
  handleChange: (is: number) => void;
  name: string;
  onBlur: any; /** @todo */
  region: string;
}

interface State {
  loading: boolean;
  linodes: Item[];
  selectedLinodeId?: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodeSelect extends React.Component<CombinedProps, State> {
  static defaultProps = {
    region: 'none',
  };

  state: State = {
    linodes: [],
    loading: true,
  };

  componentDidMount() {
    this.searchLinodes();
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    const { region } = this.props;
    if (region !== prevProps.region) {
      this.searchLinodes();
    }
  }

  getSelectedLinode = (linodeId?: number) => {
    if (!linodeId) { return 0; }

    const { linodes } = this.state;
    const idx = linodes.findIndex((linode) => Number(linodeId) === Number(linode.value));
    return idx > -1 ? linodes[idx] : 0;
  }

  setSelectedLinode = (selected: Item<number>) => {
    if (selected) {
      const { value } = selected;
      this.setState({ selectedLinodeId: value });
      this.props.handleChange(value);
    } else {
      this.setState({ selectedLinodeId: 0 })
    }
  }

  renderLinodeOptions = (linodes: Linode.Linode[]) => {
    if (!linodes) { return []; }
    return linodes.map((linode: Linode.Linode) => {

      return {
        value: linode.id,
        label: linode.label,
        data: { region: linode.region }
      }
    });
  }

  getLinodeFilter = (inputValue: string) => {
    const { region } = this.props;

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
    this.setState({ loading: true });

    const filterLinodes = this.getLinodeFilter(inputValue);
    getLinodes({}, filterLinodes)
      .then((response) => {
        const linodes = this.renderLinodeOptions(response.data);
        this.setState({ linodes, loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      })
  }

  onInputChange = (inputValue: string, actionMeta: { action: string }) => {
    if (actionMeta.action !== 'input-change') { return; }
    this.setState({ loading: true });
    this.debouncedSearch(inputValue);
  }

  debouncedSearch = debounce(400, false, this.searchLinodes);

  render() {
    const { error, name, onBlur } = this.props;
    const { loading, linodes, selectedLinodeId } = this.state;

    return (
      <FormControl fullWidth>
        <EnhancedSelect
          onBlur={onBlur}
          name={name}
          label="Linode"
          placeholder="Select a Linode"
          value={this.getSelectedLinode(selectedLinodeId)}
          isLoading={loading}
          errorText={error}
          options={linodes}
          onChange={this.setSelectedLinode}
          onInputChange={this.onInputChange}
          data-qa-select-linode
        />
        {!error && <FormHelperText>Only Linodes in the selected region are displayed.</FormHelperText>}
      </FormControl>
    );
  }
};

const styled = withStyles(styles);

export default styled(LinodeSelect);

