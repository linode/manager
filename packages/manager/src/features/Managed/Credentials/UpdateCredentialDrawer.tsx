import { ActionsPanel, Drawer, Notice, TextField } from '@linode/ui';
import { Formik } from 'formik';
import * as React from 'react';

import { NotFound } from 'src/components/NotFound';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { handleFormikBlur } from 'src/utilities/formikTrimUtil';

import { updateLabelSchema, updatePasswordSchema } from './credential.schema';

import type { FormikProps } from './CredentialList';
import type { CredentialPayload } from '@linode/api-v4/lib/managed';

const PasswordInput = React.lazy(() =>
  import('src/components/PasswordInput/PasswordInput').then((module) => ({
    default: module.PasswordInput,
  }))
);

export interface CredentialDrawerProps {
  isFetching: boolean;
  label: string;
  onClose: () => void;
  onSubmitLabel: (
    values: Partial<CredentialPayload>,
    formikProps: FormikProps
  ) => void;
  onSubmitPassword: (
    values: Partial<CredentialPayload>,
    formikProps: FormikProps
  ) => void;
  open: boolean;
}

const CredentialDrawer = (props: CredentialDrawerProps) => {
  const {
    isFetching,
    label,
    onClose,
    onSubmitLabel,
    onSubmitPassword,
    open,
  } = props;

  return (
    <Drawer
      NotFoundComponent={NotFound}
      isFetching={isFetching}
      onClose={onClose}
      open={open}
      title={`Edit Credential: ${label}`}
    >
      <Formik
        initialValues={{
          label,
        }}
        onSubmit={onSubmitLabel}
        validateOnBlur={false}
        validateOnChange={false}
        validationSchema={updateLabelSchema}
      >
        {({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          status,
          values,
        }) => (
          <>
            {status && status.generalError && (
              <Notice
                data-qa-error
                key={status.generalError}
                text={status.generalError}
                variant="error"
              />
            )}

            {status && status.success && (
              <Notice
                data-qa-success
                key={status.success}
                text={status.success}
                variant="success"
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

              <ActionsPanel
                primaryButtonProps={{
                  'data-testid': 'submit',
                  label: 'Update label',
                  loading: isSubmitting,
                  onClick: () => handleSubmit(),
                }}
              />
            </form>
          </>
        )}
      </Formik>
      <Formik
        initialValues={{
          password: '',
          username: '',
        }}
        onSubmit={onSubmitPassword}
        validateOnBlur={false}
        validateOnChange={false}
        validationSchema={updatePasswordSchema}
      >
        {(formikProps) => {
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
            <div style={{ paddingTop: '1em' }}>
              {status && status.generalError && (
                <Notice
                  data-qa-error
                  key={status.generalError}
                  spacingBottom={0}
                  text={status.generalError}
                  variant="error"
                />
              )}

              {status && status.success && (
                <Notice
                  data-qa-success
                  key={status.success}
                  spacingBottom={0}
                  text={status.success}
                  variant="success"
                />
              )}

              <form onSubmit={handleSubmit}>
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
                    label: 'Update credentials',
                    loading: isSubmitting,
                    onClick: () => handleSubmit(),
                  }}
                />
              </form>
            </div>
          );
        }}
      </Formik>
    </Drawer>
  );
};

export default CredentialDrawer;
