import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  FormGroup,
  FormGroupError,
  Form,
  FormSummary,
  SubmitButton,
  Input,
} from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';

import { setSource } from '~/actions/source';
import { types } from '~/api';
import { resizeLinode } from '~/api/linodes';
import { dispatchOrStoreErrors } from '~/api/util';
import { PlanSelect } from '~/linodes/components';
import { planStyle } from '~/linodes/components/PlanStyle';

import { selectLinode } from '../utilities';


export class ResizePage extends Component {
  static async preload({ dispatch, getState }) {
    if (!getState().api.types.ids.length) {
      await dispatch(types.all());
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      type: props.linode.type.id,
      errors: {},
      loading: false,
    };

    this.onChange = onChange.bind(this);
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
    const { types, linode: { type: { id: currentType } } } = this.props;
    const { type, errors, loading } = this.state;

    return (
      <Card header={<CardHeader title="Resize" />}>
        <Form
          onSubmit={this.onSubmit}
          analytics={{ title: 'Resize Linode' }}
        >
          <FormGroup className="row">
            <label className="col-sm-3 col-form-label">Current Plan</label>
            <div className="col-sm-9">
              <Input disabled value={planStyle(types.types[currentType])} />
            </div>
          </FormGroup>
          <FormGroup errors={errors} name="type" className="row">
            <label className="col-sm-3 col-form-label">New Plan</label>
            <div className="col-sm-9">
              <PlanSelect
                plans={types.types}
                value={type}
                name="type"
                id="type"
                onChange={this.onChange}
              />
              <FormGroupError errors={errors} name="type" inline={false} />
            </div>
          </FormGroup>
          <FormGroup className="row">
            <div className="col-sm-9 offset-sm-3">
              <SubmitButton
                disabled={loading}
                disabledChildren="Resizing"
              >Resize</SubmitButton>
              <FormSummary errors={errors} success="Linode is being resized." />
            </div>
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
