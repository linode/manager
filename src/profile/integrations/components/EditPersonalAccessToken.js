import React, { PropTypes, Component } from 'react';

import { tokens } from '~/api';
import { ModalFormGroup } from '~/components/form';
import { Form, Input, SubmitButton, CancelButton } from '~/components/form';
import { reduceErrors, ErrorSummary } from '~/errors';

export default class CreatePersonalAccessToken extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errors: {},
      label: props.label,
      saving: false,
    };
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  onSubmit = async () => {
    const { dispatch, id } = this.props;
    const { label } = this.state;

    this.setState({ errors: {}, saving: true });

    try {
      await dispatch(tokens.put({ label }, id));

      this.setState({ saving: false });
      this.props.close();
    } catch (response) {
      if (!response.json) {
        // eslint-disable-next-line no-console
        console.error(response);
      }

      const errors = await reduceErrors(response);
      this.setState({ errors, saving: false });
    }
  }

  render() {
    const { close } = this.props;
    const { errors, label, saving } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <ModalFormGroup id="label" label="Label" apiKey="label" errors={errors}>
          <Input
            name="label"
            id="label"
            placeholder="My token"
            value={label}
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <div className="Modal-footer">
          <CancelButton onClick={close} />
          <SubmitButton disabled={saving} />
        </div>
        <ErrorSummary errors={errors} />
      </Form>
    );
  }
}

CreatePersonalAccessToken.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};
