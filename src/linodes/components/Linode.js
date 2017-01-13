import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';

import { flags, distros as distroAssets } from '~/assets';
import StatusDropdown from './StatusDropdown';
import Checkbox from '~/components/Checkbox';

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
    <span className={`linode-power fa ${powerIcon} float-xs-right`} onClick={powerActionF} />;
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
  if (!linode || !linode.distribution || !linode.distribution.vendor) {
    return 'Unknown';
  }

  return (
    <span className="distro-style">
      <img
        src={distroAssets[linode.distribution.vendor]
          ? distroAssets[linode.distribution.vendor] : '//placehold.it/50x50'}
        alt={linode.distribution.vendor}
        width="15" height="15"
      />
      {linode.distribution.vendor}
    </span>
  );
}

export function renderDatacenterStyle(linode) {
  return (
    <span className="datacenter-style">
      <img
        src={flags[linode.datacenter.country]
          ? flags[linode.datacenter.country] : '//placehold.it/50x50'}
        height="15" width="20" alt={linode.datacenter.label}
      />
      {linode.datacenter.label}
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

export function renderBackupStatus(linode, dashboard = false) {
  const backupWord = dashboard ? '' : 'Backup';
  const up = (letter) => {
    if (dashboard) {
      return letter.toUpperCase();
    }
    return ` ${letter}`;
  };
  if (linode.backups.enabled) {
    const lastBackup = linode.backups.last_backup;
    if (!lastBackup) {
      const nextBackup = getNextBackup(linode);
      return (
        <Link className="backup-status" to={`/linodes/${linode.label}/backups`}>
          {backupWord}{up('i')}n ~{nextBackup.fromNow(true)}
        </Link>);
    }

    const backupStatus = linode.backups.last_backup.status;
    if (backupStatus === 'running') {
      return (
        <Link className="backup-status" to={`/linodes/${linode.label}/backups`}>
          {backupWord}{up('r')}unning
        </Link>);
    }

    if (backupStatus === 'pending') {
      return (
        <Link className="backup-status" to={`/linodes/${linode.label}/backups`}>
          {backupWord}{up('p')}ending
        </Link>);
    }
    return (
      <Link to={`/linodes/${linode.label}/backups`}>
        <span className="backup-status">
          {backupWord}{up('t')}aken {moment.utc(linode.backups.last_backup).fromNow()}
        </span>
      </Link>);
  }
  return (
    <span className="backup-status">
      <span>
        <Link
          to={`/linodes/${linode.label}/backups`}
        >Enable backups</Link>
      </span>
    </span>
  );
}

function renderCard(props) {
  const { linode, onSelect, isSelected } = props;
  const select = () => onSelect(linode);
  const selectedClass = isSelected ? 'selected' : '';

  return (
    <div key={linode.id} className={`linode card ${linode.status} ${selectedClass}`}>
      <header className="header-secondary">
        <Checkbox checked={isSelected} onChange={select} />
        <div>
          <Link className="linode-label" to={`/linodes/${linode.label}`}>{linode.label}</Link>
        </div>
        <span className="float-xs-right">
          <StatusDropdown
            linode={linode}
            dispatch={props.dispatch}
          />
        </span>
      </header>
      <div className="linode-details">
        <div>{linode.ipv4}</div>
        <div className="text-muted">{linode.ipv6.split('/')[0]}</div>
        <section>
          {renderDatacenterStyle(linode)}
        </section>
        <section>
          {renderBackupStatus(linode)}
        </section>
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

  return (
    <tr className={`linode ${linode.status} ${selectedClass}`}>
      <td className="linode-checkbox">
        <Checkbox checked={isSelected} onChange={select} />
      </td>
      <td>
        <Link to={`/linodes/${linode.label}`} className="linode-label">{linode.label}</Link>
      </td>
      <td className="ips">
        {linode.ipv4}
        <div className="text-muted">{linode.ipv6.split('/')[0]}</div>
      </td>
      <td>
        {renderDatacenterStyle(linode)}
      </td>
      <td>
        {renderBackupStatus(linode)}
      </td>
      <td>
        <StatusDropdown
          linode={linode}
          dispatch={props.dispatch}
        />
      </td>
    </tr>
  );
}

renderRow.propTypes = {
  linode: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func,
  dispatch: PropTypes.func,
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
