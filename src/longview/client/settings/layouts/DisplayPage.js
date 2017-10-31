import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  Form,
  FormGroup,
  FormGroupError,
  FormSummary,
  Input,
  SubmitButton,
} from 'linode-components/forms';

import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { setSource, setTitle } from '~/actions';

import { selectLVClient } from '../../utilities';


export class DisplayPage extends Component {
  constructor(props) {
    super(props);

    const { label } = props.lvclient;
    this.state = { label, errors: {}, loading: false };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  onSubmit = () => {
    const { dispatch, lvclient: { id, label: oldLabel } } = this.props;
    const { label } = this.state;

    const requests = [
      () => api.lvclients.put({ label }, id),
      () => setTitle(label),
    ];

    if (oldLabel !== label) {
      requests.push(() => push(`/longview/${label}/settings`));
    }

    return dispatch(dispatchOrStoreErrors.call(this, requests));
  }

  render() {
    const { label, loading, errors } = this.state;

    return (
      <Card header={<CardHeader title="Display" />}>
        <Form
          onSubmit={this.onSubmit}
          analytics={{ title: 'Longview Client Display Settings' }}
        >
          <FormGroup errors={errors} className="row" name="label">
            <label htmlFor="label" className="col-sm-2 col-form-label">Client Label</label>
            <div className="col-sm-8 col-lg-4">
              <Input
                id="label"
                name="label"
                value={label}
                onChange={e => this.setState({ label: e.target.value })}
              />
            </div>
            <FormGroupError errors={errors} name="label" />
          </FormGroup>
          <FormGroup className="row">
            <div className="offset-sm-1 col-sm-11">
              <SubmitButton disabled={loading} />
              <FormSummary errors={errors} success="Display settings saved." />
            </div>
          </FormGroup>
        </Form>
      </Card>
    );
  }
}

DisplayPage.propTypes = {
  lvclient: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(selectLVClient)(DisplayPage);
