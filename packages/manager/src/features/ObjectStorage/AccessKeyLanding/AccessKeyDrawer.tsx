import { useAccountSettings } from '@linode/queries';
import {
  ActionsPanel,
  CircleProgress,
  Drawer,
  Notice,
  TextField,
  Typography,
} from '@linode/ui';
import { createObjectStorageKeysSchema } from '@linode/validation/lib/objectStorageKeys.schema';
import { Formik } from 'formik';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { NotFound } from 'src/components/NotFound';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';

import { EnableObjectStorageModal } from '../EnableObjectStorageModal';
import { confirmObjectStorage } from '../utilities';
import { LimitedAccessControls } from './LimitedAccessControls';

import type { MODE } from './types';
import type {
  CreateObjectStorageKeyPayload,
  ObjectStorageBucket,
  ObjectStorageKey,
  ObjectStorageKeyBucketAccess,
  ObjectStorageKeyBucketAccessPermissions,
  UpdateObjectStorageKeyPayload,
} from '@linode/api-v4/lib/object-storage';
import type { FormikProps } from 'formik';

export interface AccessKeyDrawerProps {
  isRestrictedUser: boolean;
  mode: MODE;
  // If the mode is 'editing', we should have an ObjectStorageKey to edit
  objectStorageKey?: ObjectStorageKey;
  onClose: () => void;
  onSubmit: (
    values: CreateObjectStorageKeyPayload | UpdateObjectStorageKeyPayload,
    formikProps: FormikProps<CreateObjectStorageKeyPayload>
  ) => void;
  open: boolean;
}

interface FormState {
  bucket_access: null | ObjectStorageKeyBucketAccess[];
  label: string;
}

/**
 * Helpers for converting a list of buckets
 * on the user's account into a list of
 * bucket_access in the shape the API will expect,
 * sorted by cluster.
 */
export const sortByCluster = (
  a: ObjectStorageKeyBucketAccess,
  b: ObjectStorageKeyBucketAccess
) => {
  if (a.cluster > b.cluster) {
    return 1;
  }
  if (a.cluster < b.cluster) {
    return -1;
  }
  return 0;
};

export const getDefaultScopes = (
  buckets: ObjectStorageBucket[]
): ObjectStorageKeyBucketAccess[] =>
  buckets
    .map((thisBucket) => ({
      bucket_name: thisBucket.label,
      cluster: thisBucket.cluster,
      permissions: 'none' as ObjectStorageKeyBucketAccessPermissions,
      region: thisBucket.region ?? '',
    }))
    .sort(sortByCluster);

export const AccessKeyDrawer = (props: AccessKeyDrawerProps) => {
  const { isRestrictedUser, mode, objectStorageKey, onClose, onSubmit, open } =
    props;

  const { data: accountSettings } = useAccountSettings();

  const {
    data: objectStorageBucketsResponse,
    error: bucketsError,
    isLoading: areBucketsLoading,
  } = useObjectStorageBuckets();

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

  const handleSubmit = (
    values: CreateObjectStorageKeyPayload,
    formikProps: FormikProps<CreateObjectStorageKeyPayload>
  ) => {
    // If the user hasn't toggled the Limited Access button,
    // don't include any bucket_access information in the payload.

    // If any/all values are 'none', don't include them in the response.
    let payload = {};
    if (
      mode === 'creating' &&
      values?.bucket_access !== null &&
      limitedAccessChecked
    ) {
      const access = values?.bucket_access ?? [];
      payload = {
        ...values,
        bucket_access: access.filter(
          (thisAccess) => thisAccess.permissions !== 'none'
        ),
      };
    } else {
      payload = { ...values, bucket_access: null };
    }

    if (mode === 'editing') {
      payload = {
        label: values.label,
      };
    }
    return onSubmit(payload, formikProps);
  };

  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={onClose}
      open={open}
      title={title}
      wide={createMode && hasBuckets}
    >
      {areBucketsLoading ? (
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

            const handleScopeUpdate = (
              newScopes: ObjectStorageKeyBucketAccess[]
            ) => {
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
                    text="You don't have permissions to create an Access Key. Please contact an account administrator for details."
                    variant="error"
                  />
                )}

                {/* Explainer copy if we're in 'creating' mode */}
                {createMode && (
                  <Typography>
                    Generate an Access Key for use with an{' '}
                    <Link
                      className="h-u"
                      to="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-object-storage#object-storage-tools"
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
