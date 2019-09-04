import { Formik } from 'formik';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { CredentialPayload } from 'src/services/managed';

import { creationSchema } from './credential.schema';

export interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CredentialPayload, formikProps: any) => void;
}

type CombinedProps = Props;

const CredentialDrawer: React.FC<CombinedProps> = props => {
  const { open, onClose, onSubmit } = props;

  return (
    <Drawer title={'Add Credential'} open={open} onClose={onClose}>
      <Formik
        initialValues={{
          label: '',
          password: '',
          username: ''
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
          isSubmitting
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
                name="label"
                label="Credential Label"
                data-qa-add-label
                value={values.label}
                error={!!errors.label}
                errorText={errors.label}
                onChange={handleChange}
                onBlur={handleBlur}
              />

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
                  Add
                </Button>
                <Button
                  onClick={onClose}
                  data-qa-cancel
                  buttonType="secondary"
                  className="cancel"
                >
                  Cancel
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
