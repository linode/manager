import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import { Form, FormGroup, FormGroupError, FormSummary, Select, Input, SubmitButton } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import api from '~/api';

import { updateCard } from '~/api/ad-hoc/account';
import { dispatchOrStoreErrors } from '~/api/util';
import { setSource } from '~/actions/source';


export class CreditCardPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      month: 1,
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
			expiry_month: month,
			expiry_year: year,
		};

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => updateCard(data),
    ]));
	}

	optionBuilder = (start, count) => {
		return Array.from({length: count}, (v, i) => {
			return {value: start + i, label: start + i};
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
										value={card}
                		onChange={this.onChange}
                  />
                </div>
                <FormGroupError errors={errors} name="card_number" />
              </FormGroup>
              <FormGroup errors={errors} className="row">
                <label className="col-sm-3 col-form-label">Expires</label>
                <div className="col-sm-1">
									<Select
										id="month"
										name="expiry_month"
										value={month}
										onChange={this.onChange}
										options={months}
									/>
                  <FormGroupError errors={errors} name="expiry_month" inline={false} />
                </div>
                <div className="col-sm-1">
									<Select
										id="year"
										name="expiry_year"
										value={year}
										onChange={this.onChange}
										options={years}
									/>
                  <FormGroupError errors={errors} name="expiry_year" inline={false} />
                </div>
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

export default connect()(CreditCardPage);
