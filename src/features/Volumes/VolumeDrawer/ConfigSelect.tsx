import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import InputLabel from 'src/components/core/InputLabel';
import MenuItem from 'src/components/core/MenuItem';
import Select from 'src/components/Select';
import { getLinodeConfigs } from 'src/services/linodes';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  error?: string
  onChange: (value: number) => void;
  onBlur: (e: any) => void;
  linodeId: number;
  name: string;
  value: number;
}


type ConfigTuple = [number, string];
interface State {
  configs: ConfigTuple[];
  loading: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class ConfigSelect extends React.Component<CombinedProps, State> {

  state: State = {
    configs: [],
    loading: false,
  }

  setInitialState = () => {
    const { onChange } = this.props;
    const [firstConfig] = this.state.configs;
    if (firstConfig && firstConfig[0]) {
      return onChange(firstConfig[0]);
    }

    /**
     * We are unable to setup the initial state because there are no configs. We're setting the
     * config Id to something unrealistic so we can key off that for validation.
     */
    onChange(-9999);
  };

  componentDidMount() {
    this.updateConfigs(this.props.linodeId);
  }

  updateConfigs(linodeId: number) {
    const { onChange } = this.props;

    /**
     * If we have a 'none' value, we dont need to make the request.
     */
    if (linodeId === -1) {
      this.setState({ configs: [] });
      return onChange(-1);
    }

    getLinodeConfigs(linodeId)
      .then(({ data }) => {
        this.setState({
          configs: data.map((config) => [config.id, config.label] as ConfigTuple)
        }, () => { this.setInitialState() });
      })
      .catch(() => {
        /*
         * @note: If we can't get configs for the Linode, then the user can
         * still create the volume, so we probably shouldn't show any error
         * state if this fails.
         */
      });
  }

  componentDidUpdate(prevProps: CombinedProps) {
    const { linodeId } = this.props;
    /**
     * If we have a new Linode Id we need to get the configs for said linode.
     */
    if (linodeId !== prevProps.linodeId) {
      this.updateConfigs(Number(linodeId));
    }
  }

  render() {
    const { error, onChange, name, onBlur, value } = this.props;
    const { loading, configs } = this.state;

    const hasError = Boolean(error);

    if (!loading && configs.length <= 1) {
      return null;
    }

    return (
      <FormControl fullWidth>
        <InputLabel
          htmlFor={name}
          disableAnimation
          shrink={true}
          error={hasError}
        >
          Config
        </InputLabel>
        <Select
          name={name}
          value={value}
          onChange={(e) => { onChange(+e.target.value); }}
          onBlur={onBlur}
          inputProps={{ name, id: name }}
          error={hasError}
        >
          {
            configs && configs.map(([v, label]) => <MenuItem key={v} value={v}>{label}</MenuItem>)
          }
        </Select>
        {hasError && <FormHelperText error>{error}</FormHelperText>}
      </FormControl>
    );
  }
};

const styled = withStyles(styles);

export default styled(ConfigSelect);
