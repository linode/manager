import { useFormikContext } from 'formik';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';

interface EngineOptionProps {
  /**
   * list of engine options available
   */
  engineOptions: any[];
  /**
   * if the engine options query has encountered an error
   */
  isError: boolean;
  /**
   * if the engine options are still loading or not
   */
  isLoading: boolean;
  /**
   * name used for the component to set formik field
   */
  name: string;
}
interface CloudPulseEngineOptionType {
  group: '';
  label: '';
}
export const EngineOption = (props: EngineOptionProps) => {
  const [
    selectedDatabase,
    setDatabase,
  ] = React.useState<CloudPulseEngineOptionType | null>(null);
  const formik = useFormikContext();
  const { engineOptions, isError, isLoading, name } = props;

  React.useEffect(() => {
    formik.setFieldValue(`${name}`, selectedDatabase?.group ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDatabase]);

  const getEnginesList = () => {
    if (engineOptions === undefined) {
      return [];
    }
    return (
      engineOptions?.map((option) => ({
        group: option.engine,
        label: option.id,
      })) ?? []
    );
  };

  return (
    <Autocomplete
      onChange={(_: any, newValue: CloudPulseEngineOptionType, reason) =>
        reason === 'selectOption' && setDatabase(newValue)
      }
      data-testid="engine-options"
      errorText={isError ? 'Unable to load Engine Options' : ''}
      groupBy={(option) => option.group}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      label="Engine Options"
      loading={isLoading && !isError}
      options={getEnginesList()}
      value={selectedDatabase ?? null}
    />
  );
};
