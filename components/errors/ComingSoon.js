import PropTypes from 'prop-types';
import React from 'react';


export default function ComingSoon(props) {
  return (
    <div className="Error ComingSoon">
      <h1>Hang on!</h1>
      <h2>Support for {props.feature} is coming soon.</h2>
      <div className="Error-body">
        In the meantime, please use the classic <a href={`https://manager.linode.com${props.classicLink}`} target="_blank">Manager</a> to manage {props.feature}.
      </div>
    </div>
  );
}

ComingSoon.propTypes = {
  feature: PropTypes.string.isRequired,
  classicLink: PropTypes.string.isRequired,
};
