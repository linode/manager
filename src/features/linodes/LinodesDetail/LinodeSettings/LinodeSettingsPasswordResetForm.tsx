import { Form, FormikErrors, FormikProps, withFormik } from 'formik';
import { path, reduce } from 'ramda';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import PasswordInput from 'src/components/PasswordInput';
import { changeLinodeDiskPassword } from 'src/services/linodes';
import { validateLinodeDiskPassword } from 'src/utilities/validateLinodeDiskPassword';

// User-facing form inputs
interface FormValues {
  disk: Item | null;
  password: string;
}

// We label "general" errors from the API as "none". We need to add this interface to FormikProps so that we can use
// Formik's built-in error handling to handle general errors as well as form input errors
interface GeneralError {
  none: string;
}

// These are props passed down from the container component
interface FormProps {
  disksLoading: boolean;
  disks: Item[];
  linodeId: number;
  linodeStatus: string;
  apiDiskError?: string;
  notifySuccess: (successMessage: string) => void;
}

type CombinedFormProps = FormProps & FormikProps<FormValues & GeneralError>;

const PasswordResetForm: React.StatelessComponent<CombinedFormProps> = (props) => {

  // Only display errors (via onBlur) if the field has been touched.
  const diskError = props.touched.disk && props.errors.disk
  ? props.errors.disk
  : '';

  const passwordError = props.touched.password && props.errors.password
  ? props.errors.password
  : '';

  return (
    <Form>

      {/* <Notice /> component for general error */}
      {props.errors.none && <Notice text={props.errors.none} error />}

      {/* Disk selection */}
      <EnhancedSelect
        label="Disk"
        placeholder="Find a Disk"
        isLoading={props.disksLoading}

        // An API error could come from the container component, so check if one exists
        errorText={diskError || props.apiDiskError}

        options={props.disks}

        // Since this component deals with Items (and not React.ChangeEvents,
        // which Formik handles automatically), we need to manually:
        // 1) Set the field as touched
        // 2) Set the field value
        onChange={(selectedItem: Item) => {
          props.setFieldTouched('disk', true, true);
          props.setFieldValue('disk', selectedItem);
        }}

        onBlur={props.handleBlur}
        value={props.values.disk}
        data-qa-select-linode
      />

      {/* Password input */}
      <PasswordInput
        label="Password"
        name="password"
        value={props.values.password}
        onChange={(e) => {
          props.handleChange(e);

          // If user has already seen validation (via "onBlur" or "submit"),
          // show the validation "onChange" as a UX feature
          if (props.touched.password) {
            props.validateForm({ ...props.values, password: e.target.value});
          }
        }}
        onBlur={props.handleBlur}
        errorText={passwordError}
        errorGroup="linode-settings-password"
        error={Boolean(passwordError)}
      />

      <ActionsPanel>
        <Button
          type="primary"
          onClick={props.submitForm}
          loading={props.isSubmitting}
          disabled={props.linodeStatus !== 'offline' || props.isSubmitting}
          data-qa-password-save
          tooltipText={
            props.linodeStatus !== 'offline'
              ?
              'Your Linode must be fully powered down in order to change your root password'
              : ''
          }
        >
          Save
        </Button>
      </ActionsPanel>
    </Form>
  )
}

const formikOptions = {
  validateOnChange: false,
  validateOnBlur: true,
  // This is important! If "enableReinitialize" isn't set to `true`, the form will not reload
  // when the parent container component receives the disks from the API call.
  enableReinitialize: true
};

export const LinodeSettingsPasswordResetForm = withFormik<FormProps, FormValues>({

  ...formikOptions,

  // Initial form values from props
  mapPropsToValues: props => ({
    disk:  (props.disks && props.disks.length > 0) ? props.disks[0] : null,
    password: ''
  }),

  validate: (values: FormValues) => {
    const errors: FormikErrors<FormValues> = {};

    if (!values.disk) {
      errors.disk = 'Please select a disk';
    }

    const passwordValidationResponse = validateLinodeDiskPassword(values.password);
    if (!passwordValidationResponse.isValid) {
      errors.password = passwordValidationResponse.message;
    }

    return errors;
  },

  // "formikBag" is a collection of properties available from Formik.
  // https://jaredpalmer.com/formik/docs/api/formik#formik-render-methods-and-props
  handleSubmit: (values, formikBag) => {
    const { disk, password } = values;

    // TODO: Because validation will happen before "handleSubmit", "disk" will never be null.
    // However, Typescript complains when removing the following 3 lines ("Object is possibly null")
    if (!disk) {
      return;
    }

    const diskId = disk.value as number;
    const linodeId = formikBag.props.linodeId;

    changeDiskPassword(linodeId, diskId, password).then((res: any) => {
      formikBag.setSubmitting(false);
      formikBag.props.notifySuccess(res); // Notify parent component of success, so that it will show success notice
    }).catch(errors => {
      formikBag.setSubmitting(false);
      formikBag.setErrors(createFormErrors(errors));
    });
  }
})(PasswordResetForm);

const changeDiskPassword = (linodeId: number, diskId: number, password: string): Promise<String | Object> => {
  return new Promise((resolve, reject) => {
    changeLinodeDiskPassword(linodeId, diskId, password)
      .then(() => {
        resolve('Linode password changed successfully');
      })
      .catch((error: any) => {
        if (path(['error', 'response', 'data', 'errors'], error)) {
          reject(error.response.data.errors);
        } else {
          // TODO: Do we have a set of general error we could use instead?
          reject([{ reason: 'An error occurred' }]);
        }
      });
  });
}

// TODO: This should probably be a separate utility function in a different file

// Takes an array of field errors from the API and transforms them to FormikErrors
// TODO: One problem with this approach is that if there are multiple errors on the same field, we only use the last
// occurring error. We could instead put all of the errors in an array ({ password: ['error1', 'error2']}), but which
// would we display to the user? Or would we display both?
const createFormErrors = (errors: Linode.ApiFieldError[]): FormikErrors<FormValues & {none: string}> => {
  return reduce((formErrors: any, apiError: Linode.ApiFieldError) => {
    const key = apiError.field || 'none';
    return { ...formErrors, [key]: apiError.reason }
  }, {}, errors);
}
