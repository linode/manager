import React, { Component, PropTypes } from 'react';

import { Card, CardHeader } from 'linode-components/cards';
import { Form, FormGroup, SubmitButton } from 'linode-components/forms';

import { rescueLinode } from '~/api/linodes';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';
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

    return dispatch(dispatchOrStoreErrors.apply(this, [
      [() => rescueLinode(linode.id, disks)],
    ]));
  }

  render() {
    const { linode: { _disks: { disks } } } = this.props;
    const { errors, loading, disks: configuredDisks } = this.state;

    return (
      <Card header={<CardHeader title="Rescue mode" />} className="full-height">
        <Form className="RescueMode-form" onSubmit={this.onSubmit}>
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
