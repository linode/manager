import { Formik } from 'formik';
import {
  AccessType,
  createObjectStorageKeysSchema,
  ObjectStorageBucket,
  ObjectStorageKey,
  ObjectStorageKeyRequest,
  Scope,
} from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import { useSelector } from 'react-redux';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import useBuckets from 'src/hooks/useObjectStorageBuckets';
import { ApplicationState } from 'src/store';
import EnableObjectStorageModal from '../EnableObjectStorageModal';
import { confirmObjectStorage } from '../utilities';
import LimitedAccessControls from './LimitedAccessControls';
import { MODE } from './types';
export interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ObjectStorageKeyRequest, formikProps: any) => void;
  mode: MODE;
  // If the mode is 'editing', we should have an ObjectStorageKey to edit
  objectStorageKey?: ObjectStorageKey;
  isRestrictedUser: boolean;
}

type CombinedProps = Props;

interface FormState {
  label: string;
  bucket_access: Scope[] | null;
}

/**
 * Helpers for converting a list of buckets
 * on the user's account into a list of
 * bucket_access in the shape the API will expect,
 * sorted by cluster.
 */
export const sortByCluster = (a: Scope, b: Scope) => {
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
      bucket_name: thisBucket.label,
      permissions: 'none' as AccessType,
    }))
    .sort(sortByCluster);

export const AccessKeyDrawer: React.FC<CombinedProps> = props => {
  const {
    isRestrictedUser,
    open,
    onClose,
    onSubmit,
    mode,
    objectStorageKey,
  } = props;

  const object_storage = useSelector(
    (state: ApplicationState) =>
      state.__resources.accountSettings.data?.object_storage ?? 'disabled'
  );

  const { objectStorageBuckets: buckets } = useBuckets();
  const hidePermissionsTable = buckets.data.length === 0;

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  // This is for local display management only, not part of the payload
  // and so not included in Formik's types
  const [limitedAccessChecked, setLimitedAccessChecked] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setLimitedAccessChecked(false);
    }
  }, [open]);

  const title =
    mode === 'creating' ? 'Create an Access Key' : 'Edit Access Key Label';

  const initialLabelValue =
    mode !== 'creating' && objectStorageKey ? objectStorageKey.label : '';

  const initialValues: FormState = {
    label: initialLabelValue,
    bucket_access: getDefaultScopes(buckets.data),
  };

  const handleSubmit = (values: ObjectStorageKeyRequest, formikProps: any) => {
    // If the user hasn't toggled the Limited Access button,
    // don't include any bucket_access information in the payload.

    // If any/all values are 'none', don't include them in the response.
    const access = values.bucket_access ?? [];
    const payload = limitedAccessChecked
      ? {
          ...values,
          bucket_access: access.filter(
            thisAccess => thisAccess.permissions !== 'none'
          ),
        }
      : { ...values, bucket_access: null };

    return onSubmit(payload, formikProps);
  };

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      wide={mode === 'creating'}
    >
      {buckets.loading ? (
        <CircleProgress />
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={createObjectStorageKeysSchema}
          validateOnChange={false}
          validateOnBlur={true}
          onSubmit={handleSubmit}
        >
          {formikProps => {
            const {
              values,
              errors,
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              isSubmitting,
              status,
            } = formikProps;

            const beforeSubmit = () => {
              confirmObjectStorage<FormState>(object_storage, formikProps, () =>
                setDialogOpen(true)
              );
            };

            const handleScopeUpdate = (newScopes: Scope[]) => {
              setFieldValue('bucket_access', newScopes);
            };

            const handleToggleAccess = () => {
              setLimitedAccessChecked(checked => !checked);
              // Reset scopes
              setFieldValue('bucket_access', getDefaultScopes(buckets.data));
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
                    text="You don't have bucket_access to create an Access Key. Please contact an account administrator for details."
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
                  disabled={isRestrictedUser || mode === 'viewing'}
                />
                {mode === 'creating' && !hidePermissionsTable ? (
                  <LimitedAccessControls
                    mode={mode}
                    bucket_access={values.bucket_access}
                    updateScopes={handleScopeUpdate}
                    handleToggle={handleToggleAccess}
                    checked={limitedAccessChecked}
                  />
                ) : null}
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
      )}
    </Drawer>
  );
};

export default React.memo(AccessKeyDrawer);
