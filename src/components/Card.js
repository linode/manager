import React, { PropTypes } from 'react';

import { HelpButton } from './HelpButton';

export default function Card(props) {
  return (
    <section className={`card ${props.className}`}>
      <header className="clearfix">
        <h2 className="float-sm-left">{props.title}</h2>
        {props.helpLink ? <HelpButton className="float-sm-left" to={props.helpLink} /> : null}
        <div className="float-sm-right">{props.nav}</div>
      </header>
      <div className="card-block">
        {props.children}
      </div>
    </section>
  );
}

Card.propTypes = {
  title: PropTypes.node.isRequired,
  className: PropTypes.string,
  helpLink: PropTypes.string,
  children: PropTypes.node,
  nav: PropTypes.node,
};

Card.defaultProps = {
  className: '',
};
