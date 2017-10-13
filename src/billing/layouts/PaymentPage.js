import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import { Form, FormGroup, FormGroupError, FormSummary, Input, SubmitButton } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import api from '~/api';

import { makePayment } from '~/api/ad-hoc/account';
import { dispatchOrStoreErrors } from '~/api/util';
import { setSource } from '~/actions/source';


export class PaymentPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
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
    const { dispatch } = this.props;
    const { usd } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => makePayment(usd),
    ]));
	}

  render() {
		const { errors, loading, usd } = this.state;

    return (
      <div>
        <section>
          <Card header={<CardHeader title="Make a Payment" />}>
            <Form
              onSubmit={this.onSubmit}
              analytics={{ title: 'Make Payment' }}
            >
              <FormGroup className="row">
                <label className="col-sm-3 col-form-label">Amount to Charge</label>
                <div className="col-sm-9">
                  <Input
										name="usd"
										id="usd"
										value={usd}
                		onChange={this.onChange}
                  /> (USD)
              		<FormGroupError errors={errors} name="usd" />
                </div>
              </FormGroup>
              <FormGroup className="row">
                <div className="col-sm-9 offset-sm-3">
                  <SubmitButton
                    disabled={loading}
                  >Make a Payment</SubmitButton>
                  <FormSummary errors={errors} success="Payment Made." />
                </div>
              </FormGroup>
            </Form>
          </Card>
        </section>
      </div>
    );
  }
}

export default connect()(PaymentPage);
