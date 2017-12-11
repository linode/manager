import PropTypes from 'prop-types';
import React from 'react';

const normalizeNumber = (v) => Math.abs(v).toFixed(2);

export const formatCurrency = (v) => (v < 0)
  ? `($${normalizeNumber(v)})`
  : `$${normalizeNumber(v)}`;

export default function Currency(props) {
  const { value } = props;

  return (<span className="currency">{formatCurrency(value)}</span>);
}

Currency.propTypes = {
  value: PropTypes.number.isRequired,
};
