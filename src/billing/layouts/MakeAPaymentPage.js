import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  Form,
  FormGroup,
  FormGroupError,
  FormSummary,
  Input,
  SubmitButton,
} from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';

import { makePayment } from '~/api/ad-hoc/account';
import { dispatchOrStoreErrors } from '~/api/util';
import { setSource } from '~/actions/source';
import { ChainedDocumentTitle } from '~/components';

import DisplayCurrency from '~/components/DisplayCurrency';

export class MakeAPaymentPage extends Component {
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
    const { usd, cvv } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => makePayment(parseFloat(usd), cvv),
    ]));
  }

  render() {
    const { errors, loading, usd, cvv } = this.state;
    const { balance } = this.props;

    return (
      <div>
        <ChainedDocumentTitle title="Make a Payment" />
        <section>
          <Card header={<CardHeader title="Make a Payment" />}>
            <Form
              onSubmit={this.onSubmit}
              analytics={{ title: 'Make Payment' }}
            >
              <FormGroup errors={errors} className="row" name="balance">
                <label className="col-sm-3 col-form-label">Balance</label>
                <div className="col-sm-5 col-form-text">
                  <DisplayCurrency value={balance} />
                  <FormGroupError errors={errors} name="balance" />
                </div>
              </FormGroup>
              <FormGroup errors={errors} className="row" name="usd">
                <label className="col-sm-3 col-form-label">Amount to Charge</label>
                <div className="col-sm-5">
                  <Input
                    name="usd"
                    id="usd"
                    type="text"
                    value={usd}
                    onChange={this.onChange}
                    pattern="[0-9]{0,7}(.[0-9]{0,2})?"
                    maxLength={7}
                  // max="2500"
                  />
                  <small className="text-muted col-sm-1">(USD)</small>
                  <FormGroupError errors={errors} name="usd" />
                </div>
              </FormGroup>
              <FormGroup errors={errors} className="row" name="cvv">
                <label className="col-sm-3 col-form-label">CVV</label>
                <div className="col-sm-5">
                  <Input
                    name="cvv"
                    id="cvv"
                    type="text"
                    value={cvv}
                    onChange={this.onChange}
                    maxLength={4}
                    pattern="[0-9]{3,4}"
                  // min="0000"
                  // max="9999"
                  />
                  <small className="text-muted col-sm-1">(Optional)</small>
                </div>
                <FormGroupError errors={errors} className="offset-sm-3 col-sm-6" name="cvv" />
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

MakeAPaymentPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  balance: PropTypes.number,
};

const mapStateToProps = (state) => ({
  balance: state.api.account.balance,
});

export default connect(mapStateToProps)(MakeAPaymentPage);
