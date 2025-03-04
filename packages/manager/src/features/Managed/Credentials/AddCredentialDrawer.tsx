import { Notice, TextField } from '@linode/ui';
import { Formik } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { handleFormikBlur } from 'src/utilities/formikTrimUtil';

import { creationSchema } from './credential.schema';

import type { CredentialPayload } from '@linode/api-v4/lib/managed';

const PasswordInput = React.lazy(() =>
  import('src/components/PasswordInput/PasswordInput').then((module) => ({
    default: module.PasswordInput,
  }))
);

export interface CredentialDrawerProps {
  onClose: () => void;
  onSubmit: (values: CredentialPayload, formikProps: any) => void;
  open: boolean;
}

const CredentialDrawer = (props: CredentialDrawerProps) => {
  const { onClose, onSubmit, open } = props;

  return (
    <Drawer onClose={onClose} open={open} title={'Add Credential'}>
      <Formik
        initialValues={{
          label: '',
          password: '',
          username: '',
        }}
        onSubmit={onSubmit}
        validateOnBlur={false}
        validateOnChange={false}
        validationSchema={creationSchema}
      >
        {(formikProps: any) => {
          const {
            errors,
            handleBlur,
            handleChange,
            handleSubmit,
            isSubmitting,
            status,
            values,
          } = formikProps;

          return (
            <>
              {status && (
                <Notice
                  data-qa-error
                  key={status}
                  text={status.generalError}
                  variant="error"
                />
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  data-qa-add-label
                  error={!!errors.label}
                  errorText={errors.label}
                  label="Label"
                  name="label"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.label}
                />

                <TextField
                  data-qa-add-username
                  error={!!errors.username}
                  errorText={errors.username}
                  label="Username"
                  name="username"
                  onBlur={(e) => handleFormikBlur(e, formikProps)}
                  onChange={handleChange}
                  optional
                  value={values.username}
                />

                <React.Suspense fallback={<SuspenseLoader />}>
                  <PasswordInput
                    data-qa-add-password
                    error={!!errors.password}
                    errorText={errors.password}
                    // This credential could be anything so might be counterproductive to validate strength
                    hideValidation
                    label="Password"
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="password"
                    value={values.password}
                  />
                </React.Suspense>
                <ActionsPanel
                  primaryButtonProps={{
                    'data-testid': 'submit',
                    label: 'Add Credential',
                    loading: isSubmitting,
                    onClick: () => handleSubmit(),
                  }}
                  secondaryButtonProps={{
                    'data-testid': 'cancel',
                    label: 'Cancel',
                    onClick: onClose,
                  }}
                />
              </form>
            </>
          );
        }}
      </Formik>
    </Drawer>
  );
};

export default CredentialDrawer;
