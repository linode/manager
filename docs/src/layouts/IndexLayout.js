import React, { PropTypes } from 'react';


export default function IndexLayout(props) {
  return (
    <div>
      {props.children}
    </div>
  );
}

IndexLayout.propTypes = {
  children: PropTypes.node,
};
