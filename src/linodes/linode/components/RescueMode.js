import _ from 'lodash';
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
import DeviceSelect from './DeviceSelect';
import { AVAILABLE_DISK_SLOTS } from '~/constants';


export default class RescueMode extends Component {
  constructor(props) {
    super(props);

    this.state = {
      devices: {},
      errors: {},
      loading: false,
    };
  }

  componentWillMount() {
    // sort by filesystem to put rescue disks in "ext*", "raw", "swap" order naturally
    const sortedDisks = _.sortBy(this.props.linode._disks.disks, ['filesystem', 'id']);
    const someDisks = sortedDisks.slice(0, AVAILABLE_DISK_SLOTS.length - 1);
    const devices = someDisks.reduce(function (devices, disk, index) {
      return { ...devices, [AVAILABLE_DISK_SLOTS[index]]: disk.id };
    }, {});
    this.setState({ devices });
  }

  onSubmit = () => {
    const { dispatch, linode } = this.props;
    const { devices } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => rescueLinode(linode.id, DeviceSelect.format(devices)),
    ]));
  }

  render() {
    const { linode: { _disks: { disks }, _volumes: { volumes } } } = this.props;
    const { errors, loading, devices } = this.state;

    return (
      <Card header={<CardHeader title="Rescue mode" />} className="full-height">
        <Form
          onSubmit={this.onSubmit}
          title="Rescue mode"
          className="RescueMode-form"
        >
          {AVAILABLE_DISK_SLOTS.map((slot, i) => slot === 'sdh' ? null : (
            <DeviceSelect
              key={i}
              disks={disks}
              volumes={volumes}
              configuredDevices={devices}
              slot={slot}
              labelClassName="col-sm-3"
              fieldClassName="col-sm-9"
              onChange={({ target: { value } }) =>
                this.setState((state) => ({ devices: { ...state.devices, [slot]: value } }))}
              errors={errors}
              noVolumes
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
