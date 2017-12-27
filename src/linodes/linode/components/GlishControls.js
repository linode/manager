import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'linode-components';

export default function GlishControls(props) {
  return (
    <div id="glish-controls" className="p-2 text-center clearfix bg-success text-white">
      <Button className="float-left mr-2 fa fa-power-off power-btn" />
      <Button className="float-left">Reboot</Button>
      <span className="align-middle">{props.message}</span>
      <Button className="float-right">Ctrl + Alt + Del</Button>
    </div>
  );
}

GlishControls.propTypes = {
  vncState: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};
