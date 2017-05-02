import React, { Component, PropTypes } from 'react';

import { Card, CardHeader } from 'linode-components/cards';
import { Form, FormGroup, SubmitButton } from 'linode-components/forms';

import { rescueLinode } from '~/api/linodes';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';
import {
  getDiskSlots,
  renderDiskSlot,
  AVAILABLE_DISK_SLOTS,
} from '~/linodes/linode/settings/layouts/EditConfigPage.js';


export default class RescueMode extends Component {
  constructor(props) {
    super(props);

    this.renderDiskSlot = renderDiskSlot.bind(this);
    const diskSlots = getDiskSlots.apply(this, [false]);
    this.state = {
      diskSlots,
      errors: {},
      loading: false,
    };
  }

  onSubmit = async () => {
    const { diskSlots } = this.state;
    const { dispatch, linode } = this.props;

    const disks = {};

    if (diskSlots) {
      diskSlots.forEach((slotId, i) => {
        disks[AVAILABLE_DISK_SLOTS[i]] = slotId;
      });

      await dispatch(dispatchOrStoreErrors.apply(this, [
        [() => rescueLinode(linode.id, { disks })],
      ]));
    }
  }

  renderDiskSlotNoEdit = (device, index) => {
    const { disks } = this.props.linode._disks;

    return (
      <FormGroup className="row disk-slot" key={index}>
        <label className="col-sm-2 row-label">
          /dev/{AVAILABLE_DISK_SLOTS[index]}
        </label>
        <div className="col-sm-10">
          {disks[device].label}
        </div>
      </FormGroup>
    );
  }

  render() {
    const { linode } = this.props;
    const { diskSlots, errors, loading } = this.state;

    const showDisks = linode && linode._disks ? Object.values(linode._disks.disks).filter(
      d => d.filesystem !== 'swap').length > 1 : false;

    let slots = null;
    if (showDisks && diskSlots) {
      slots = diskSlots.map(this.renderDiskSlot);
    } else if (diskSlots) {
      slots = diskSlots.map(this.renderDiskSlotNoEdit);
    }

    return (
      <Card header={<CardHeader title="Rescue mode" />}>
        <Form className="RescueMode-form" onSubmit={this.onSubmit}>
          {slots}
          <FormGroup className="row disk-slot">
            <label className="col-sm-2 row-label">
              /dev/sdh
            </label>
            <div className="col-sm-10">Finnix Media</div>
          </FormGroup>
          <FormGroup className="row">
            <div className="offset-sm-2 col-sm-10">
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
