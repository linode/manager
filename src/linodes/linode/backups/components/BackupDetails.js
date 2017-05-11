import React, { PropTypes } from 'react';

import { Card, CardHeader } from 'linode-components/cards';
import { FormGroup } from 'linode-components/forms';

import TimeDisplay from '~/components/TimeDisplay';

import TakeSnapshot from './TakeSnapshot';


export default function BackupDetails(props) {
  const { linode, backup, dispatch } = props;

  const duration = Math.floor((Date.parse(backup.finished) -
                               Date.parse(backup.created)) / 1000 / 60);
  const durationUnit = duration === 1 ? 'minute' : 'minutes';
  const configs = backup.configs.map(config => <div key={config}>{config}</div>);

  // TODO: key={d.id} when disk IDs are added to API
  const disks = backup.disks.map(d =>
    <div key={d.label}>
      {d.label} ({d.filesystem}) - {d.size}MB
    </div>
  );
  const space = disks.length === 0 ? null :
                backup.disks.map(d => d.size).reduce((a, b) => a + b);

  const label = !backup.label ? null : (
    <FormGroup className="row">
      <div className="col-sm-3 row-label">Label</div>
      <div className="col-sm-9">{backup.label}</div>
    </FormGroup>
  );

  const vacant = 'In progress';

  const takeSnapshot = backup.type === 'snapshot' && backup.status !== 'pending' ?
    <TakeSnapshot linode={linode} dispatch={dispatch} /> :
    null;

  return (
    <Card header={<CardHeader title="Backup details" />}>
      {label}
      <FormGroup className="row">
        <div className="col-sm-3 row-label">Started</div>
        <div className="col-sm-9"><TimeDisplay time={backup.created} /></div>
      </FormGroup>
      <FormGroup className="row">
        <div className="col-sm-3 row-label">Finished</div>
        <div className="col-sm-9">
          {backup.finished ? <TimeDisplay time={backup.finished} /> : vacant}
        </div>
      </FormGroup>
      <FormGroup className="row">
        <div className="col-sm-3 row-label">Duration</div>
        <div className="col-sm-9">
          {backup.finished ? `(${duration} ${durationUnit})` : vacant}
        </div>
      </FormGroup>
      <FormGroup className="row">
        <div className="col-sm-3 row-label">Region Constraint</div>
        <div className="col-sm-9">{backup.region.label}</div>
      </FormGroup>
      <FormGroup className="row">
        <div className="col-sm-3 row-label">Config Profiles</div>
        <div className="col-sm-9">{configs || vacant}</div>
      </FormGroup>
      <FormGroup className="row">
        <div className="col-sm-3 row-label">Disks</div>
        <div className="col-sm-9">{disks.length === 0 ? vacant : disks}</div>
      </FormGroup>
      <FormGroup className="row">
        <div className="col-sm-3 row-label">Space required</div>
        <div className="col-sm-9">{disks.length === 0 ? vacant : `${space}MB`}</div>
      </FormGroup>
      {takeSnapshot}
    </Card>
  );
}

BackupDetails.propTypes = {
  dispatch: PropTypes.func.isRequired,
  backup: PropTypes.object.isRequired,
  linode: PropTypes.object.isRequired,
};
