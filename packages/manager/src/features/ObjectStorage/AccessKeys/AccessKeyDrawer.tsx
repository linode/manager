import { Formik } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { ObjectStorageKeyRequest } from 'src/services/profile/objectStorageKeys';
import { createObjectStorageKeysSchema } from 'src/services/profile/objectStorageKeys.schema';
import { MODES } from './AccessKeyLanding';

export interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ObjectStorageKeyRequest, formikProps: any) => void;
  mode: MODES;
  // If the mode is 'editing', we should have an ObjectStorageKey to edit
  objectStorageKey?: Linode.ObjectStorageKey;
}

type CombinedProps = Props;

export const AccessKeyDrawer: React.StatelessComponent<
  CombinedProps
> = props => {
  const { open, onClose, onSubmit, mode, objectStorageKey } = props;

  const title =
    mode === 'creating' ? 'Create an Access Key' : 'Edit Access Key';

  const initialLabelValue =
    mode === 'editing' && objectStorageKey ? objectStorageKey.label : '';

  return (
    <Drawer title={title} open={open} onClose={onClose}>
      <Formik
        initialValues={{ label: initialLabelValue }}
        validationSchema={createObjectStorageKeysSchema}
        validateOnChange={false}
        validateOnBlur={true}
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
              <Notice key={status} text={status} error data-qa-error />
            )}

            {/* Explainer copy if we're in 'creating' mode */}
            {mode === 'creating' && (
              <Typography>
                Generate an Access Key for use with an{' '}
                <a
                  href="https://linode.com/docs/platform/object-storage/how-to-use-object-storage/#object-storage-tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-u"
                >
                  S3-compatible client
                </a>
                .
              </Typography>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                name="label"
                label="Label"
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
                  Submit
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

export default AccessKeyDrawer;
