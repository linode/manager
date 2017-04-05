import React, { PropTypes } from 'react';


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
