import {
  AccessType,
  ObjectStorageBucket,
  ObjectStorageKey,
  ObjectStorageKeyRequest,
  Scope,
} from '@linode/api-v4/lib/object-storage';
import { createObjectStorageKeysSchema } from '@linode/validation/lib/objectStorageKeys.schema';
import { Formik } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { CircleProgress } from 'src/components/CircleProgress';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useAccountSettings } from 'src/queries/accountSettings';
import {
  useObjectStorageBuckets,
  useObjectStorageClusters,
} from 'src/queries/objectStorage';

import EnableObjectStorageModal from '../EnableObjectStorageModal';
import { confirmObjectStorage } from '../utilities';
import { LimitedAccessControls } from './LimitedAccessControls';
import { MODE } from './types';

export interface AccessKeyDrawerProps {
  isRestrictedUser: boolean;
  mode: MODE;
  // If the mode is 'editing', we should have an ObjectStorageKey to edit
  objectStorageKey?: ObjectStorageKey;
  onClose: () => void;
  onSubmit: (values: ObjectStorageKeyRequest, formikProps: any) => void;
  open: boolean;
}

interface FormState {
  bucket_access: Scope[] | null;
  label: string;
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
    .map((thisBucket) => ({
      bucket_name: thisBucket.label,
      cluster: thisBucket.cluster,
      permissions: 'none' as AccessType,
    }))
    .sort(sortByCluster);

export const AccessKeyDrawer = (props: AccessKeyDrawerProps) => {
  const {
    isRestrictedUser,
    mode,
    objectStorageKey,
    onClose,
    onSubmit,
    open,
  } = props;

  const {
    data: objectStorageClusters,
    isLoading: areClustersLoading,
  } = useObjectStorageClusters();

  const {
    data: objectStorageBucketsResponse,
    error: bucketsError,
    isLoading: areBucketsLoading,
  } = useObjectStorageBuckets(objectStorageClusters);
  const { data: accountSettings } = useAccountSettings();

  const buckets = objectStorageBucketsResponse?.buckets || [];

  const hasBuckets = buckets?.length > 0;

  const hidePermissionsTable =
    bucketsError || objectStorageBucketsResponse?.buckets.length === 0;

  const createMode = mode === 'creating';

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  // This is for local display management only, not part of the payload
  // and so not included in Formik's types
  const [limitedAccessChecked, setLimitedAccessChecked] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setLimitedAccessChecked(false);
    }
  }, [open]);

  const title = createMode ? 'Create Access Key' : 'Edit Access Key Label';

  const initialLabelValue =
    !createMode && objectStorageKey ? objectStorageKey.label : '';

  const initialValues: FormState = {
    bucket_access: getDefaultScopes(buckets),
    label: initialLabelValue,
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
            (thisAccess) => thisAccess.permissions !== 'none'
          ),
        }
      : { ...values, bucket_access: null };

    return onSubmit(payload, formikProps);
  };

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={title}
      wide={createMode && hasBuckets}
    >
      {areBucketsLoading || areClustersLoading ? (
        <CircleProgress />
      ) : (
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validateOnBlur={true}
          validateOnChange={false}
          validationSchema={createObjectStorageKeysSchema}
        >
          {(formikProps) => {
            const {
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              setFieldValue,
              status,
              values,
            } = formikProps;

            const beforeSubmit = () => {
              confirmObjectStorage<FormState>(
                accountSettings?.object_storage || 'active',
                formikProps,
                () => setDialogOpen(true)
              );
            };

            const handleScopeUpdate = (newScopes: Scope[]) => {
              setFieldValue('bucket_access', newScopes);
            };

            const handleToggleAccess = () => {
              setLimitedAccessChecked((checked) => !checked);
              // Reset scopes
              setFieldValue('bucket_access', getDefaultScopes(buckets));
            };

            return (
              <>
                {status && (
                  <Notice
                    data-qa-error
                    key={status}
                    text={status}
                    variant="error"
                  />
                )}

                {isRestrictedUser && (
                  <Notice
                    important
                    text="You don't have bucket_access to create an Access Key. Please contact an account administrator for details."
                    variant="error"
                  />
                )}

                {/* Explainer copy if we're in 'creating' mode */}
                {createMode && (
                  <Typography>
                    Generate an Access Key for use with an{' '}
                    <Link
                      className="h-u"
                      to="https://linode.com/docs/platform/object-storage/how-to-use-object-storage/#object-storage-tools"
                    >
                      S3-compatible client
                    </Link>
                    .
                  </Typography>
                )}

                {!hasBuckets ? (
                  <Typography sx={{ paddingTop: '10px' }}>
                    This key will have unlimited access to all buckets on your
                    account. The option to create a limited access key is only
                    available after creating one or more buckets.
                  </Typography>
                ) : null}

                <TextField
                  data-qa-add-label
                  disabled={isRestrictedUser || mode === 'viewing'}
                  error={!!errors.label}
                  errorText={errors.label}
                  label="Label"
                  name="label"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.label}
                />
                {createMode && !hidePermissionsTable ? (
                  <LimitedAccessControls
                    bucket_access={values.bucket_access}
                    checked={limitedAccessChecked}
                    handleToggle={handleToggleAccess}
                    mode={mode}
                    updateScopes={handleScopeUpdate}
                  />
                ) : null}
                <ActionsPanel
                  primaryButtonProps={{
                    'data-testid': 'submit',
                    disabled:
                      isRestrictedUser ||
                      (mode !== 'creating' &&
                        values.label === initialLabelValue),
                    label: createMode ? 'Create Access Key' : 'Save Changes',
                    loading: isSubmitting,
                    onClick: beforeSubmit,
                  }}
                  secondaryButtonProps={{
                    'data-testid': 'cancel',
                    label: 'Cancel',
                    onClick: onClose,
                  }}
                />
                <EnableObjectStorageModal
                  handleSubmit={handleSubmit}
                  onClose={() => setDialogOpen(false)}
                  open={dialogOpen}
                />
              </>
            );
          }}
        </Formik>
      )}
    </Drawer>
  );
};
