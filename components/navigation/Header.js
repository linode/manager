import React, { PropTypes } from 'react';


export default function Header(props) {
  const { className } = props;

  return (
    <div className={`Header ${className}`}>
      {!props.miniHeader ? null : (
        <div className="MiniHeader">
          <div className="container">
            {props.miniHeader}
          </div>
        </div>
      )}
      <div className="MainHeader clearfix">
        <div className="container">
          {props.children}
        </div>
      </div>
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  miniHeader: PropTypes.string,
};
