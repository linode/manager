import React, { PropTypes } from 'react';


export default function TableHeaderCell(props) {
  return (<th>{props.text}</th>);
}

TableHeaderCell.propTypes = {
  text: PropTypes.string,
};
