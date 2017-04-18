import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  FormGroup, Form, SubmitButton,
} from 'linode-components/forms';
import { reduceErrors, ErrorSummary } from '~/errors';
import { setSource } from '~/actions/source';
import { selectLinode } from '../utilities';
import { resizeLinode } from '~/api/linodes';
import Plan from '~/linodes/components/Plan';

export class ResizePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // TODO: deal with multiple types better
      type: props.linode.type[0].id,
      errors: {},
      fetching: false,
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  async onSubmit() {
    const { dispatch, linode } = this.props;
    const { type } = this.state;
    this.setState({ fetching: true, errors: {} });

    try {
      await dispatch(resizeLinode(linode.id, type));
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
      <Card header={<CardHeader title="Resize" />}>
        <Form onSubmit={() => this.onSubmit()}>
          <FormGroup>
            <Plan
              types={types.types}
              selected={type}
              onServiceSelected={type => this.setState({ type })}
            />
          </FormGroup>
          <FormGroup>
            <SubmitButton>
              Resize
            </SubmitButton>
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
  linode: PropTypes.object.isRequired,
};

function select(state, props) {
  const { linode } = selectLinode(state, props);
  const { types } = state.api;
  return { linode, types };
}

export default connect(select)(ResizePage);
