import { Formik } from 'formik';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { CredentialPayload } from 'src/services/managed';

import { updateLabelSchema, updatePasswordSchema } from './credential.schema';

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

const CredentialDrawer: React.FC<CombinedProps> = props => {
  const { label, open, onClose, onSubmitLabel, onSubmitPassword } = props;

  return (
    <Drawer title={'Edit Credential'} open={open} onClose={onClose}>
      <Formik
        initialValues={{
          label
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
          isSubmitting
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
                name="label"
                label="Credential Label"
                data-qa-add-label
                value={values.label}
                error={!!errors.label}
                errorText={errors.label}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <ActionsPanel>
                <Button
                  buttonType="primary"
                  onClick={() => handleSubmit()}
                  loading={isSubmitting}
                  data-qa-submit
                >
                  Save
                </Button>
              </ActionsPanel>
            </form>
          </>
        )}
      </Formik>
      <Formik
        initialValues={{
          password: '',
          username: ''
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
          isSubmitting
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
                name="username"
                label="Username (optional)"
                data-qa-add-username
                value={values.username}
                error={!!errors.username}
                errorText={errors.username}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <TextField
                name="password"
                label="Password / Passphrase"
                type="password"
                data-qa-add-password
                value={values.password}
                error={!!errors.password}
                errorText={errors.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <ActionsPanel>
                <Button
                  buttonType="primary"
                  onClick={() => handleSubmit()}
                  loading={isSubmitting}
                  data-qa-submit
                >
                  Save
                </Button>
              </ActionsPanel>
            </form>
          </>
        )}
      </Formik>
    </Drawer>
  );
};

export default CredentialDrawer;
