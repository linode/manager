import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { Card, CardHeader } from 'linode-components/cards';
import {
  Checkbox,
  Form,
  FormGroup,
  FormGroupError,
  FormSummary,
  Input,
  PasswordInput,
  SubmitButton,
} from 'linode-components/forms';


export default function Details(props) {
  const {
    errors, selectedType, selectedDistribution, loading, label, password, backups,
    onChange, onSubmit,
  } = props;

  const renderBackupsPrice = () => {
    if (!selectedType) {
      return '(Select a plan to view the price of backups)';
    }

    const price = (selectedType.backups_price).toFixed(2);
    return `($${price}/mo)`;
  };


  if (errors._ && errors._.length) {
    const match = /limit reached/;
    errors._ = errors._.map(error => {
      let reason = error.reason;
      if (error.reason.toLowerCase().match(match)) {
        reason = (
          <span>
            {/* eslint-disable max-len */}
            You've reached your account limit. <Link to="/support/create">Open a support ticket to request a limit increase.</Link>
            {/* eslint-enable max-len */}
          </span>
        );
      }

      return { ...error, reason };
    });
  }

  return (
    <Card header={<CardHeader title="Details" />}>
      {/* TODO: Form should encapsulate all form fields on the create page */}
      <Form onSubmit={onSubmit}>
        <FormGroup name="label" errors={errors} className="row">
          <label htmlFor="label" className="col-sm-2 col-form-label">Label</label>
          <div className="col-sm-10">
            <Input
              id="label"
              name="label"
              value={label}
              onChange={onChange}
              placeholder={'gentoo-www1'}
            />
            <FormGroupError errors={errors} name="label" />
          </div>
        </FormGroup>
        <FormGroup name="root_pass" errors={errors} className="row">
          <label htmlFor="password" className="col-sm-2 col-form-label">Root password</label>
          <div className="col-sm-10 clearfix">
            <div className="float-sm-left">
              <PasswordInput
                value={password}
                id="password"
                name="password"
                onChange={onChange}
                disabled={selectedDistribution === 'none'}
              />
              {selectedDistribution !== 'none' ? null : (
                <div>
                  <p className="alert alert-info">
                    You can't set a password for an Empty Linode.
                  </p>
                </div>
              )}
            </div>
            <FormGroupError className="float-sm-left" errors={errors} name="root_pass" />
          </div>
        </FormGroup>
        <FormGroup name="backups" errors={errors} className="row">
          <label htmlFor="backups" className="col-sm-2 col-form-label">Enable backups</label>
          <div className="col-sm-10">
            <Checkbox
              id="backups"
              name="backups"
              checked={backups}
              onChange={onChange}
              label={renderBackupsPrice()}
            />
          </div>
        </FormGroup>
        <FormGroup className="row">
          <div className="offset-sm-2 col-sm-10">
            <SubmitButton disabled={loading} disabledChildren="Adding Linode">
              Add Linode
            </SubmitButton>
            <FormSummary errors={errors} />
          </div>
        </FormGroup>
      </Form>
    </Card>
  );
}

Details.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  backups: PropTypes.bool.isRequired,
  password: PropTypes.string.isRequired,
  selectedType: PropTypes.object,
  selectedDistribution: PropTypes.string,
};
