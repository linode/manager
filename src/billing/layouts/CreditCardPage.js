import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  Form,
  FormGroup,
  FormGroupError,
  FormSummary,
  Select,
  Input,
  SubmitButton,
} from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';

import { updateCard } from '~/api/ad-hoc/account';
import { dispatchOrStoreErrors } from '~/api/util';
import { setSource } from '~/actions/source';


export class CreditCardPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      month: 1,
      year: new Date().getFullYear(),
      card: '',
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
    const { month, year, card } = this.state;
    const data = {
      card_number: card,
      expiry_month: parseInt(month, 10),
      expiry_year: parseInt(year, 10),
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => updateCard(data),
    ]));
  }

  optionBuilder = (start, count) => {
    return Array.from({ length: count }, (v, i) => {
      return { value: start + i, label: start + i };
    });
  }

  render() {
    const { month, year, card, errors, loading } = this.state;
    const months = this.optionBuilder(1, 12);
    const years = this.optionBuilder(new Date().getFullYear(), 26);

    return (
      <div>
        <section>
          <Card header={<CardHeader title="Update Credit Card" />}>
            <Form
              onSubmit={this.onSubmit}
              analytics={{ title: 'Update CC' }}
            >
              <FormGroup className="row" errors={errors} name="card_number">
                <label className="col-sm-3 col-form-label">Credit Card</label>
                <div className="col-sm-9">
                  <Input
                    name="card"
                    id="card"
                    type="text"
                    value={card}
                    maxLength={19}
                    pattern="[0-9]{13,19}"
                    onChange={this.onChange}
                  />
                  <FormGroupError errors={errors} name="card_number" />
                </div>
              </FormGroup>
              <FormGroup errors={errors} name={['expiry_month', 'expiry_year']} className="row">
                <label className="col-sm-3 col-form-label">Expires</label>
                <div className="col-sm-1">
                  <Select
                    id="expiry_month"
                    name="month"
                    value={month}
                    onChange={this.onChange}
                    options={months}
                  />
                </div>
                <div className="col-sm-2">
                  <Select
                    id="expiry_year"
                    name="year"
                    value={year}
                    onChange={this.onChange}
                    options={years}
                  />
                </div>
                <FormGroupError
                  errors={errors}
                  name={['expiry_month', 'expiry_year']}
                  inline={false}
                />
              </FormGroup>
              <FormGroup className="row">
                <div className="col-sm-9 offset-sm-3">
                  <SubmitButton
                    disabled={loading}
                  >Update Credit Card</SubmitButton>
                  <FormSummary errors={errors} success="Credit Card Updated." />
                </div>
              </FormGroup>
            </Form>
          </Card>
        </section>
      </div>
    );
  }
}

CreditCardPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(CreditCardPage);
