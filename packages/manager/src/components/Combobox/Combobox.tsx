import * as React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete/Autocomplete';
// import { makeStyles, Theme } from 'src/components/core/styles'
import TextField from '../core/TextField';

interface Props {
  id: string;
  label: string;
  placeholder: string;
  options: any[];
  groupBy?: () => any;
  onChange?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

type CombinedProps = Props;

export const Combobox: React.FC<CombinedProps> = props => {
  const {
    id,
    label,
    placeholder,
    options,
    groupBy,
    onChange,
    disabled,
    loading
  } = props;

  return (
    <Autocomplete
      id={id}
      options={options}
      groupBy={groupBy}
      onChange={onChange}
      getOptionLabel={option => option.label}
      renderInput={(params: any) => (
        <TextField {...params} label={label} placeholder={placeholder} />
      )}
      style={{ width: 415 }}
      disabled={disabled}
      loading={loading}
    />

    // <Autocomplete
    //   id='image-select'
    //   options={filteredImages as any}
    //   groupBy={imagesToGroupedItems => imagesToGroupedItems.vendor}
    //   onChange={onChange}
    //   getOptionLabel={(option: Image) => option.label}
    //   renderInput={(params: any) => <TextField {...params} label="Images" placeholder="Select an Image" variant="outlined" />}
    //   style={{width: 415}}
    //   disabled={disabled}
    //   loading={_loading}
    //   //className={classNames}
    // />
  );
};

export default Combobox;
