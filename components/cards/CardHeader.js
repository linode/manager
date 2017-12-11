import PropTypes from 'prop-types';
import React from 'react';

export default function CardHeader(props) {
  return (
    <header className="CardHeader clearfix">
      <h2 className="CardHeader-title float-sm-left">{props.title}</h2>
      <div className="float-sm-right">{props.nav}</div>
    </header>
  );
}

CardHeader.propTypes = {
  title: PropTypes.node,
  className: PropTypes.string,
  nav: PropTypes.node,
};
