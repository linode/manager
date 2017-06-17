import React, { Component, PropTypes } from 'react';
import { push } from 'react-router-redux';

import { Card, CardHeader } from 'linode-components/cards';
import { ConfirmModalBody } from 'linode-components/modals';
import {
  Checkbox,
  Form,
  FormGroup,
  FormSummary,
  Select,
  SubmitButton,
} from 'linode-components/forms';

import { showModal, hideModal } from '~/actions/modal';
import { restoreBackup } from '~/api/backups';
import { dispatchOrStoreErrors } from '~/api/util';


export default class BackupRestore extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errors: {},
      loading: false,
      target: props.linode.id,
      overwrite: false,
    };
  }

  onSubmit = () => {
    const { dispatch, linode, backup, linodes } = this.props;
    const { target, overwrite } = this.state;

    const toRestoreTo = linodes.linodes[target].label;

    const callback = () => dispatch(dispatchOrStoreErrors.call(this, [
      () => restoreBackup(linode.id, target, backup.id, overwrite),
      () => push(`/linodes/${toRestoreTo}`),
    ]));

    return dispatch(showModal('Confirm Backup Restore', (
      <ConfirmModalBody
        onCancel={() => dispatch(hideModal())}
        onOk={callback}
      >
        Are you sure you want to restore backups to <strong>{toRestoreTo}</strong>?
        {!overwrite ? null : (
          <span>
            &nbsp;This will destroy all disks and configs on <strong>{toRestoreTo}</strong>.
          </span>
        )}
      </ConfirmModalBody>
    )));
  }

  onChange = ({ target: { name, value, checked } }) =>
    this.setState({ [name]: name === 'overwrite' ? checked : value })

  render() {
    const { backup, linode, linodes } = this.props;
    const { errors, loading, target, overwrite } = this.state;

    if (backup.status === 'pending') {
      return null;
    }

    const otherLinodes = Object.values(linodes.linodes).filter(
      l => l.id !== linode.id && l.region.id === linode.region.id);

    const restoreTo = otherLinodes.map(
      l => <option value={l.id} key={l.id}>{l.label}</option>);

    restoreTo.splice(0, 0,
      <option value={linode.id} key={linode.id}>This Linode</option>);

    const targetLabel = target === linode.id ? 'This Linode' : linodes.linodes[target].label;

    return (
      <Card header={<CardHeader title="Restore" />}>
        <Form onSubmit={this.onSubmit}>
          <FormGroup className="row">
            <div className="col-sm-3 col-form-label">
              Restore to
            </div>
            <div className="col-sm-9">
              <Select
                value={target}
                name="target"
                onChange={this.onChange}
              >{restoreTo}</Select>
              <div>
                <small className="text-muted">
                  You can only restore to Linodes within the same region.
                </small>
              </div>
            </div>
          </FormGroup>
          <FormGroup className="row">
            <div className="offset-sm-3 col-sm-9">
              <Checkbox
                id="overwrite"
                name="overwrite"
                value={overwrite}
                checked={overwrite}
                label={<span>Destroy all disks and configs on <strong>{targetLabel}</strong></span>}
                onChange={this.onChange}
              />
            </div>
          </FormGroup>
          <FormGroup className="row">
            <div className="offset-sm-3 col-sm-9">
              <SubmitButton disabled={loading} disabledChildren="Restoring">
                Restore
              </SubmitButton>
              <FormSummary errors={errors} />
            </div>
          </FormGroup>
        </Form>
      </Card>
    );
  }
}

BackupRestore.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
  backup: PropTypes.object.isRequired,
  linodes: PropTypes.object.isRequired,
};
