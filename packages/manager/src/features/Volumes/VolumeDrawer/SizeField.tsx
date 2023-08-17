import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { FormHelperText } from 'src/components/FormHelperText';
import { InputAdornment } from 'src/components/InputAdornment';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { MAX_VOLUME_SIZE } from 'src/constants';

const useStyles = makeStyles((theme: Theme) => ({
  createVolumeText: {
    display: 'block',
    marginBottom: theme.spacing(),
    marginLeft: theme.spacing(1.5),
  },
}));

interface Props {
  disabled?: boolean;
  error?: string;
  hasSelectedRegion?: boolean;
  isFromLinode?: boolean;
  name: string;
  onBlur: (e: any) => void;
  onChange: (e: React.ChangeEvent<any>) => void;
  resize?: number;
  textFieldStyles?: string;
  value: number;
}

type CombinedProps = Props;

const SizeField: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    error,
    hasSelectedRegion,
    isFromLinode,
    name,
    onBlur,
    onChange,
    resize,
    textFieldStyles,
    value,
    ...rest
  } = props;

  const helperText = resize
    ? `This volume can range from ${resize} GB to ${MAX_VOLUME_SIZE} GB in size.`
    : undefined;
  const price = value >= 10 ? (value / 10).toFixed(2) : '0.00';

  return (
    <>
      <TextField
        InputProps={{
          endAdornment: <InputAdornment position="end"> GB </InputAdornment>,
        }}
        className={textFieldStyles}
        data-qa-size
        errorText={error}
        helperText={helperText}
        label="Size"
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        required
        type="number"
        value={value}
        {...rest}
      />
      {hasSelectedRegion ? (
        <FormHelperText>
          {resize || isFromLinode ? (
            'The size of the new volume in GB.'
          ) : (
            <span className={classes.createVolumeText}>${price}/month</span>
          )}
        </FormHelperText>
      ) : (
        <Box alignItems="center" display="flex" height={34} marginLeft={2}>
          <Typography>Select a Region to see cost per month.</Typography>
        </Box>
      )}
    </>
  );
};

export default SizeField;
