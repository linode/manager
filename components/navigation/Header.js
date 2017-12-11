import PropTypes from 'prop-types';
import React from 'react';


export default function Header(props) {
  const { className } = props;

  return (
    <div className={`Header ${className}`}>
      {!props.infoHeader ? null : (
        <div className="MiniHeader">
          <div className="container">
            {props.infoHeader}
          </div>
        </div>
      )}
      <div className="MainHeader clearfix">
        <div className="container">
          {props.children}
        </div>
      </div>
      {!props.contextHeader ? null : (
        <div className="ContextHeader">
          <div className="container">
            {props.contextHeader}
          </div>
        </div>
      )}
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  infoHeader: PropTypes.node,
  contextHeader: PropTypes.node,
};
