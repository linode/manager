import React from 'react';
import { PropTypes } from 'prop-types';


export default function TableHeaderCell(props) {
  return (<th>{props.text}</th>);
}

TableHeaderCell.propTypes = {
  text: PropTypes.string,
};
