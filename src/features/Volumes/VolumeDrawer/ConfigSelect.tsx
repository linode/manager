import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { getLinodeConfigs } from 'src/services/linodes';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {}
  });

interface Props {
  error?: string;
  onChange: (value: number) => void;
  onBlur: (e: any) => void;
  linodeId: number;
  name: string;
  value: number;
  disabled?: boolean;
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
    loading: false
  };

  setInitialState = () => {
    /**
     * Configs is [configId, configLabel][].
     * We select the first config's ID and call onChange to automatically select the first config
     */
    const { onChange } = this.props;
    const [firstConfig] = this.state.configs;

    if (firstConfig) {
      const [id] = firstConfig;
      return onChange(id);
    }

    /**
     * We are unable to setup the initial state because there are no configs. We're setting the
     * config Id to something unrealistic so we can key off that for validation.
     */
    onChange(-9999);
  };

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
        this.setState(
          {
            configs: data.map(
              config => [config.id, config.label] as ConfigTuple
            )
          },
          () => {
            this.setInitialState();
          }
        );
      })
      .catch(() => {
        /*
         * @note: If we can't get configs for the Linode, then the user can
         * still create the volume, so we probably shouldn't show any error
         * state if this fails.
         */
      });
  }

  componentDidMount() {
    this.updateConfigs(this.props.linodeId);
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
    const { error, onChange, name, onBlur, value, ...rest } = this.props;
    const { loading, configs } = this.state;

    if (!loading && configs.length <= 1) {
      return null;
    }

    const configList =
      configs &&
      configs.map(([v, label]) => {
        return { label, value: v };
      });

    return (
      <FormControl fullWidth>
        <Select
          options={configList}
          name={name}
          defaultValue={configList[0]}
          onChange={(e: Item) => {
            onChange(+e.value);
          }}
          onBlur={onBlur}
          id={name}
          label="Config"
          errorText={error}
          noMarginTop
          isClearable={false}
          placeholder="Select a Config"
          {...rest}
        />
      </FormControl>
    );
  }
}

const styled = withStyles(styles);

export default styled(ConfigSelect);
