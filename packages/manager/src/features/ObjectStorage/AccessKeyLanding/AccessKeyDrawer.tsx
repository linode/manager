import { Formik } from 'formik';
import {
  AccessType,
  createObjectStorageKeysSchema,
  ObjectStorageBucket,
  ObjectStorageKey,
  ObjectStorageKeyRequest,
  Scope
} from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import { useSelector } from 'react-redux';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import useBuckets from 'src/hooks/useObjectStorageBuckets';
import { ApplicationState } from 'src/store';
import EnableObjectStorageModal from '../EnableObjectStorageModal';
import { confirmObjectStorage } from '../utilities';
import LimitedAccessControls from './LimitedAccessControls';

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

type CombinedProps = Props;

interface FormState {
  label: string;
  scopes?: Scope[];
}

/**
 * Helpers for converting a list of buckets
 * on the user's account into a list of
 * permissions in the shape the API will expect,
 * sorted by cluster.
 */
const sortByCluster = (a: Scope, b: Scope) => {
  if (a.cluster > b.cluster) {
    return 1;
  }
  if (a.cluster < b.cluster) {
    return -1;
  }
  return 0;
};

export const getDefaultScopes = (buckets: ObjectStorageBucket[]): Scope[] =>
  buckets
    .map(thisBucket => ({
      cluster: thisBucket.cluster,
      bucket: thisBucket.label,
      access: 'none' as AccessType
    }))
    .sort(sortByCluster);

export const AccessKeyDrawer: React.FC<CombinedProps> = props => {
  const {
    isRestrictedUser,
    open,
    onClose,
    onSubmit,
    mode,
    objectStorageKey
  } = props;

  const object_storage = useSelector(
    (state: ApplicationState) =>
      state.__resources.accountSettings.data?.object_storage ?? 'disabled'
  );

  const { objectStorageBuckets: buckets } = useBuckets();

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  // This is for local display management only, not part of the payload
  // and so not included in Formik's types
  const [limitedAccessChecked, setLimitedAccessChecked] = React.useState(false);

  const title =
    mode === 'creating' ? 'Create an Access Key' : 'Edit Access Key';

  const initialLabelValue =
    mode === 'editing' && objectStorageKey ? objectStorageKey.label : '';

  const initialValues: FormState = {
    label: initialLabelValue,
    scopes: getDefaultScopes(buckets.data)
  };

  return (
    <Drawer title={title} open={open} onClose={onClose} wide>
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
            isSubmitting,
            status
          } = formikProps;

          const beforeSubmit = () => {
            confirmObjectStorage<FormState>(object_storage, formikProps, () =>
              setDialogOpen(true)
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
              <LimitedAccessControls
                mode={mode}
                scopes={values.scopes}
                handleToggle={() =>
                  setLimitedAccessChecked(checked => !checked)
                }
                checked={limitedAccessChecked}
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

export default React.memo(AccessKeyDrawer);
