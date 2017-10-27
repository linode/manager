import React from 'react';
import 'prop-types';


export default function ListBody(props) {
  return (
    <div className="List-body">
      {props.children}
    </div>
  );
}

ListBody.propTypes = {
  children: PropTypes.node,
};
