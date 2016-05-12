import React, { Component } from 'react';
import { Link } from 'react-router';
import { LinodePower } from './LinodePower';
import { LinodeStatesReadable, LinodeStates } from '~/constants';

export class Linode extends Component {
  renderPowerButton() {
    const { linode, powerOn, reboot } = this.props;

    let [powerIcon, powerAction] = ["", () => {}];
    if (linode.state == "offline") {
      [powerIcon, powerAction] = ["fa-power-off", powerOn];
    } else if (linode.state == "running") {
      [powerIcon, powerAction] = ["fa-refresh", reboot];
    }
    const powerActionF = () => powerAction(linode);

    return powerIcon == "" ? <span /> :
        <span className={`linode-power fa ${powerIcon} pull-right`} onClick={powerActionF} />;
  }
  
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
          {this.renderPowerButton()}
        </div>
        <div className="linode-details">
          <ul className="list-unstyled">
            <li>
              <span className="fa fa-link"></span>
              {linode.ip_addresses.public.ipv4[0]}
            </li>
            <li>
              <span className="fa fa-link invisible"></span>
              {linode.ip_addresses.public.ipv6}
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
        </div>
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
          {linode.ip_addresses.public.ipv4[0]}, {linode.ip_addresses.public.ipv6}
        </td>
        <td>
          {linode.datacenter.label}
        </td>
        <td>
          Last backup: 1 hour ago
        </td>
        <td>
          {this.renderPowerButton()}
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
