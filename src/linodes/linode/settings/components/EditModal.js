import React, { Component, PropTypes } from 'react';

import { linodes } from '~/api';
import { resizeLinodeDisk } from '~/api/linodes';
import { CancelButton, Form, SubmitButton } from '~/components/form';
import { hideModal } from '~/actions/modal';
import { ErrorSummary, FormGroup, reduceErrors } from '~/errors';

export class EditModal extends Component {
  constructor() {
    super();
    this.componentDidMount = this.componentDidMount.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.state = {
      loading: false,
      size: -1,
      label: '',
      errors: {},
    };
  }

  componentDidMount() {
    const { disk } = this.props;
    this.setState({ label: disk.label, size: disk.size });
  }

  async saveChanges() {
    const { size, label } = this.state;
    const { linode, disk, dispatch } = this.props;
    this.setState({ loading: true, errors: {} });
    try {
      if (size !== disk.size) {
        await dispatch(resizeLinodeDisk(linode.id, disk.id, size));
      }
      if (label !== disk.label) {
        await dispatch(linodes.disks.put({ label }, linode.id, disk.id));
      }
      this.setState({ loading: false });
      dispatch(hideModal());
    } catch (response) {
      this.setState({ loading: false, errors: await reduceErrors(response) });
    }
  }

  render() {
    const { disk, free, dispatch } = this.props;
    const { label, size, errors, loading } = this.state;
    return (
      <Form
        onSubmit={() => this.saveChanges()}
      >
        <FormGroup errors={errors} field="label">
          <label htmlFor="label">Label</label>
          <input
            name="label"
            className="form-control"
            id="label"
            placeholder="Label"
            value={label}
            disabled={loading}
            onChange={e => {
              this.setState({ label: e.target.value });
            }}
          />
        </FormGroup>
        <div className="form-group">
          <label htmlFor="format">Format</label>
          <input disabled className="form-control" value={disk.filesystem} />
        </div>
        <div className="form-group">
          <label htmlFor="current-size">Current size (MB)</label>
          <input disabled className="form-control" value={disk.size} />
        </div>
        <FormGroup errors={errors} field="size">
          <label htmlFor="size">New size (MB)</label>
          <input
            type="number"
            min={8} /* TODO: can't/don't calculate distro min size requirement */
            max={free + disk.size}
            className="form-control"
            value={size}
            name="size"
            onChange={e => {
              this.setState({ size: parseInt(e.target.value, 10) });
            }}
          />
        </FormGroup>
        <ErrorSummary errors={errors} />
        <div className="modal-footer">
          <CancelButton
            disabled={loading}
            onClick={() => dispatch(hideModal())}
          />
          <SubmitButton
            disabled={loading}
          />
        </div>
      </Form>);
  }
}

EditModal.propTypes = {
  linode: PropTypes.object.isRequired,
  disk: PropTypes.object.isRequired,
  free: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
};
