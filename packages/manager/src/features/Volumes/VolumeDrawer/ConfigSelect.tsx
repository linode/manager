import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Select, { Item } from 'src/components/EnhancedSelect/Select';
import FormControl from 'src/components/core/FormControl';
import { ApplicationState } from 'src/store';
import { getAllLinodeConfigs } from 'src/store/linodes/config/config.requests';

interface Props {
  disabled?: boolean;
  error?: string;
  linodeId: number;
  name: string;
  onBlur: (e: any) => void;
  onChange: (value: number) => void;
  value: number;
  width?: number;
}

type CombinedProps = Props;

export const initialValueDefaultId = -1;

const ConfigSelect: React.FC<CombinedProps> = (props) => {
  const {
    error,
    linodeId,
    name,
    onBlur,
    onChange,
    value,
    width,
    ...rest
  } = props;

  const { error: configsError, itemsById, lastUpdated, loading } = useSelector(
    (state: ApplicationState) => {
      return state.__resources.linodeConfigs[linodeId] ?? { error: {} };
    }
  );

  const configs = Object.values(itemsById ?? {});

  const dispatch = useDispatch();

  const configList = configs.map((config) => {
    return { label: config.label, value: config.id };
  });

  React.useEffect(() => {
    if (linodeId === initialValueDefaultId) {
      return;
    }

    if (configsError?.read) {
      return;
    }

    if (!loading && !lastUpdated) {
      dispatch(getAllLinodeConfigs({ linodeId }));
    }
  }, [linodeId, lastUpdated, dispatch, loading, configsError]);

  React.useEffect(() => {
    if (configList.length === 1) {
      const newValue = configList[0].value;
      if (value !== newValue) {
        onChange(configList[0].value);
      }
    }
  }, [configList, onChange, value]);

  if (configs.length < 1) {
    return null;
  } else {
    return (
      <FormControl
        fullWidth={width ? false : true}
        style={{ marginTop: 20, width }}
      >
        <Select
          onChange={(e: Item<number>) => {
            onChange(+e.value);
          }}
          errorText={error}
          id={name}
          isClearable={false}
          label="Config"
          name={name}
          noMarginTop
          onBlur={onBlur}
          options={configList}
          placeholder="Select a Config"
          value={configList.find((thisConfig) => thisConfig.value === value)}
          {...rest}
        />
      </FormControl>
    );
  }
};

export default React.memo(ConfigSelect);
