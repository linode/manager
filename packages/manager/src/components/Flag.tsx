import { styled } from '@mui/material/styles';
import 'flag-icons/css/flag-icons.min.css';
import React from 'react';

import type { Country } from '@linode/api-v4';

const COUNTRY_FLAG_OVERRIDES = {
  uk: 'gb',
};

interface Props {
  country: Country;
}

/**
 * Flag icons are provided by the [flag-icons](https://www.npmjs.com/package/flag-icon) package
 */
export const Flag = (props: Props) => {
  const country = props.country.toLowerCase();

  return (
    <StyledFlag
      className={`fi fi-${COUNTRY_FLAG_OVERRIDES[country] ?? country} fi-xx`}
    />
  );
};

const StyledFlag = styled('div', { label: 'StyledFlag' })(({ theme }) => ({
  boxShadow:
    theme.palette.mode === 'light' ? `0px 0px 0px 1px #00000010` : undefined,
  fontSize: '1.5rem',
  verticalAlign: 'top',
  width: '1.41rem',
}));
