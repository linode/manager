import React, { Component, PropTypes } from 'react';

import { linodes } from '~/api';
import { resizeLinodeDisk } from '~/api/linodes';
import { CancelButton, Form, FormGroup, FormGroupError,
  Input, SubmitButton } from '~/components/form';
import { hideModal } from '~/actions/modal';
import { ErrorSummary, reduceErrors } from '~/errors';

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
      dispatch(hideModal());
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }

    this.setState({ loading: false });
  }

  render() {
    const { disk, free, dispatch } = this.props;
    const { label, size, errors, loading } = this.state;
    return (
      <Form
        onSubmit={() => this.saveChanges()}
      >
        <FormGroup errors={errors} name="label" className="row">
          <label htmlFor="label" className="col-sm-5 col-form-label">Label</label>
          <div className="col-sm-7">
            <Input
              id="label"
              placeholder="Label"
              value={label}
              onChange={e => {
                this.setState({ label: e.target.value });
              }}
            />
            <FormGroupError errors={errors} name="label" inline={false} />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="filesystem" className="row">
          <label className="col-sm-5 col-form-label">Format</label>
          <div className="col-sm-7">
            <Input disabled className="form-control" value={disk.filesystem} />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="size" className="row">
          <label className="col-sm-5 col-form-label">Current size (MB)</label>
          <div className="col-sm-7">
            <Input disabled className="form-control" value={disk.size} />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="size" className="row">
          <label htmlFor="size" className="col-sm-5 col-form-label">New size (MB)</label>
          <div className="col-sm-7">
            <Input
              id="size"
              type="number"
              min={8} /* TODO: can't/don't calculate distro min size requirement */
              max={free + disk.size}
              value={size}
              onChange={e => {
                this.setState({ size: parseInt(e.target.value, 10) });
              }}
            />
            <FormGroupError errors={errors} name="size" inline={false} />
          </div>
        </FormGroup>
        <ErrorSummary errors={errors} />
        <div className="Modal-footer">
          <CancelButton
            className="LinodesLinodeSettingsComponentsEditModal-cancel"
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
