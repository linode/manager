import { Box } from '@linode/ui';
import 'flag-icons/css/flag-icons.min.css';
import { styled } from '@mui/material/styles';
import React from 'react';

import type { Country } from '@linode/api-v4';
import type { BoxProps } from '@linode/ui';

const COUNTRY_FLAG_OVERRIDES = {
  uk: 'gb',
};

// Countries that need a css border in the Flag component
const COUNTRIES_WITH_BORDERS = [
  'jp', // japan
  'cy', // cyprus
  'dz', // algeria
  'bh', // bahrain
  'bg', // bulgaria
  'cl', // chile
  'hr', // croatia
  'cz', // czech republic
  'fi', // finland
  'ge', // georgia
  'ee', // estonia
  'id', // indonesia
  'mt', // malta
  'mg', // madagascar
  'mx', // mexico
  'mc', // monaco
  'np', // nepal
  'om', // oman
  'pk', // pakistan
  'pa', // panama
  'pl', // poland
  'qa', // qatar
  'ru', // russia
  'sm', // san marino
  'rs', // serbia
  'sg', // singapore
  'sk', // slovakia
  'si', // slovenia
  'kr', // south korea
  'vg', // virgin islands
  'uy', // uruguay
];

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
      hasBorder={COUNTRIES_WITH_BORDERS.includes(country.toLowerCase())}
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

const StyledFlag = styled(Box, { label: 'StyledFlag' })<{
  hasBorder: boolean;
}>(({ theme, hasBorder }) => ({
  boxShadow:
    theme.palette.mode === 'light' ? `0px 0px 0px 1px #00000010` : undefined,
  fontSize: '1.5rem',
  verticalAlign: 'top',
  width: '1.41rem',
  ...(hasBorder && {
    border: `1px solid ${theme.tokens.alias.Border.Normal}`,
  }),
}));
