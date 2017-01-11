import React, { Component, PropTypes } from 'react';

import { linodes } from '~/api';
import { resizeLinodeDisk } from '~/api/linodes';
import { CancelButton, Form, SubmitButton, FormGroup, FormGroupError } from '~/components/form';
import { hideModal } from '~/actions/modal';
import { FormGroup } from '~/components/form';
import { ErrorSummary, reduceErrors } from '~/errors';
import Input from '~/components/Input';

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
        <FormGroup errors={errors} field="label" className="row">
          <div className="col-sm-4 label-col">
            <label htmlFor="label">Label:</label>
          </div>
          <div className="col-sm-8 content-col">
            <Input
              placeholder="Label"
              value={label}
              onChange={e => this.setState({ label: e.target.value }) }
            />
            <FormGroupError errors={errors} field="label" />
          </div>
        </FormGroup>
        <div className="form-group row">
          <div className="col-sm-4 label-col">
            <label htmlFor="format">Format</label>
          </div>
          <div className="col-sm-8 content-col">
            <Input disabled value={disk.filesystem} />
          </div>
        </div>
        <div className="form-group row">
          <div className="col-sm-4 label-col">
            <label htmlFor="current-size">Current size (MB)</label>
          </div>
          <div className="col-sm-8 content-col">
            <Input disabled value={disk.size} />
          </div>
        </div>
        <FormGroup errors={errors} field="size" className="row">
          <div className="col-sm-4 label-col">
            <label htmlFor="size">New size (MB):</label>
          </div>
          <div className="col-sm-8 content-col">
            <Input
              type="number"

              max={free + disk.size}
              className="form-control"
              value={size}
              name="size"
              onChange={e => {
                  this.setState({ size: parseInt(e.target.value, 10) });
                }}
            />
            <FormGroupError errors={errors} field="size" />
          </div>
        </FormGroup>
        <div className="modal-footer">
          <CancelButton
            disabled={loading}
            onClick={() => dispatch(hideModal())}
          />
          <SubmitButton
            disabled={loading}
          />
        </div>
        <ErrorSummary errors={errors} />
      </Form>);
  }
}

EditModal.propTypes = {
  linode: PropTypes.object.isRequired,
  disk: PropTypes.object.isRequired,
  free: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
};
