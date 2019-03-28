import { Formik } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { CreateObjectStorageKeyRequest } from 'src/services/profile/objectStorageKeys';
import { createObjectStorageKeysSchema } from 'src/services/profile/objectStorageKeys.schema';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

export interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateObjectStorageKeyRequest, formikProps: any) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ObjectStorageDrawer: React.StatelessComponent<
  CombinedProps
> = props => {
  const { open, onClose, onSubmit } = props;

  return (
    <Drawer title="Create an Object Storage Key" open={open} onClose={onClose}>
      <Formik
        initialValues={{ label: '' }}
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
          isSubmitting,
          resetForm
        }) => (
          <>
            {status && (
              <Notice key={status} text={status} error data-qa-error />
            )}

            <Typography>
              Generate an Object Storage key pair for use with an S3-compatible
              client.
            </Typography>

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
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
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

export default styled(ObjectStorageDrawer);
