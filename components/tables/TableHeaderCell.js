import React from 'react';
import PropTypes from 'prop-types';


export default function TableHeaderCell(props) {
  const { className, text } = props;

  return (<th className={className}>{text}</th>);
}

TableHeaderCell.propTypes = {
  text: PropTypes.string,
  className: PropTypes.string,
};

TableHeaderCell.defaultProps = {
  className: '',
};
