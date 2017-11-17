import PropTypes from 'prop-types';
import React from 'react';

const normalizeNumber = (v) => Math.abs(v).toFixed(2);

const convertToCurrency = (v) => (v < 0)
  ? `($${normalizeNumber(v)})`
  : `$${normalizeNumber(v)}`;

export default function DisplayCurrency(props) {
  const { value } = props;

  return (<span className="display-currency">{convertToCurrency(value)}</span>);
}

DisplayCurrency.propTypes = {
  value: PropTypes.number.isRequired,
};
