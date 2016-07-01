import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { flags, distros as distroAssets } from '~/assets';
import {
  LinodeStatesReadable,
  countryMap,
} from '~/constants';
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

export function renderPlanStyle(linode) {
  const plan = linode.services.linode.split(' ');

  return `${plan[0]} ${plan[1] / 1024}G`;
}

export function renderDistroStyle(linode) {
  return (
    <span className="distro-style">
      {linode.distribution.label}
      <img
        src={distroAssets[linode.distribution.vendor]
          ? distroAssets[linode.distribution.vendor] : '//placehold.it/50x50'}
        alt={linode.distribution.vendor}
        width="12" height="12"
      />
    </span>
  );
}

export function renderDatacenterStyle(linode) {
  return (
    <span className="datacenter-style">
      {linode.datacenter.label}
      <img
        src={flags[countryMap[linode.datacenter.id]]
          ? flags[countryMap[linode.datacenter.id]] : '//placehold.it/50x50'}
        height="15" width="20" alt={linode.datacenter.label}
      />
    </span>
  );
}

export function renderBackupStatus(linode) {
  return (
    <span className="backup-status">
      {linode.backups.enabled
        ?
        <span>
          {moment(linode.backups.last_backup).fromNow()}
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

  const checkbox = <input type="checkbox" checked={isSelected} onChange={select} />;

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
            <span>{renderDatacenterStyle(linode)}</span>
          </li>
          <li>
            <span className="fa fa-database"></span>
            {linode.backups.enabled ? 'Last backup: ' : null}
            {renderBackupStatus(linode)}
          </li>
        </ul>
      </div>
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

  const checkbox = <input type="checkbox" checked={isSelected} onClick={select} />;

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
        {renderDatacenterStyle(linode)}
      </td>
      <td>
        {linode.backups.enabled ? 'Last backup: ' : null}
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
  const { isRow } = props;
  return isRow ? renderRow(props) : renderCard(props);
}

Linode.propTypes = {
  isRow: PropTypes.bool,
  ...renderPowerButton.propTypes,
  ...renderCard.propTypes,
  ...renderRow.propTypes,
};

Linode.defaultProps = { isRow: true };
