import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Country } from './EnhancedSelect/variants/RegionSelect/utils';
import 'flag-icons/css/flag-icons.min.css';

const COUNTRY_FLAG_OVERRIDES = {
  uk: 'gb',
};

const COUNTRIES_TO_OUTLINE = ['jp', 'id', 'sg'];

interface Props {
  country: Lowercase<Country>;
}

const useStyles = makeStyles()((theme) => ({
  root: {
    fontSize: '1.5rem',
    verticalAlign: 'top',
    width: '1.41rem',
  },
  outline: {
    outline: `1px solid ${theme.color.border3}`,
  },
}));

/**
 * Flag icons are provided by the [flag-icons](https://www.npmjs.com/package/flag-icon) package
 */
export const Flag = (props: Props) => {
  const { classes, cx } = useStyles();
  const country = props.country.toLowerCase();

  return (
    <div
      className={cx(
        `fi fi-${COUNTRY_FLAG_OVERRIDES[country] ?? country} fi-xx`,
        classes.root,
        {
          [classes.outline]: COUNTRIES_TO_OUTLINE.includes(country),
        }
      )}
    />
  );
};
