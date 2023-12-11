import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { FormHelperText } from 'src/components/FormHelperText';
import { InputAdornment } from 'src/components/InputAdornment';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { MAX_VOLUME_SIZE } from 'src/constants';
import { UNKNOWN_PRICE } from 'src/utilities/pricing/constants';
import { getDynamicVolumePrice } from 'src/utilities/pricing/dynamicVolumePrice';

import { SIZE_FIELD_WIDTH } from '../VolumeCreate';

interface Props {
  disabled?: boolean;
  error?: string;
  hasSelectedRegion?: boolean;
  isFromLinode?: boolean;
  name: string;
  onBlur: (e: any) => void;
  onChange: (e: React.ChangeEvent<any>) => void;
  regionId: string;
  resize?: number;
  textFieldStyles?: string;
  value: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  createVolumeText: {
    display: 'block',
    marginLeft: theme.spacing(1.5),
  },
  priceDisplay: {
    '& p': {
      lineHeight: 1,
      marginTop: 4,
    },

    left: `calc(${SIZE_FIELD_WIDTH}px + ${theme.spacing(2)})`,
    position: 'absolute',
    top: 50,
  },
}));

export const SizeField = (props: Props) => {
  const classes = useStyles();

  const {
    error,
    hasSelectedRegion,
    isFromLinode,
    name,
    onBlur,
    onChange,
    regionId,
    resize,
    textFieldStyles,
    value,
    ...rest
  } = props;

  const helperText = resize
    ? `This volume can range from ${resize} GB to ${MAX_VOLUME_SIZE} GB in size.`
    : undefined;

  const price = getDynamicVolumePrice({
    regionId,
    size: value,
  });

  const priceDisplayText = (
    <FormHelperText>
      {resize || isFromLinode ? null : (
        <span className={classes.createVolumeText}>
          ${price ?? UNKNOWN_PRICE}/month
        </span>
      )}
    </FormHelperText>
  );

  const dynamicPricingHelperText = !resize && !isFromLinode && (
    <Box marginLeft={'10px'} marginTop={'4px'}>
      <Typography>Select a region to see cost per month.</Typography>
    </Box>
  );

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
      <div className={classes.priceDisplay}>
        {hasSelectedRegion ? priceDisplayText : dynamicPricingHelperText}
      </div>
    </>
  );
};
