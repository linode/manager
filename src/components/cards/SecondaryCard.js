import React, { PropTypes } from 'react';

export default function SecondaryCard(props) {
  return (
    <div className="SecondaryCard" id={props.id}>
      <header className="SecondaryCard-header clearfix">
        <div className="float-sm-right">{props.nav}</div>
        {props.icon ? (
          <img
            className="SecondaryCard-icon float-sm-left"
            src={props.icon}
            alt="Client thumbnail"
          />) : null}
        <h2 className="SecondaryCard-title float-sm-left">{props.title}</h2>
        {props.nav ? <div className="float-sm-right">{props.nav}</div> : null}
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
  icon: PropTypes.string,
  children: PropTypes.node,
};

SecondaryCard.defaultProps = {
  className: '',
};
