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

import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { setSource } from '~/actions/source';

import { Countries } from '~/constants';


export class ContactPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errors: {},
      company: props.account.company,
      email: props.account.email,
      firstName: props.account.first_name,
      lastName: props.account.last_name,
      address1: props.account.address_1,
      address2: props.account.address_2,
      city: props.account.city,
      state: props.account.state,
      zip: props.account.zip,
      country: props.account.country,
      phone: props.account.phone,
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
    const { company, email, firstName, lastName,
      address1, address2, city, state, zip, country, phone } = this.state;
    const data = {
      company,
      email,
      city,
      state,
      zip,
      country,
      phone,
      first_name: firstName,
      last_name: lastName,
      address_1: address1,
      address_2: address2,
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.account.put(data),
    ]));
  }

  render() {
    const { errors, loading, company, email, firstName, lastName,
      address1, address2, city, state, zip, country, phone } = this.state;

    const options = Object.keys(Countries).map(country => ({
      value: country,
      label: `${country} - ${Countries[country]}`,
    }));

    return (
      <div>
        <section>
          <Card header={<CardHeader title="Contact Information" />}>
            <Form
              onSubmit={this.onSubmit}
              analytics={{ title: 'contact info' }}
            >
              <FormGroup className="row" errors={errors} name="company">
                <label className="col-sm-3 col-form-label">Company Name</label>
                <div className="col-sm-9">
                  <Input
                    name="company"
                    id="company"
                    type="text"
                    value={company}
                    onChange={this.onChange}
                  />
                  <FormGroupError errors={errors} name="company" />
                </div>
              </FormGroup>
              <FormGroup className="row" errors={errors} name="email">
                <label className="col-sm-3 col-form-label">Email</label>
                <div className="col-sm-9">
                  <Input
                    name="email"
                    id="email"
                    type="text"
                    value={email}
                    onChange={this.onChange}
                  />
                  <FormGroupError errors={errors} name="email" />
                </div>
              </FormGroup>
              <FormGroup className="row" errors={errors} name="firstName" apiKey="first_name">
                <label className="col-sm-3 col-form-label">First Name</label>
                <div className="col-sm-9">
                  <Input
                    name="firstName"
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={this.onChange}
                  />
                  <FormGroupError errors={errors} name="firstName" />
                </div>
              </FormGroup>
              <FormGroup className="row" errors={errors} name="lastName" apiKey="last_name">
                <label className="col-sm-3 col-form-label">Last Name</label>
                <div className="col-sm-9">
                  <Input
                    name="lastName"
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={this.onChange}
                  />
                  <FormGroupError errors={errors} name="lastName" />
                </div>
              </FormGroup>
              <FormGroup className="row" errors={errors} name="address1" apiKey="address_1">
                <label className="col-sm-3 col-form-label">Address1</label>
                <div className="col-sm-9">
                  <Input
                    name="address1"
                    id="address1"
                    type="text"
                    value={address1}
                    onChange={this.onChange}
                  />
                  <FormGroupError errors={errors} name="address1" />
                </div>
              </FormGroup>
              <FormGroup className="row" errors={errors} name="address2" apiKey="address_2">
                <label className="col-sm-3 col-form-label">Address2</label>
                <div className="col-sm-9">
                  <Input
                    name="address2"
                    id="address2"
                    type="text"
                    value={address2}
                    onChange={this.onChange}
                  />
                  <FormGroupError errors={errors} name="address2" />
                </div>
              </FormGroup>
              <FormGroup className="row" errors={errors} name="city">
                <label className="col-sm-3 col-form-label">City</label>
                <div className="col-sm-9">
                  <Input
                    name="city"
                    id="city"
                    type="text"
                    value={city}
                    onChange={this.onChange}
                  />
                  <FormGroupError errors={errors} name="city" />
                </div>
              </FormGroup>
              <FormGroup className="row" errors={errors} name="state">
                <label className="col-sm-3 col-form-label">State</label>
                <div className="col-sm-9">
                  <Input
                    name="state"
                    id="state"
                    type="text"
                    value={state}
                    onChange={this.onChange}
                  />
                  <FormGroupError errors={errors} name="state" />
                </div>
              </FormGroup>
              <FormGroup className="row" errors={errors} name="zip">
                <label className="col-sm-3 col-form-label">Zip</label>
                <div className="col-sm-9">
                  <Input
                    name="zip"
                    id="zip"
                    type="text"
                    value={zip}
                    onChange={this.onChange}
                  />
                  <FormGroupError errors={errors} name="zip" />
                </div>
              </FormGroup>
              <FormGroup className="row" errors={errors} name="country">
                <label className="col-sm-3 col-form-label">Country</label>
                <div className="col-sm-9">
                  <Select
                    name="country"
                    id="country"
                    value={country}
                    options={options}
                    onChange={this.onChange}
                  />
                  <FormGroupError errors={errors} name="country" />
                </div>
              </FormGroup>
              <FormGroup className="row" errors={errors} name="phone">
                <label className="col-sm-3 col-form-label">Phone</label>
                <div className="col-sm-9">
                  <Input
                    name="phone"
                    id="phone"
                    type="text"
                    value={phone}
                    onChange={this.onChange}
                  />
                  <FormGroupError errors={errors} name="phone" />
                </div>
              </FormGroup>
              <FormGroup className="row">
                <div className="col-sm-9 offset-sm-3">
                  <SubmitButton
                    disabled={loading}
                  >Save Changes</SubmitButton>
                  <FormSummary errors={errors} success="Contact Info Updated." />
                </div>
              </FormGroup>
            </Form>
          </Card>
        </section>
      </div>
    );
  }
}

ContactPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
};

function select(state) {
  return {
    account: state.api.account,
  };
}

export default connect(select)(ContactPage);
