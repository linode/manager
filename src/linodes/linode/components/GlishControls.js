import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'linode-components';

export default function GlishControls(props) {
  let bgColor = 'bg-warning';
  if (!props.powered) {
    bgColor = 'bg-danger';
  }
  if (props.connected) {
    bgColor = 'bg-success';
  }

  return (
    <div id="glish-controls" className={`p-2 text-center clearfix text-white ${bgColor}`}>
      <Button className="float-left mr-2 fa fa-power-off power-btn" />
      <Button className="float-left">Reboot</Button>
      <span className="align-middle">{props.message}</span>
      <Button className="float-right">Ctrl + Alt + Del</Button>
    </div>
  );
}

GlishControls.propTypes = {
  message: PropTypes.string.isRequired,
  powered: PropTypes.bool.isRequired,
  connected: PropTypes.bool.isRequired,
};
