import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { LinodeStatesReadable } from '~/constants';
import moment from 'moment';

function renderPowerButton(props) {
  const { linode, onPowerOn, onReboot } = props;

  let [powerIcon, powerAction] = ['', null];
  if (linode.state === 'offline') {
    [powerIcon, powerAction] = ['fa-power-off', onPowerOn];
  } else if (linode.state === 'running') {
    [powerIcon, powerAction] = ['fa-refresh', onReboot];
  }
  const powerActionF = () => powerAction(linode);

  return powerIcon === '' ? <span /> :
    <span className={`linode-power fa ${powerIcon} pull-right`} onClick={powerActionF} />;
}

renderPowerButton.propTypes = {
  linode: PropTypes.object.isRequired,
  onPowerOn: PropTypes.func,
  onReboot: PropTypes.func,
};

function renderBackupStatus(linode) {
  return (
    <span className="backup-status">
      {linode.backups.enabled
        ?
        <span>
          Last backup: {moment(linode.backups.last_backup).fromNow()}
        </span>
        :
        <span>
          <Link
            to={`/linodes/${linode.id}/backups`}
          >Enable backups</Link>
        </span>}
    </span>
  );
}

function renderCard(props) {
  const { linode, onSelect, isSelected } = props;
  const select = () => onSelect(linode);
  const selectedClass = isSelected ? 'selected' : '';

  const checkbox = isSelected ?
    <input type="checkbox" checked="checked" onChange={select} /> :
    <input type="checkbox" onChange={select} />;

  return (
    <div className={`linode card ${linode.state} ${selectedClass}`}>
      <div className="linode-header">
        {checkbox}
        <Link to={`/linodes/${linode.id}`} className="linode-label">{linode.label}</Link>
        <span
          className={`linode-status ${linode.state}`}
        >{LinodeStatesReadable[linode.state]}</span>
        {renderPowerButton(props)}
      </div>
      <div className="linode-details">
        <ul className="list-unstyled">
          <li>
            <span className="fa fa-link"></span>
            <span>{linode.ip_addresses['public'].ipv4[0]}</span>
          </li>
          <li>
            <span className="fa fa-link invisible"></span>
            <span>{linode.ip_addresses['public'].ipv6}</span>
          </li>
          <li>
            <span className="fa fa-globe"></span>
            <span>{linode.datacenter.label}</span>
          </li>
          <li>
            <span className="fa fa-database"></span>
            {renderBackupStatus(linode)}
          </li>
        </ul>
      </div>
      <span className="card-type fa fa-th" />
    </div>
  );
}

renderCard.propTypes = {
  linode: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
  isSelected: PropTypes.bool.isRequired,
};

function renderRow(props) {
  const { linode, onSelect, isSelected } = props;
  const select = () => onSelect(linode);
  const selectedClass = isSelected ? 'selected' : '';

  const checkbox = isSelected ?
    <input type="checkbox" checked="checked" onClick={select} /> :
    <input type="checkbox" onClick={select} />;

  return (
    <tr className={`linode row ${linode.state} ${selectedClass}`}>
      <td>{checkbox}</td>
      <td>
        <Link to={`/linodes/${linode.id}`} className="linode-label">{linode.label}</Link>
      </td>
      <td>
        <span
          className={`linode-status ${linode.state}`}
        >{LinodeStatesReadable[linode.state]}</span>
      </td>
      <td>
        {linode.ip_addresses['public'].ipv4[0]}, {linode.ip_addresses['public'].ipv6}
      </td>
      <td>
        {linode.datacenter.label}
      </td>
      <td>
        {renderBackupStatus(linode)}
      </td>
      <td>
        {renderPowerButton(props)}
      </td>
    </tr>
  );
}

renderRow.propTypes = {
  linode: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func,
};

export function Linode(props) {
  const { isCard } = props;
  return isCard ? renderCard(props) : renderRow(props);
}

Linode.propTypes = {
  isCard: PropTypes.bool,
  ...renderPowerButton.propTypes,
  ...renderCard.propTypes,
  ...renderRow.propTypes,
};

Linode.defaultProps = { isCard: true };
