import React from 'react';
import 'prop-types';


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
