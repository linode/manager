import { CredentialPayload } from '@linode/api-v4/lib/managed';
import { Formik } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TextField from 'src/components/TextField';
import { updateLabelSchema, updatePasswordSchema } from './credential.schema';

const PasswordInput = React.lazy(() => import('src/components/PasswordInput'));

export interface Props {
  label: string;
  open: boolean;
  onClose: () => void;
  onSubmitLabel: (values: Partial<CredentialPayload>, formikProps: any) => void;
  onSubmitPassword: (
    values: Partial<CredentialPayload>,
    formikProps: any
  ) => void;
}

type CombinedProps = Props;

const CredentialDrawer: React.FC<CombinedProps> = (props) => {
  const { label, open, onClose, onSubmitLabel, onSubmitPassword } = props;

  return (
    <Drawer title={`Edit Credential: ${label}`} open={open} onClose={onClose}>
      <Formik
        initialValues={{
          label,
        }}
        validationSchema={updateLabelSchema}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={onSubmitLabel}
      >
        {({
          values,
          errors,
          status,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <>
            {status && status.generalError && (
              <Notice
                key={status.generalError}
                text={status.generalError}
                error
                data-qa-error
              />
            )}

            {status && status.success && (
              <Notice
                key={status.success}
                text={status.success}
                success
                data-qa-success
              />
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Label"
                name="label"
                error={!!errors.label}
                errorText={errors.label}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.label}
                data-qa-add-label
              />

              <ActionsPanel>
                <Button
                  buttonType="primary"
                  loading={isSubmitting}
                  onClick={() => handleSubmit()}
                  data-qa-submit
                >
                  Update label
                </Button>
              </ActionsPanel>
            </form>
          </>
        )}
      </Formik>
      <Formik
        initialValues={{
          password: '',
          username: '',
        }}
        validationSchema={updatePasswordSchema}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={onSubmitPassword}
      >
        {({
          values,
          errors,
          status,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <div style={{ paddingTop: '1em' }}>
            {status && status.generalError && (
              <Notice
                key={status.generalError}
                text={status.generalError}
                error
                data-qa-error
                spacingBottom={0}
              />
            )}

            {status && status.success && (
              <Notice
                key={status.success}
                text={status.success}
                success
                data-qa-success
                spacingBottom={0}
              />
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Username"
                name="username"
                error={!!errors.username}
                errorText={errors.username}
                onBlur={handleBlur}
                onChange={handleChange}
                optional
                value={values.username}
                data-qa-add-username
              />

              <React.Suspense fallback={<SuspenseLoader />}>
                <PasswordInput
                  label="Password"
                  name="password"
                  error={!!errors.password}
                  errorText={errors.password}
                  // This credential could be anything so might be counterproductive to validate strength
                  hideValidation
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="password"
                  value={values.password}
                  data-qa-add-password
                />
              </React.Suspense>
              <ActionsPanel>
                <Button
                  buttonType="primary"
                  onClick={() => handleSubmit()}
                  loading={isSubmitting}
                  data-qa-submit
                >
                  Update credentials
                </Button>
              </ActionsPanel>
            </form>
          </div>
        )}
      </Formik>
    </Drawer>
  );
};

export default CredentialDrawer;
