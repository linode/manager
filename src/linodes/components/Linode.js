import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { flags, distros as distroAssets } from '~/assets';
import { LinodeStatesReadable } from '~/constants';
import moment from 'moment';

function renderPowerButton(props) {
  const { linode, onPowerOn, onReboot } = props;

  let [powerIcon, powerAction] = ['', () => {}];
  if (linode.status === 'offline') {
    [powerIcon, powerAction] = ['fa-power-off', onPowerOn];
  } else if (linode.status === 'running') {
    [powerIcon, powerAction] = ['fa-refresh', onReboot];
  }
  const powerActionF = () => powerAction(linode);

  return powerIcon === '' ? <span /> :
    <button className={`btn btn-cancel linode-power fa ${powerIcon} pull-right`} onClick={powerActionF} />;
}

renderPowerButton.propTypes = {
  linode: PropTypes.object.isRequired,
  onPowerOn: PropTypes.func,
  onReboot: PropTypes.func,
};

export function renderPlanStyle(s) {
  if (!s || !s.label) return null;

  const plan = s.label.split(' ');
  return `${plan[0]} ${parseInt(plan[1], 10) / 1024}G`;
}

export function renderDistroStyle(linode) {
  if (!linode || !linode.distribution || !linode.distribution.vendor) return null;

  return (
    <span className="distro-style">
      {linode.distribution.vendor}
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
        src={flags[linode.datacenter.country]
          ? flags[linode.datacenter.country] : '//placehold.it/50x50'}
        height="15" width="20" alt={linode.datacenter.label}
      />
    </span>
  );
}

export function getNextBackup(linode) {
  const windows = {
    W0: moment().hour(0),
    W2: moment().hour(2),
    W4: moment().hour(4),
    W6: moment().hour(6),
    W8: moment().hour(8),
    W10: moment().hour(10),
    W12: moment().hour(12),
    W14: moment().hour(14),
    W16: moment().hour(16),
    W18: moment().hour(18),
    W20: moment().hour(20),
    W22: moment().hour(22),
  };
  if (!linode.backups || !linode.backups.schedule) {
    return moment.invalid();
  }
  const nextBackup = windows[linode.backups.schedule.window];
  if (nextBackup < moment()) {
    nextBackup.add(1, 'day');
  }
  return nextBackup;
}

export function renderBackupStatus(linode) {
  if (linode.backups.enabled) {
    const lastBackup = linode.backups.last_backup;
    if (!lastBackup) {
      const nextBackup = getNextBackup(linode);
      return (
        <span className="backup-status">
          In ~{nextBackup.fromNow(true)}
        </span>);
    }

    const backupStatus = linode.backups.last_backup.status;
    if (backupStatus === 'running') {
      return (
        <span className="backup-status">
          Running
        </span>);
    }

    if (backupStatus === 'pending') {
      return (
        <span className="backup-status">
          Pending
        </span>);
    }
    return (
      <span className="backup-status">
        Taken {moment.utc(linode.backups.last_backup).fromNow()}
      </span>);
  }
  return (
    <span className="backup-status">
      <span>
        <Link
          to={`/linodes/${linode.id}/backups`}
        >Enable backups</Link>
      </span>
    </span>
  );
}

function renderCard(props) {
  const { linode, onSelect, isSelected } = props;
  const select = () => onSelect(linode);
  const selectedClass = isSelected ? 'selected' : '';

  const checkbox = <input type="checkbox" checked={isSelected} onChange={select} />;

  return (
    <div key={linode.id} className={`linode card ${linode.status} ${selectedClass}`}>
      <header className="header-secondary">
        {checkbox}
        <Link to={`/linodes/${linode.id}`}>{linode.label}</Link>
        <span
          className={`linode-status ${linode.status}`}
        >{LinodeStatesReadable[linode.status]}</span>
        {renderPowerButton(props)}
      </header>
      <div className="linode-details clearfix">
        <div className="form-group row">
          <div className="col-sm-12 content-col ip-addresses">
            <span className="label-col">IP Addresses</span>
            <div>{linode.ipv4.address}</div>
            <div>{linode.ipv6.range}</div>
          </div>
        </div>
        <div className="form-group row">
          <div className="col-sm-6">
            <span className="label-col">Datacenter</span>
            <div className="content-col">{renderDatacenterStyle(linode)}</div>
          </div>
          <div className="col-sm-6">
            <span className="label-col">Backup</span>
            <div className="content-col backup-status">
              {renderBackupStatus(linode)}
            </div>
          </div>
        </div>
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
    <tr className={`linode ${linode.status} ${selectedClass}`}>
      <td>{checkbox}</td>
      <td>
        <Link to={`/linodes/${linode.id}`} className="linode-label">{linode.label}</Link>
      </td>
      <td>
        <span
          className={`linode-status ${linode.status}`}
        >{LinodeStatesReadable[linode.status]}</span>
      </td>
      <td>
        {linode.ipv4.address}, {linode.ipv6.range}
      </td>
      <td>
        {renderDatacenterStyle(linode)}
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
