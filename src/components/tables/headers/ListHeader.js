import React, { PropTypes } from 'react';


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
