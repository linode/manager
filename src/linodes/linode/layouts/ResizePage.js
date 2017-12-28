import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Card, CardHeader } from 'linode-components';
import {
  FormGroup,
  FormGroupError,
  Form,
  FormSummary,
  SubmitButton,
  Input,
} from 'linode-components';
import { onChange } from 'linode-components';

import { setSource } from '~/actions/source';
import api from '~/api';
import { resizeLinode } from '~/api/ad-hoc/linodes';
import { dispatchOrStoreErrors } from '~/api/util';
import { ChainedDocumentTitle } from '~/components';
import { PlanSelect } from '~/linodes/components';
import { planStyle } from '~/linodes/components/PlanStyle';
import { ComponentPreload as Preload } from '~/decorators/Preload';

import { selectLinode } from '../utilities';


export class ResizePage extends Component {
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

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => resizeLinode(linode.id, type),
    ]));
  }

  render() {
    const { types, linode: { label, type: { id: currentType } } } = this.props;
    const { type, errors, loading } = this.state;

    return (
      <Card header={<CardHeader title="Resize" />}>
        <ChainedDocumentTitle title="Resize" />
        <Form
          onSubmit={this.onSubmit}
          analytics={{ title: 'Resize Linode' }}
        >
          <FormGroup className="row" name="current">
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
          <FormGroup className="row" name="submit">
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

function mapStateToProps(state, props) {
  const { linode } = selectLinode(state, props);
  const { types } = state.api;
  return { linode, types };
}

export default compose(
  connect(mapStateToProps),
  Preload(
    async function (dispatch, props) {
      if (!props.types.ids.length) {
        await dispatch(api.types.all());
      }
    }
  )
)(ResizePage);
