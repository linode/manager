import React from 'react';
import 'flag-icons/css/flag-icons.min.css';

const countryFlagOverrides = {
  uk: 'gb',
};

interface Props {
  /** expects a iso code of a country - `us`, `ca`, etc... */
  country: string;
}

export const Flag = ({ country }: Props) => {
  return (
    <div
      className={`fi fi-${countryFlagOverrides[country] ?? country} fi-xx`}
      style={{ fontSize: '1.5rem', verticalAlign: 'top' }}
    />
  );
};
