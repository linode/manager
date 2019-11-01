import * as React from 'react';
import FormHelperText from 'src/components/core/FormHelperText';
import InputAdornment from 'src/components/core/InputAdornment';
import TextField from 'src/components/TextField';
import { MAX_VOLUME_SIZE } from 'src/constants';

interface Props {
  error?: string;
  onBlur: (e: any) => void;
  onChange: (e: React.ChangeEvent<any>) => void;
  value: number;
  name: string;
  resize?: number;
  disabled?: boolean;
}

type CombinedProps = Props;

const SizeField: React.FC<CombinedProps> = ({
  error,
  onBlur,
  onChange,
  value,
  name,
  resize,
  ...rest
}) => {
  const helperText = resize
    ? `This volume can range from ${resize} GiB to ${MAX_VOLUME_SIZE} GiB in size.`
    : undefined;

  return (
    <>
      <TextField
        data-qa-size
        errorText={error}
        helperText={helperText}
        InputProps={{
          endAdornment: <InputAdornment position="end"> GiB </InputAdornment>
        }}
        label="Size"
        name={name}
        type="number"
        onBlur={onBlur}
        onChange={onChange}
        required
        value={value}
        {...rest}
      />
      <FormHelperText>The size of the new volume in GiB</FormHelperText>
    </>
  );
};

export default SizeField;
