import {
  Box,
  CircleProgress,
  FormHelperText,
  InputAdornment,
  TextField,
  Typography,
} from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { MAX_VOLUME_SIZE } from 'src/constants';
import { useVolumeTypesQuery } from 'src/queries/volumes/volumes';
import { UNKNOWN_PRICE } from 'src/utilities/pricing/constants';
import { getDCSpecificPriceByType } from 'src/utilities/pricing/dynamicPricing';

import { SIZE_FIELD_WIDTH } from '../../constants';

import type { Theme } from '@mui/material/styles';

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

const useStyles = makeStyles()((theme: Theme) => ({
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
  const { classes } = useStyles();

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

  const { data: types, isLoading } = useVolumeTypesQuery();

  const helperText = resize
    ? `This volume can range from ${resize} GB to ${MAX_VOLUME_SIZE} GB in size.`
    : undefined;

  const price = getDCSpecificPriceByType({
    regionId,
    size: value,
    type: types?.[0],
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

  // The price display is only visible next to the size field on the Volumes Create page.
  const shouldShowPrice = !resize && !isFromLinode;
  const shouldShowPriceLoadingSpinner =
    regionId && isLoading && shouldShowPrice;

  const dynamicPricingHelperText = shouldShowPrice && (
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
        {shouldShowPriceLoadingSpinner ? (
          <CircleProgress noPadding size="sm" />
        ) : hasSelectedRegion ? (
          priceDisplayText
        ) : (
          dynamicPricingHelperText
        )}
      </div>
    </>
  );
};
