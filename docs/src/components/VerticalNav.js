import React, { PropTypes } from 'react';


export default function VerticalNav(props) {
  const { children } = props;

  return (
    <div className="VerticalNav">
      {children}
    </div>
  );
}

VerticalNav.propTypes = {
  children: PropTypes.node,
};
