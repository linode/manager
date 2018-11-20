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
  handleChange: any /** @todo */
  onBlur: any; /** @todo any */
  linodeId: string;
  name: string;
  value: string;
}

interface State {
  configs: string[][];
  loading: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class ConfigSelect extends React.Component<CombinedProps, State> {

  state: State = {
    configs: [],
    loading: false,
  }

  setInitialState = () => {
    const { handleChange } = this.props;
    handleChange(this.state.configs[0][0]);
  };

  updateConfigs(linodeID: number) {
    getLinodeConfigs(linodeID)
      .then(({ data }) => {
        this.setState({
          configs: data.map((config) => [`${config.id}`, config.label])
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
    const { linodeId, handleChange } = this.props;
    /**
     * If we have a new Linode Id we need to get the configs for said linode.
     */
    if (linodeId && linodeId !== prevProps.linodeId) {
      this.updateConfigs(Number(linodeId));
    }

    /**
     * If we had a Linode, and don't now, we need to clear the config list and
     * set the value as undefined.
     */
    if (prevProps.linodeId && !linodeId) {
      this.setState({ configs: [] });
      handleChange();
    }
  }

  render() {
    const { error, handleChange, name, onBlur, value } = this.props;
    const { loading, configs } = this.state;

    const hasError = Boolean(error);

    if (!loading && configs.length <= 1) {
      return null;
    }

    return (
      <FormControl fullWidth>
        <InputLabel
          htmlFor="config"
          disableAnimation
          shrink={true}
          error={hasError}
        >
          Config
        </InputLabel>
        <Select
          name={name}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
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
