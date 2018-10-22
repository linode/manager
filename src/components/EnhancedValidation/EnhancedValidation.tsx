import { withFormik } from 'formik';
import { map, path, reduce } from 'ramda';
import * as React from 'react';

import { Item } from 'src/components/EnhancedSelect/Select';

export interface EnhancedValidationProps {
  handleTextFieldChange: (e: any) => void;
  handleSelectFieldChange: (item: Item, name: string) => void;
  handleFormSubmission: () => void;
  createFormErrors: (errors: any) => any;
  maybeGetErrorText: (fieldName: string) => string | undefined;
}

export type ValidationRequest = (ownProps?: any) => any;

export default (
  mapPropsToValues: any,
  validate: any,
  requestFn: ValidationRequest,
  successMessage: string,
  ...formikOptions: any
  ) => (Component: any) => {

  class WrappedComponent extends React.Component<any> {

    handleTextFieldChange = (e: any): void => {
      const { name, value } = e.target;

      this.props.setFieldValue(name, value);

      if (this.props.touched[name]) {
        this.props.validateForm({ ...(this.props.values as {}), [name]: value });
      }
    }

    handleSelectFieldChange = (item: Item, name: string): void => {
      this.props.setFieldValue(name, item);

      // We need to set this manually, because using with React-Select results in weird errors
      this.props.setFieldTouched(name);

      if (item && this.props.touched[name]) {
        this.props.validateForm({ ...(this.props.values as {}), [name]: item.value });
      }
    }

    handleFormSubmission = (): void => {
      const allTouched = map(() => true, this.props.values);

      this.props.setTouched(allTouched);

      this.props.validateForm().then((combinedErrors: any) => {
        const isValid = Object.keys(combinedErrors).length === 0;
        if (!isValid) {
          this.props.setErrors(combinedErrors);
        } else {
          this.executeSubmission();
        }
      });
    }

    executeSubmission = (): void => {
      requestFn(this.props).then(() => {
          this.props.setSubmitting(false);
          this.props.setStatus({ success: true, message: successMessage });
        })
        .catch((error: any) => {
          this.props.setSubmitting(false);
          this.props.setStatus(undefined);

          if (path(['response', 'data', 'errors'], error)) {
            const formErrors = this.createFormErrors(error.response.data.errors);
            this.props.setErrors(formErrors);
          } else {
            this.props.setStatus({ success: false, message: 'An error occurred'});
          }
        });
    }

    createFormErrors = (errors: any) => {
      return reduce((formErrors: any, apiError: Linode.ApiFieldError) => {
        const key = apiError.field || 'none';
        return { ...formErrors, [key]: apiError.reason }
      }, {}, errors);
    }

    maybeGetErrorText = (fieldName: string) => {
      return this.props.touched[fieldName] && this.props.errors[fieldName]
        ? this.props.errors[fieldName]
        : undefined;
    }

    render() {
      return (
        <Component
          {...this.props}
          handleTextFieldChange={this.handleTextFieldChange}
          handleSelectFieldChange={this.handleSelectFieldChange}
          handleFormSubmission={this.handleFormSubmission}
          createFormErrors={this.createFormErrors}
          maybeGetErrorText={this.maybeGetErrorText}
        />
      )
    }
  }

  return withFormik({
    mapPropsToValues,
    validate,
    validateOnChange: false,
    isInitialValid: true,
    ...formikOptions
  })(WrappedComponent as any);
}