import capitalize from 'lodash/capitalize';
import PropTypes from 'prop-types';
import React from 'react';
import Card from 'linode-components/dist/cards/Card';
import CardHeader from 'linode-components/dist/cards/CardHeader';
import Form from 'linode-components/dist/forms/FormGroup';
import FormGroup from 'linode-components/dist/forms/FormGroup';
import SubmitButton from 'linode-components/dist/forms/SubmitButton';

import TimeDisplay from '~/components/TimeDisplay';
import Region from '~/linodes/components/Region';

import TakeSnapshot from './TakeSnapshot';


export default function BackupDetails(props) {
  const { linode, backup, dispatch } = props;

  if (!backup) {
    return null;
  }

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
    <FormGroup className="row" name="label">
      <div className="col-sm-3 row-label">Label</div>
      <div className="col-sm-9" id="label">{backup.label}</div>
    </FormGroup>
  );

  const vacant = 'In progress';

  return (
    <Card header={<CardHeader title="Backup details" />}>
      {label}
      <FormGroup className="row" name="type">
        <div className="col-sm-3 row-label">Type</div>
        <div className="col-sm-9" id="type">{capitalize(backup.type)}</div>
      </FormGroup>
      <FormGroup className="row" name="started">
        <div className="col-sm-3 row-label">Started</div>
        <div className="col-sm-9" id="started"><TimeDisplay time={backup.created} /></div>
      </FormGroup>
      <FormGroup className="row" name="finished">
        <div className="col-sm-3 row-label">Finished</div>
        <div className="col-sm-9" id="finished">
          {backup.finished ? <TimeDisplay time={backup.finished} /> : vacant}
        </div>
      </FormGroup>
      <FormGroup className="row" name="duration">
        <div className="col-sm-3 row-label">Duration</div>
        <div className="col-sm-9" id="duration">
          {backup.finished ? `(${duration} ${durationUnit})` : vacant}
        </div>
      </FormGroup>
      <FormGroup className="row" name="region">
        <div className="col-sm-3 row-label">Region</div>
        <div className="col-sm-9" id="region"><Region obj={backup} /></div>
      </FormGroup>
      <FormGroup className="row" name="config">
        <div className="col-sm-3 row-label">Config Profiles</div>
        <div className="col-sm-9" id="configs">{configs || vacant}</div>
      </FormGroup>
      <FormGroup className="row" name="disks">
        <div className="col-sm-3 row-label">Disks</div>
        <div className="col-sm-9" id="disks">{disks.length === 0 ? vacant : disks}</div>
      </FormGroup>
      <FormGroup className="row" name="space">
        <div className="col-sm-3 row-label">Space Required</div>
        <div className="col-sm-9" id="space">{disks.length === 0 ? vacant : `${space}MB`}</div>
      </FormGroup>
      {backup.type === 'snapshot' && ['failed', 'successful'].indexOf(backup.status) !== -1 ? (
        <FormGroup className="row" name="submit">
          <div className="offset-sm-3 col-sm-9">
            <Form
              onSubmit={() => TakeSnapshot.trigger(dispatch, linode)}
              analytics={{ title: 'Take Snapshot', action: 'add' }}
            >
              <SubmitButton disabledChildren="Taking snapshot">Take snapshot</SubmitButton>
            </Form>
          </div>
        </FormGroup>) : null}
    </Card>
  );
}

BackupDetails.propTypes = {
  dispatch: PropTypes.func.isRequired,
  backup: PropTypes.object.isRequired,
  linode: PropTypes.object.isRequired,
};
