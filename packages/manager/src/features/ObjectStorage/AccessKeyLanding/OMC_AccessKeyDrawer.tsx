import { useAccountSettings } from '@linode/queries';
import {
  ActionsPanel,
  CircleProgress,
  Drawer,
  Notice,
  TextField,
  Typography,
} from '@linode/ui';
import { sortByString } from '@linode/utilities';
import {
  createObjectStorageKeysSchema,
  updateObjectStorageKeysSchema,
} from '@linode/validation';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';

import { Link } from 'src/components/Link';
import { useObjectStorageRegions } from 'src/features/ObjectStorage/hooks/useObjectStorageRegions';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';

import { EnableObjectStorageModal } from '../EnableObjectStorageModal';
import { confirmObjectStorage } from '../utilities';
import { AccessKeyRegions } from './AccessKeyRegions/AccessKeyRegions';
import { LimitedAccessControls } from './LimitedAccessControls';
import {
  generateUpdatePayload,
  hasAccessBeenSelectedForAllBuckets,
  hasLabelOrRegionsChanged,
} from './utils';

import type { MODE } from './types';
import type {
  CreateObjectStorageKeyPayload,
  ObjectStorageBucket,
  ObjectStorageKey,
  ObjectStorageKeyBucketAccess,
  ObjectStorageKeyBucketAccessPermissions,
  Region,
  UpdateObjectStorageKeyPayload,
} from '@linode/api-v4';
import type { FormikProps } from 'formik';

export interface AccessKeyDrawerProps {
  isRestrictedUser: boolean;
  mode: MODE;
  // If the mode is 'editing', we should have an ObjectStorageKey to edit
  objectStorageKey?: ObjectStorageKey;
  onClose: () => void;
  onSubmit: (
    values: CreateObjectStorageKeyPayload | UpdateObjectStorageKeyPayload,
    formikProps: FormikProps<
      CreateObjectStorageKeyPayload | UpdateObjectStorageKeyPayload
    >
  ) => void;
  open: boolean;
}

// Access key scopes displayed in the drawer can have no permission or "No Access" selected, which are not valid API permissions.
export interface DisplayedAccessKeyScope
  extends Omit<ObjectStorageKeyBucketAccess, 'permissions'> {
  permissions: null | ObjectStorageKeyBucketAccessPermissions;
}

export interface FormState {
  bucket_access: null | ObjectStorageKeyBucketAccess[];
  label: string;
  regions: string[];
}

/**
 * Helpers for converting a list of buckets
 * on the user's account into a list of
 * bucket_access in the shape the API will expect,
 * sorted by region.
 */

export const sortByRegion =
  (regionLookup: { [key: string]: Region }) =>
  (a: DisplayedAccessKeyScope, b: DisplayedAccessKeyScope) => {
    if (!a.region || !b.region) {
      return 0;
    }

    return sortByString(
      regionLookup[a.region].label,
      regionLookup[b.region].label,
      'asc'
    );
  };

export const getDefaultScopes = (
  buckets: ObjectStorageBucket[],
  regionLookup: { [key: string]: Region } = {}
): DisplayedAccessKeyScope[] =>
  buckets
    .map((thisBucket) => ({
      bucket_name: thisBucket.label,
      cluster: thisBucket.cluster,
      permissions: null,
      region: thisBucket.region,
    }))
    .sort(sortByRegion(regionLookup));

export const OMC_AccessKeyDrawer = (props: AccessKeyDrawerProps) => {
  const { isRestrictedUser, mode, objectStorageKey, onClose, onSubmit, open } =
    props;

  const { regionsByIdMap } = useObjectStorageRegions();

  const {
    data: objectStorageBuckets,
    error: bucketsError,
    isLoading: areBucketsLoading,
  } = useObjectStorageBuckets();

  const { data: accountSettings } = useAccountSettings();

  const buckets = objectStorageBuckets?.buckets || [];

  const hasBuckets = buckets?.length > 0;

  const createMode = mode === 'creating';

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  // This is for local display management only, not part of the payload
  // and so not included in Formik's types
  const [limitedAccessChecked, setLimitedAccessChecked] = useState(false);

  const title = createMode ? 'Create Access Key' : 'Edit Access Key';

  const initialLabelValue =
    !createMode && objectStorageKey ? objectStorageKey.label : '';

  const initialRegions =
    !createMode && objectStorageKey?.regions
      ? objectStorageKey.regions.map((region) => region.id)
      : [];

  const initialValues: FormState = {
    bucket_access: [],
    label: initialLabelValue,
    regions: initialRegions,
  };

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      // If the user hasn't toggled the Limited Access button,
      // don't include any bucket_access information in the payload.

      // If any/all permissions are 'none' or null, don't include them in the response.
      const access = values.bucket_access ?? [];

      const payload = limitedAccessChecked
        ? {
            ...values,
            bucket_access: access.filter(
              (thisAccess: DisplayedAccessKeyScope) =>
                thisAccess.permissions !== 'none' &&
                thisAccess.permissions !== null
            ),
          }
        : { ...values, bucket_access: null };

      const updatePayload = generateUpdatePayload(values, initialValues);

      if (mode !== 'creating') {
        onSubmit(updatePayload, formik);
      } else {
        onSubmit(payload, formik);
      }
    },
    validateOnBlur: true,
    validationSchema: createMode
      ? createObjectStorageKeysSchema
      : updateObjectStorageKeysSchema,
  });

  // @TODO OBJ Multicluster: The objectStorageKey check is a temporary fix to handle error cases when the feature flag is enabled without Mock Service Worker (MSW). This can be removed during the feature flag cleanup.
  const isSaveDisabled =
    isRestrictedUser ||
    (mode !== 'creating' &&
      objectStorageKey?.regions &&
      !hasLabelOrRegionsChanged(formik.values, objectStorageKey)) ||
    (mode === 'creating' &&
      limitedAccessChecked &&
      !hasAccessBeenSelectedForAllBuckets(formik.values.bucket_access));

  const beforeSubmit = () => {
    confirmObjectStorage<FormState>(
      accountSettings?.object_storage || 'active',
      formik,
      () => setDialogOpen(true)
    );
  };

  const handleScopeUpdate = (newScopes: ObjectStorageKeyBucketAccess[]) => {
    formik.setFieldValue('bucket_access', newScopes);
  };

  const handleToggleAccess = () => {
    setLimitedAccessChecked((checked) => !checked);
    // Reset scopes
    const bucketsInRegions = buckets?.filter(
      (bucket) => bucket.region && formik.values.regions.includes(bucket.region)
    );

    formik.setFieldValue(
      'bucket_access',
      getDefaultScopes(bucketsInRegions, regionsByIdMap)
    );
  };

  useEffect(() => {
    setLimitedAccessChecked(false);
    formik.resetForm({ values: initialValues });
  }, [open]);

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={title}
      wide={createMode && hasBuckets}
    >
      {areBucketsLoading ? (
        <CircleProgress />
      ) : (
        <>
          {formik.status && (
            <Notice
              data-qa-error
              key={formik.status}
              text={formik.status}
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
            error={formik.touched.label ? !!formik.errors.label : false}
            errorText={formik.touched.label ? formik.errors.label : undefined}
            label="Label"
            name="label"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            required
            value={formik.values.label}
          />
          <AccessKeyRegions
            disabled={isRestrictedUser}
            error={
              formik.touched.regions
                ? (formik.errors.regions as string)
                : undefined
            }
            name="regions"
            onChange={(values) => {
              const bucketsInRegions = buckets?.filter(
                (bucket) => bucket.region && values.includes(bucket.region)
              );
              formik.setFieldValue(
                'bucket_access',
                getDefaultScopes(bucketsInRegions, regionsByIdMap)
              );
              formik.setFieldValue('regions', values);
            }}
            required
            selectedRegion={formik.values.regions}
          />
          {createMode && (
            <Typography
              sx={(theme) => ({
                marginTop: theme.spacing(2),
              })}
            >
              Unlimited S3 access key can be used to create buckets in the
              selected region using S3 Endpoint returned on successful creation
              of the key.
            </Typography>
          )}
          {createMode && !bucketsError && (
            <LimitedAccessControls
              bucket_access={formik.values.bucket_access}
              checked={limitedAccessChecked}
              handleToggle={handleToggleAccess}
              mode={mode}
              selectedRegions={formik.values.regions}
              updateScopes={handleScopeUpdate}
            />
          )}
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled: isSaveDisabled,
              label: createMode ? 'Create Access Key' : 'Save Changes',
              loading: formik.isSubmitting,
              onClick: beforeSubmit,
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: onClose,
            }}
          />
          <EnableObjectStorageModal
            handleSubmit={formik.handleSubmit}
            onClose={() => setDialogOpen(false)}
            open={dialogOpen}
          />
        </>
      )}
    </Drawer>
  );
};
