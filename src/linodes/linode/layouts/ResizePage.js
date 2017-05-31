import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  FormGroup, Form, SubmitButton,
} from 'linode-components/forms';

import { setSource } from '~/actions/source';
import { setError } from '~/actions/errors';
import { types } from '~/api';
import { resizeLinode } from '~/api/linodes';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';
import Plan from '~/linodes/components/Plan';

import { selectLinode } from '../utilities';


export class ResizePage extends Component {
  static async preload({ dispatch, getState }) {
    try {
      if (!getState().api.types.ids.length) {
        await dispatch(types.all());
      }
    } catch (response) {
      dispatch(setError(response));
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      type: props.linode.type.id,
      errors: {},
      loading: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  onSubmit = () => {
    const { dispatch, linode } = this.props;
    const { type } = this.state;

    return dispatch(dispatchOrStoreErrors.apply(this, [
      [() => resizeLinode(linode.id, type)],
      ['type'],
    ]));
  }

  render() {
    const { types } = this.props;
    const { type, errors, loading } = this.state;

    return (
      <Card header={<CardHeader title="Resize" />}>
        <Form onSubmit={this.onSubmit}>
          <FormGroup>
            <Plan
              types={types.types}
              selected={type}
              onServiceSelected={type => this.setState({ type })}
            />
          </FormGroup>
          <FormGroup>
            <SubmitButton
              disabled={loading}
              disabledChildren="Resizing"
            >Resize</SubmitButton>
            <FormSummary errors={errors} success="Linode is being resized." />
          </FormGroup>
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
