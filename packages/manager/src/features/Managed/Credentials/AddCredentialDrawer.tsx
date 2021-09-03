import { CredentialPayload } from '@linode/api-v4/lib/managed';
import { Formik } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TextField from 'src/components/TextField';
import { creationSchema } from './credential.schema';

const PasswordInput = React.lazy(() => import('src/components/PasswordInput'));

export interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CredentialPayload, formikProps: any) => void;
}

type CombinedProps = Props;

const CredentialDrawer: React.FC<CombinedProps> = (props) => {
  const { open, onClose, onSubmit } = props;

  return (
    <Drawer title={'Add Credential'} open={open} onClose={onClose}>
      <Formik
        initialValues={{
          label: '',
          password: '',
          username: '',
        }}
        validationSchema={creationSchema}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={onSubmit}
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
            {status && (
              <Notice
                key={status}
                text={status.generalError}
                error
                data-qa-error
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
                <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
                  Cancel
                </Button>
                <Button
                  buttonType="primary"
                  loading={isSubmitting}
                  onClick={() => handleSubmit()}
                  data-qa-submit
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
