import React, { PropTypes } from 'react';

import { HelpButton } from 'linode-components/buttons';


export default function CardHeader(props) {
  return (
    <header className="CardHeader clearfix">
      <h2 className="CardHeader-title float-sm-left">{props.title}</h2>
      {props.helpLink ? <HelpButton className="float-sm-left" to={props.helpLink} /> : null}
      <div className="float-sm-right">{props.nav}</div>
    </header>
  );
}

CardHeader.propTypes = {
  title: PropTypes.node,
  className: PropTypes.string,
  helpLink: PropTypes.string,
  nav: PropTypes.node,
};
