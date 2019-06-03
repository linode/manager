import { Formik } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { ObjectStorageKeyRequest } from 'src/services/profile/objectStorageKeys';
import { createObjectStorageKeysSchema } from 'src/services/profile/objectStorageKeys.schema';
import { MODES } from './AccessKeyLanding';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
  root: {}
});

export interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ObjectStorageKeyRequest, formikProps: any) => void;
  mode: MODES;
  // If the mode is 'editing', we should have an ObjectStorageKey to edit
  objectStorageKey?: Linode.ObjectStorageKey;
}

type CombinedProps = Props & WithStyles<ClassNames>;

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
                Generate an Access Key for use with an S3-compatible client.
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
                  type="primary"
                  onClick={() => handleSubmit()}
                  loading={isSubmitting}
                  data-qa-submit
                >
                  Submit
                </Button>
                <Button
                  onClick={onClose}
                  data-qa-cancel
                  type="secondary"
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

const styled = withStyles(styles);

export default styled(AccessKeyDrawer);
