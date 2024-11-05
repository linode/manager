import { Box } from '@linode/ui';
import { styled } from '@mui/material/styles';
import 'flag-icons/css/flag-icons.min.css';
import React from 'react';

import type { Country } from '@linode/api-v4';
import type { BoxProps } from '@linode/ui';

const COUNTRY_FLAG_OVERRIDES = {
  uk: 'gb',
};

interface Props extends BoxProps {
  country: Country;
}

/**
 * Flag icons are provided by the [flag-icons](https://www.npmjs.com/package/flag-icon) package
 */
export const Flag = (props: Props) => {
  const { country, ...rest } = props;

  return (
    <StyledFlag
      className={`fi fi-${getFlagClass(country.toLowerCase())} fi-xx`}
      {...rest}
    />
  );
};

const getFlagClass = (country: Country | string) => {
  if (country in COUNTRY_FLAG_OVERRIDES) {
    return COUNTRY_FLAG_OVERRIDES[
      country as keyof typeof COUNTRY_FLAG_OVERRIDES
    ];
  }
  return country;
};

const StyledFlag = styled(Box, { label: 'StyledFlag' })(({ theme }) => ({
  boxShadow:
    theme.palette.mode === 'light' ? `0px 0px 0px 1px #00000010` : undefined,
  fontSize: '1.5rem',
  verticalAlign: 'top',
  width: '1.41rem',
}));
