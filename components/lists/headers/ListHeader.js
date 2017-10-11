import React from 'react';
import PropTypes from 'prop-types';


export default function ListHeader(props) {
  return (
    <header className="List-header">
      {props.children}
    </header>
  );
}

ListHeader.propTypes = {
  children: PropTypes.node,
};
