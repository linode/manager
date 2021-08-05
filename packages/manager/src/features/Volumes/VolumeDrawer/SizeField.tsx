import * as React from 'react';
import FormHelperText from 'src/components/core/FormHelperText';
import InputAdornment from 'src/components/core/InputAdornment';
import TextField from 'src/components/TextField';
import { MAX_VOLUME_SIZE } from 'src/constants';
import { makeStyles } from 'src/components/core/styles';

const useStyles = makeStyles(() => ({
  helper: {
    marginTop: 4,
  },
}));

interface Props {
  name: string;
  value: number;
  onBlur: (e: any) => void;
  onChange: (e: React.ChangeEvent<any>) => void;
  disabled?: boolean;
  error?: string;
  isFromLinode?: boolean;
  resize?: number;
}

type CombinedProps = Props;

const SizeField: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    name,
    value,
    onBlur,
    onChange,
    error,
    isFromLinode,
    resize,
    ...rest
  } = props;

  const helperText = resize
    ? `This volume can range from ${resize} GiB to ${MAX_VOLUME_SIZE} GiB in size.`
    : undefined;

  const price = (value / 10).toFixed(2);

  return (
    <>
      <TextField
        data-qa-size
        errorText={error}
        helperText={helperText}
        InputProps={{
          endAdornment: <InputAdornment position="end"> GiB </InputAdornment>,
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
      <FormHelperText>
        {resize || isFromLinode ? (
          'The size of the new volume in GiB.'
        ) : (
          <div className={classes.helper}>${price}/month</div>
        )}
      </FormHelperText>
    </>
  );
};

export default SizeField;
