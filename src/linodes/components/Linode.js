import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { flags, distros as distroAssets } from '~/assets';

import StatusDropdown from './StatusDropdown';
import { Checkbox } from '~/components/form';

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
      <span>{linode.distribution.vendor}</span>
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
      <span>{linode.datacenter.label}</span>
    </span>
  );
}

export function Linode(props) {
  const { linode, onSelect, isSelected } = props;
  const selectedClass = isSelected ? 'PrimaryTable-row--selected' : '';

  return (
    <tr className={`PrimaryTable-row ${selectedClass}`}>
      <td>
        <Checkbox
          className="PrimaryTable-rowSelector"
          checked={isSelected}
          onChange={() => onSelect(linode)}
        />
        <Link
          to={`/linodes/${linode.label}`}
          className="PrimaryTable-rowLabel"
          title={linode.id}
        >
          {linode.label}
        </Link>
      </td>
      <td id="ips">
        {linode.ipv4}
        <div className="text-muted">{linode.ipv6.split('/')[0]}</div>
      </td>
      <td>
        {renderDatacenterStyle(linode)}
      </td>
      <td>
        <Link to={`/linodes/${linode.label}/backups`}>
          {linode.backups.enabled ? 'View Backups' : 'Enable Backups'}
        </Link>
      </td>
      <td className="PrimaryTable-rowOptions">
        <StatusDropdown
          linode={linode}
          dispatch={props.dispatch}
          className="float-xs-right"
        />
      </td>
    </tr>
  );
}

Linode.propTypes = {
  linode: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func,
  dispatch: PropTypes.func,
};
