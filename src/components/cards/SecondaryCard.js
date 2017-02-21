import React, { PropTypes } from 'react';

export default function SecondaryCard(props) {
  return (
    <div className="SecondaryCard" id={props.id}>
      <header className="SecondaryCard-header clearfix">
        <h2 className="SecondaryCard-title float-sm-left">{props.title}</h2>
        <div className="float-sm-right">{props.nav}</div>
      </header>
      <div className="SecondaryCard-body">
        {props.children}
      </div>
    </div>
  );
}

SecondaryCard.propTypes = {
  title: PropTypes.node.isRequired,
  nav: PropTypes.node,
  id: PropTypes.string,
  children: PropTypes.node,
};

SecondaryCard.defaultProps = {
  className: '',
};
