import React from 'react';
import 'flag-icons/css/flag-icons.min.css';
import { Country } from './EnhancedSelect/variants/RegionSelect/utils';
import { styled } from '@mui/material/styles';

const COUNTRY_FLAG_OVERRIDES = {
  uk: 'gb',
};

interface Props {
  country: Lowercase<Country>;
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
  fontSize: '1.5rem',
  boxShadow:
    theme.palette.mode === 'light' ? `0px 0px 0px 1px #00000010` : undefined,
  verticalAlign: 'top',
  width: '1.41rem',
}));
