import React, { Component, PropTypes } from 'react';

import { Card, CardHeader } from 'linode-components/cards';
import {
  Form,
  FormGroup,
  FormSummary,
  SubmitButton,
} from 'linode-components/forms';

import { rescueLinode } from '~/api/linodes';
import { dispatchOrStoreErrors } from '~/api/util';
import DiskSelect from './DiskSelect';
import { AVAILABLE_DISK_SLOTS } from '~/constants';


export default class RescueMode extends Component {
  constructor(props) {
    super(props);

    this.state = {
      disks: {},
      errors: {},
      loading: false,
    };

    AVAILABLE_DISK_SLOTS.forEach(slot => {
      this.state.disks[slot];
    });
  }

  onSubmit = () => {
    const { dispatch, linode } = this.props;
    const { disks } = this.state;

    const disksWithDiskIdOnly = {};
    Object.keys(disks).forEach(function (key) {
      disksWithDiskIdOnly[key] = disks[key] ? disks[key].disk_id : null;
    });

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => rescueLinode(linode.id, disksWithDiskIdOnly),
    ]));
  }

  render() {
    const { linode: { _disks: { disks } } } = this.props;
    const { errors, loading, disks: configuredDisks } = this.state;

    return (
      <Card header={<CardHeader title="Rescue mode" />} className="full-height">
        <Form
          onSubmit={this.onSubmit}
          title="Rescue mode"
          className="RescueMode-form"
        >
          {AVAILABLE_DISK_SLOTS.map((slot, i) => slot === 'sdh' ? null : (
            <DiskSelect
              key={i}
              disks={disks}
              configuredDisks={configuredDisks}
              slot={slot}
              labelClassName="col-sm-3"
              fieldClassName="col-sm-9"
              onChange={({ target: { value, name } }) =>
                this.setState({ disks: { ...this.state.disks, [name]: value } })}
              errors={errors}
            />
          ))}
          <FormGroup className="row">
            <label className="col-sm-3 row-label">/dev/sdh</label>
            <div className="col-sm-9">Finnix Media</div>
          </FormGroup>
          <FormGroup className="row">
            <div className="offset-sm-3 col-sm-9">
              <SubmitButton
                disabled={loading}
                disabledChildren="Rebooting"
              >Reboot</SubmitButton>
              <FormSummary errors={errors} success="Rebooting into rescue mode." />
            </div>
          </FormGroup>
        </Form>
      </Card>
    );
  }
}

RescueMode.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
};
