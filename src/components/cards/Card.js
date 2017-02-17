import React, { PropTypes } from 'react';

import HelpButton from '../HelpButton';

export default function Card(props) {
  return (
    <div className={`Card ${props.className}`} id={props.id}>
      <header className="Card-header clearfix">
        <h2 className="Card-title float-sm-left">{props.title}</h2>
        {props.helpLink ? <HelpButton className="float-sm-left" to={props.helpLink} /> : null}
        <div className="float-sm-right">{props.nav}</div>
      </header>
      <div>
        {props.children}
      </div>
    </div>
  );
}

Card.propTypes = {
  title: PropTypes.node.isRequired,
  className: PropTypes.string,
  helpLink: PropTypes.string,
  nav: PropTypes.node,
  id: PropTypes.string,
  children: PropTypes.node,
};

Card.defaultProps = {
  className: '',
};
