import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { ApplicationState } from 'src/store';
import { getAllLinodeConfigs } from 'src/store/linodes/config/config.requests';
import { useSelector, useDispatch } from 'react-redux';

interface Props {
  error?: string;
  onChange: (value: number) => void;
  onBlur: (e: any) => void;
  linodeId: number;
  name: string;
  value: number;
  disabled?: boolean;
}

type CombinedProps = Props;

const ConfigSelect: React.FC<CombinedProps> = props => {
  const { error, onChange, onBlur, linodeId, name, value, ...rest } = props;

  const { lastUpdated, itemsById } = useSelector((state: ApplicationState) => {
    return state.__resources.linodeConfigs[linodeId] ?? {};
  });

  const configs = Object.values(itemsById ?? {});
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (lastUpdated === 0) {
      dispatch(() => getAllLinodeConfigs({ linodeId }));
    }
  }, [linodeId, lastUpdated, dispatch]);

  const configList = configs.map(config => {
    return { label: config.label, value: config.id };
  });

  if (configs.length < 1) {
    return null;
  } else {
    return (
      <FormControl fullWidth>
        <Select
          options={configList}
          name={name}
          value={configList.find(thisConfig => thisConfig.value === value)}
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
};

export default React.memo(ConfigSelect);
