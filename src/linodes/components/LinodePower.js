import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { Link } from 'react-router';

export class LinodePower extends Component {
  constructor() {
    super();
  }

  render() {
    const { linode, pending, cols, onPowerOn, onPowerOff, onReboot } = this.props;
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
        </div>
      );
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
        </div>
      );
    }
  }
}
