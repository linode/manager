import React, { Component } from 'react';
import { Link } from 'react-router';
import { LinodePower } from './LinodePower';
import { LinodeStatesReadable, LinodeStates } from '../constants';

export class Linode extends Component {
  render() {
    const { linode, onSelect } = this.props;
    const pending = LinodeStates.pending.indexOf(linode.state) !== -1;
    const select = () => onSelect(linode);

    const checkbox = !linode._isSelected ?
      <input type="checkbox// " onClick={select} /> :
      <input type="checkbox" onClick={select}
       checked="checked"/>;

    return (
      <div className={`linode card ${linode.state}`}>
        <div className="linode-header">
          <label className="li-checkbox">
            { checkbox }
            <span />
          </label>
          <Link to={`/linodes/${linode.id}`} className="linode-label">{linode.label}</Link>
          <span className={`linode-status ${linode.state}`}>{LinodeStatesReadable[linode.state]}</span>
          <a href="/lish" target="_blank" className="linode-lish pull-right">Lish</a>
        </div>
        <table className="linode-details">
          <tbody>
            <tr>
              <td><span className="fa fa-server"></span></td>
              <td>1 GB RAM / 20 GB SSD / 1 Core</td>
            </tr>
            <tr>
              <td><span className="fa fa-link"></span></td>
              <td>{linode.ip_addresses.public.ipv4[0]}</td>
            </tr>
            <tr>
              <td><span className="fa fa-globe"></span></td>
              <td>{linode.datacenter.label}</td>
            </tr>
            <tr>
              <td><span className="fa fa-database"></span></td>
              <td>Last backup: 1 hour ago</td>
            </tr>
          </tbody>
        </table>
        <span className="card-type fa fa-th" />
      </div>
    );
  }
}

export class NewLinode extends Component {
  render() {
    return (
      <div className="card new-linode">
        <button className="btn btn-success">
          <i className="fa fa-plus" style={{marginLeft: '1rem'}}></i>
        </button>
      </div>
    );
  }
}
