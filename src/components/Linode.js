import React, { Component } from 'react';
import { Link } from 'react-router';
import { LinodePower } from './LinodePower';
import { LinodeStatesReadable, LinodeStates } from '../constants';

export class Linode extends Component {
  renderCard() {
    const { linode, onSelect, isSelected } = this.props;
    const select = () => onSelect(linode);
    const selectedClass = isSelected ? "selected" : "";

    const checkbox = isSelected ?
        <input type="checkbox" checked="checked" onClick={select} /> :
        <input type="checkbox" onClick={select} />;

    return (
      <div className={`linode card ${linode.state} ${selectedClass}`}>
        <div className="linode-header">
          <label className="li-checkbox">
            {checkbox}
            <span />{/* do not delete */}
          </label>
          <Link to={`/linodes/${linode.id}`} className="linode-label">{linode.label}</Link>
          <span className={`linode-status ${linode.state}`}>{LinodeStatesReadable[linode.state]}</span>
          <a href="/lish" className="linode-lish pull-right">Lish</a>
        </div>
        <ul className="linode-details list-unstyled">
          <li>
            <span className="fa fa-server"></span>
            1 GB RAM / 20 GB SSD / 1 Core
          </li>
          <li>
            <span className="fa fa-link"></span>
            {linode.ip_addresses.public.ipv4[0]}
          </li>
          <li>
            <span className="fa fa-globe"></span>
            {linode.datacenter.label}
          </li>
          <li>
            <span className="fa fa-database"></span>
            Last backup: 1 hour ago
          </li>
        </ul>
        <span className="card-type fa fa-th" />
      </div>
    );
  }

  renderRow() {
    const { linode, onSelect, isSelected } = this.props;
    const select = () => onSelect(linode);
    const selectedClass = isSelected ? "selected" : "";

    const checkbox = isSelected ?
        <input type="checkbox" checked="checked" onClick={select} /> :
        <input type="checkbox" onClick={select} />;

    return (
      <tr className={`linode row ${linode.state} ${selectedClass}`}>
        <td>
          <label className="li-checkbox">
            {checkbox}
            <span />
          </label>
        </td>
        <td>
          <Link to={`/linodes/${linode.id}`} className="linode-label">{linode.label}</Link>
        </td>
        <td>
          <span className={`linode-status ${linode.state}`}>{LinodeStatesReadable[linode.state]}</span>
        </td>
        <td>
          1 GB RAM / 20 GB SSD / 1 Core
        </td>
        <td>
          {linode.ip_addresses.public.ipv4[0]}
        </td>
        <td>
          {linode.datacenter.label}
        </td>
        <td>
          Last backup: 1 hour ago
        </td>
        <td>
          <a href="/lish" className="linode-lish">Lish</a>
        </td>
      </tr>
    );
  }
  
  render() {
    const { isCard } = this.props;
    return isCard ? this.renderCard() : this.renderRow();
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
