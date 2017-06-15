import React from 'react';


export default function Header(props) {
  return (
    <div className="Header">
      <div className="MiniHeader">
        <div className="container">
          {props.miniHeader}
        </div>
      </div>
      <div className="MainHeader clearfix">
        <div className="container">
          {props.children}
        </div>
      </div>
    </div>
  );
}
