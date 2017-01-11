import React, { Component, PropTypes } from 'react';

import { linodes } from '~/api';
import { CancelButton, Form, SubmitButton } from '~/components/form';
import { hideModal } from '~/actions/modal';

export class DeleteModal extends Component {
  constructor() {
    super();
    this.state = { loading: false, errors: { label: [], size: [], _: [] } };
  }

  async deleteDisk() {
    const { dispatch, linode, disk } = this.props;
    this.setState({ loading: true });
    try {
      await dispatch(linodes.disks.delete(linode.id, disk.id));
      this.setState({ loading: false });
      dispatch(hideModal());
    } catch (response) {
      const json = await response.json();
      const reducer = f => (s, e) => {
        if (e.field === f) {
          return s ? [...s, e.reason] : [e.reason];
        }
        return s;
      };
      this.setState({
        loading: false,
        errors: {
          label: json.errors.reduce(reducer('label'), []),
          size: json.errors.reduce(reducer('size'), []),
          _: json.errors.reduce((s, e) =>
            ['label', 'size'].indexOf(e.field) === -1 ?
            [...s, e.reason] : [...s], []),
        },
      });
    }
  }

  render() {
    const { dispatch } = this.props;
    const { loading, errors } = this.state;
    return (
      <Form
        onSubmit={() => this.deleteDisk()}
      >
        <p>Are you sure you want to delete this disk? This cannot be undone.</p>
        {errors._.length ?
          <div className="alert alert-danger">
            {errors._.map(error => <div key={error}>{error}</div>)}
          </div> : null}
        <div className="modal-footer">
          <CancelButton
            disabled={loading}
            onClick={() => dispatch(hideModal())}
          />
          <SubmitButton
            disabled={loading}
          >Delete Disk</SubmitButton>
        </div>
      </Form>);
  }
}

DeleteModal.propTypes = {
  linode: PropTypes.object.isRequired,
  disk: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
