import { CredentialPayload } from '@linode/api-v4/lib/managed';
import { Formik } from 'formik';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import Drawer from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import SuspenseLoader from 'src/components/SuspenseLoader';
import { TextField } from 'src/components/TextField';

import { creationSchema } from './credential.schema';

const PasswordInput = React.lazy(
  () => import('src/components/PasswordInput/PasswordInput')
);

export interface Props {
  onClose: () => void;
  onSubmit: (values: CredentialPayload, formikProps: any) => void;
  open: boolean;
}

type CombinedProps = Props;

const CredentialDrawer: React.FC<CombinedProps> = (props) => {
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
            {status && (
              <Notice
                data-qa-error
                error
                key={status}
                text={status.generalError}
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
                onBlur={handleBlur}
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
              <ActionsPanel>
                <Button buttonType="secondary" data-qa-cancel onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  buttonType="primary"
                  data-qa-submit
                  loading={isSubmitting}
                  onClick={() => handleSubmit()}
                >
                  Add Credential
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
