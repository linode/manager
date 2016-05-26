import React, { PropTypes } from 'react';

export function LinodePower({
  linode,
  pending,
  cols,
  onPowerOn,
  onPowerOff,
  onReboot,
}) {
  if (pending) {
    return (<div className={`${cols ? 'text-centered' : 'pull-right'}`}>
      <i className="fa fa-spinner fa-spin"></i>
    </div>);
  }
  switch (linode.state) {
    case 'running':
      return (
        <div className="power">
          <div className={cols ? 'col-md-6' : ''}>
            <button onClick={onPowerOff} className="btn btn-default btn-block btn-sm">
              <i className="fa fa-power-off"></i>
              <span className="hover">Stop</span>
              &nbsp;
            </button>
          </div>
          <div className={cols ? 'col-md-6' : ''}>
            <button onClick={onReboot} className="btn btn-default btn-block btn-sm">
              <i className="fa fa-refresh"></i>
              <span className="hover">Reboot</span>
              &nbsp;
            </button>
          </div>
        </div>);
    default:
      return (
        <div className="power">
          <div className={cols ? 'col-md-12' : ''}>
            <button onClick={onPowerOn} className="btn btn-default btn-block btn-sm">
              <i className="fa fa-power-off"></i>
              <span className="hover">Start</span>
              &nbsp;
            </button>
          </div>
        </div>);
  }
}

LinodePower.propTypes = {
  linode: PropTypes.object.isRequired,
  pending: PropTypes.bool.isRequired,
  cols: PropTypes.number.isRequired,
  onPowerOn: PropTypes.func,
  onPowerOff: PropTypes.func,
  onReboot: PropTypes.func,
};
