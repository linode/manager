import React, { PropTypes } from 'react';

import { HelpButton } from './HelpButton';

export default function Card(props) {
  return (
    <section className={`card ${props.className}`}>
      <header>
        <h2>{props.title}</h2>
        {props.helpLink ? <HelpButton to={props.helpLink} /> : null}
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
};

Card.defaultProps = {
  className: '',
};
