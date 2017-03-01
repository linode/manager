import React, { PropTypes, Component } from 'react';

import { ModalFormGroup } from '~/components/form';
import { Form, Input, SubmitButton, CancelButton } from '~/components/form';
import { reduceErrors, ErrorSummary } from '~/errors';
import { reverseDNS } from '~/api/linodes';

export default class EditRDNS extends Component {
  constructor() {
    super();

    this.state = {
      errors: {},
      hostname: '',
    };
  }

  onSubmit = async () => {
    const { dispatch, ip: { linode_id: linodeId, address } } = this.props;
    const { rdns } = this.state;

    this.setState({ errors: {}, saving: true });

    try {
      await dispatch(reverseDNS(linodeId, address, rdns));

      this.setState({ saving: false });
      this.props.close();
    } catch (response) {
      if (!response.json) {
        // eslint-disable-next-line no-console
        return console.error(response);
      }

      const errors = await reduceErrors(response);
      this.setState({ errors, saving: false });
    }
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { close, ip: { address } } = this.props;
    const { errors, saving, hostname } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <ModalFormGroup label="IP Address" id="address">
          <Input
            id="address"
            value={address}
            disabled
          />
        </ModalFormGroup>
        <ModalFormGroup label="Hostname" id="hostname" apiKey="hostname" errors={errors}>
          <Input
            id="hostname"
            name="hostname"
            value={hostname}
            placeholder="www.example.com"
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <div className="Modal-footer">
          <CancelButton onClick={close} />
          <SubmitButton disabled={saving}>Save</SubmitButton>
        </div>
        <ErrorSummary errors={errors} />
      </Form>
    );
  }
}

EditRDNS.propTypes = {
  dispatch: PropTypes.func.isRequired,
  ip: PropTypes.object.isRequired,
  linodeId: PropTypes.any.isRequired,
  close: PropTypes.func.isRequired,
};
