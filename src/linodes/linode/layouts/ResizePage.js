import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card } from '~/components';
import {
  FormGroup, Form, SubmitButton,
} from '~/components/form';
import { reduceErrors, ErrorSummary } from '~/errors';
import { setSource } from '~/actions/source';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import Plan from '~/linodes/components/Plan';

export class ResizePage extends Component {
  constructor(props) {
    super(props);
    this.getLinode = getLinode.bind(this);
    this.state = {
      // TODO: deal with multiple types better
      type: this.getLinode().type[0].id,
      errors: {},
      fetching: false,
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  async onSubmit() {
    // const { id: linodeId } = this.getLinode();

    this.setState({ fetching: true, errors: {} });

    try {
      // TODO : Add API call
    } catch (response) {
      const errors = await reduceErrors(response);
      errors._.concat(errors.type);
      this.setState({ errors });
    }

    this.setState({ fetching: false });
  }

  render() {
    const { types } = this.props;
    const { type, errors } = this.state;

    return (
      <Card title="Resize">
        <Form onSubmit={() => this.onSubmit()}>
          <FormGroup>
            <Plan
              types={types.types}
              selected={type}
              onServiceSelected={type => this.setState({ type })}
            />
          </FormGroup>
          <FormGroup>
            <SubmitButton
              disabled={this.fetching}
            >Resize</SubmitButton>
          </FormGroup>
          <ErrorSummary errors={errors} />
        </Form>
      </Card>
    );
  }
}

ResizePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  types: PropTypes.object.isRequired,
  linodes: PropTypes.object.isRequired,
};

function select(state) {
  return {
    types: state.api.types,
    linodes: state.api.linodes,
  };
}

export default connect(select)(ResizePage);
