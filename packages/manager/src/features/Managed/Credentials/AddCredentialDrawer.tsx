import { ActionsPanel, Drawer, Notice, TextField } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import { Formik } from 'formik';
import * as React from 'react';

import { NotFound } from 'src/components/NotFound';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useCreateCredentialMutation } from 'src/queries/managed/managed';
import { handleFormikBlur } from 'src/utilities/formikTrimUtil';

import { handleManagedErrors } from '../utils';
import { creationSchema } from './credential.schema';

import type { CredentialPayload } from '@linode/api-v4';
import type { FormikBag } from 'formik';

export type FormikProps = FormikBag<{}, CredentialPayload>;

const PasswordInput = React.lazy(() =>
  import('src/components/PasswordInput/PasswordInput').then((module) => ({
    default: module.PasswordInput,
  }))
);

export interface CredentialDrawerProps {
  onClose: () => void;
  open: boolean;
}

export const AddCredentialDrawer = (props: CredentialDrawerProps) => {
  const { onClose, open } = props;
  const navigate = useNavigate();
  const { mutateAsync: createCredential } = useCreateCredentialMutation();

  const handleCreate = (
    values: CredentialPayload,
    { setErrors, setStatus, setSubmitting }: FormikProps
  ) => {
    setStatus(undefined);
    createCredential(values)
      .then(() => {
        navigate({ to: '/managed/credentials' });
        setSubmitting(false);
      })
      .catch((e) => {
        handleManagedErrors({
          apiError: e,
          defaultMessage:
            'Unable to create this Credential. Please try again later.',
          setErrors,
          setStatus,
          setSubmitting,
        });
      });
  };

  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={onClose}
      open={open}
      title={'Add Credential'}
    >
      <Formik
        initialValues={{
          label: '',
          password: '',
          username: '',
        }}
        onSubmit={handleCreate}
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
