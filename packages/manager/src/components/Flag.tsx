import React from 'react';
import 'flag-icons/css/flag-icons.min.css';
import { Country } from './EnhancedSelect/variants/RegionSelect/utils';
import { styled } from '@mui/material/styles';
import { isPropValid } from 'src/utilities/isPropValid';

const COUNTRY_FLAG_OVERRIDES = {
  uk: 'gb',
};

const COUNTRIES_TO_OUTLINE = ['jp', 'id', 'sg'];

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
      hasOutline={COUNTRIES_TO_OUTLINE.includes(country)}
    />
  );
};

const StyledFlag = styled('div', {
  label: 'StyledFlag',
  shouldForwardProp: (prop) => isPropValid(['hasOutline'], prop),
})<{ hasOutline: boolean }>(({ theme, ...props }) => ({
  fontSize: '1.5rem',
  outline:
    props.hasOutline && theme.palette.mode === 'light'
      ? `1px solid ${theme.color.border3}`
      : 'none',
  verticalAlign: 'top',
  width: '1.41rem',
}));
