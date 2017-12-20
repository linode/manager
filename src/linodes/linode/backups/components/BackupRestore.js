import pickBy from 'lodash/pickBy';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { push } from 'react-router-redux';

import { Card, CardHeader } from 'linode-components';
import {
  Checkbox,
  Form,
  FormGroup,
  FormSummary,
  SubmitButton,
} from 'linode-components';
import { onChange } from 'linode-components';
import { ConfirmModalBody } from 'linode-components';

import { showModal, hideModal } from '~/actions/modal';
import { restoreBackup } from '~/api/ad-hoc/backups';
import { dispatchOrStoreErrors } from '~/api/util';
import { LinodeSelect } from '~/linodes/components';


export default class BackupRestore extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errors: {},
      loading: false,
      target: props.linode.id,
      overwrite: false,
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, linode, backup, linodes } = this.props;
    const { target, overwrite } = this.state;

    const toRestoreTo = linodes.linodes[target].label;

    const callback = () => dispatch(dispatchOrStoreErrors.call(this, [
      () => restoreBackup(linode.id, target, backup.id, overwrite),
      () => push(`/linodes/${toRestoreTo}`),
    ]));

    const title = 'Confirm Backup Restore';
    return dispatch(showModal(title, (
      <ConfirmModalBody
        onCancel={() => dispatch(hideModal())}
        onSubmit={callback}
        analytics={{ title }}
      >
        <div>
          Are you sure you want to restore backups to <strong>{toRestoreTo}</strong>?
          {!overwrite ? null : (
            <span>
              &nbsp;This will destroy all disks and configs on <strong>{toRestoreTo}</strong>.
            </span>
          )}
        </div>
      </ConfirmModalBody>
    )));
  }

  render() {
    const { backup, linode, linodes } = this.props;
    const { errors, loading, target, overwrite } = this.state;

    if (!backup || backup.status === 'pending') {
      return null;
    }

    const linodesInRegion = pickBy(linodes.linodes, l =>
      l.id !== linode.id && l.region === linode.region);

    const targetLabel = !target || target === linode.id ?
      'This Linode' :
      linodes.linodes[target].label;

    return (
      <Card header={<CardHeader title="Restore" />}>
        <Form
          onSubmit={this.onSubmit}
          analytics={{ title: 'Restore Backup', action: 'restore' }}
        >
          <FormGroup className="row" name="restore-form">
            <div className="col-sm-3 col-form-label">
              Restore to
            </div>
            <div className="col-sm-9">
              <LinodeSelect
                linodes={linodesInRegion}
                value={target}
                name="target"
                id="target"
                onChange={this.onChange}
                thisLinode={linode}
              />
              <div>
                <small className="text-muted">
                  You can only restore to Linodes within the same region.
                </small>
              </div>
            </div>
          </FormGroup>
          <FormGroup className="row" name="overrite">
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
          <FormGroup className="row" name="restore">
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
