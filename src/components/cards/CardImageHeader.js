import React, { PropTypes } from 'react';


export default function CardImageHeader(props) {
  return (
    <header className="CardImageHeader clearfix">
      {props.icon ? (
        <img
          className={`CardImageHeader-icon float-sm-left ${props.iconClass}`}
          src={props.icon}
          alt="Client thumbnail"
        />) : null}
      <h2 className="CardImageHeader-title float-sm-left">{props.title}</h2>
      {props.nav ? <div className="float-sm-right">{props.nav}</div> : null}
    </header>
  );
}

CardImageHeader.propTypes = {
  icon: PropTypes.string,
  iconClass: PropTypes.string,
  title: PropTypes.string,
  nav: PropTypes.node,
};

