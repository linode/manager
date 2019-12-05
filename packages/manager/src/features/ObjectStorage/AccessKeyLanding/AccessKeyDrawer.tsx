import { Formik } from 'formik';
import { AccountSettings } from 'linode-js-sdk/lib/account';
import {
  createObjectStorageKeysSchema,
  ObjectStorageKey,
  ObjectStorageKeyRequest
} from 'linode-js-sdk/lib/object-storage';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { ApplicationState } from 'src/store';
import EnableObjectStorageModal from '../EnableObjectStorageModal';
import { confirmObjectStorage } from '../utilities';

export type MODES = 'creating' | 'editing';

export interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ObjectStorageKeyRequest, formikProps: any) => void;
  mode: MODES;
  // If the mode is 'editing', we should have an ObjectStorageKey to edit
  objectStorageKey?: ObjectStorageKey;
  isRestrictedUser: boolean;
}

interface ReduxStateProps {
  object_storage: AccountSettings['object_storage'];
}

type CombinedProps = Props & ReduxStateProps;

interface FormState {
  label: string;
}

export const AccessKeyDrawer: React.StatelessComponent<CombinedProps> = props => {
  const {
    isRestrictedUser,
    open,
    onClose,
    onSubmit,
    mode,
    objectStorageKey
  } = props;

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  const title =
    mode === 'creating' ? 'Create an Access Key' : 'Edit Access Key';

  const initialLabelValue =
    mode === 'editing' && objectStorageKey ? objectStorageKey.label : '';

  const initialValues: FormState = {
    label: initialLabelValue
  };

  return (
    <Drawer title={title} open={open} onClose={onClose}>
      <Formik
        initialValues={initialValues}
        validationSchema={createObjectStorageKeysSchema}
        validateOnChange={false}
        validateOnBlur={true}
        onSubmit={onSubmit}
      >
        {formikProps => {
          const {
            values,
            errors,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting
          } = formikProps;

          const beforeSubmit = () => {
            confirmObjectStorage<FormState>(
              props.object_storage,
              formikProps,
              () => setDialogOpen(true)
            );
          };

          return (
            <>
              {status && (
                <Notice key={status} text={status} error data-qa-error />
              )}

              {isRestrictedUser && (
                <Notice
                  error
                  important
                  text="You don't have permissions to create an Access Key. Please contact an account administrator for details."
                />
              )}

              {/* Explainer copy if we're in 'creating' mode */}
              {mode === 'creating' && (
                <Typography>
                  Generate an Access Key for use with an{' '}
                  <a
                    href="https://linode.com/docs/platform/object-storage/how-to-use-object-storage/#object-storage-tools"
                    target="_blank"
                    aria-describedby="external-site"
                    rel="noopener noreferrer"
                    className="h-u"
                  >
                    S3-compatible client
                  </a>
                  .
                </Typography>
              )}

              <TextField
                name="label"
                label="Label"
                data-qa-add-label
                value={values.label}
                error={!!errors.label}
                errorText={errors.label}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isRestrictedUser}
              />
              <ActionsPanel>
                <Button
                  buttonType="primary"
                  onClick={beforeSubmit}
                  loading={isSubmitting}
                  disabled={isRestrictedUser}
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
              <EnableObjectStorageModal
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                handleSubmit={handleSubmit}
              />
            </>
          );
        }}
      </Formik>
    </Drawer>
  );
};

const mapStateToProps = (state: ApplicationState) => {
  return {
    object_storage: pathOr<AccountSettings['object_storage']>(
      'disabled',
      ['data', 'object_storage'],
      state.__resources.accountSettings
    )
  };
};

const connected = connect(mapStateToProps);

export default connected(AccessKeyDrawer);
