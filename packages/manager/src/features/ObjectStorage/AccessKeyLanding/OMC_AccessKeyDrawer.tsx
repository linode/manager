import { Region } from '@linode/api-v4';
import {
  AccessType,
  ObjectStorageBucket,
  ObjectStorageKey,
  ObjectStorageKeyRequest,
  Scope,
} from '@linode/api-v4/lib/object-storage';
import { omc_createObjectStorageKeysSchema } from '@linode/validation/lib/objectStorageKeys.schema';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { CircleProgress } from 'src/components/CircleProgress';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useAccountSettings } from 'src/queries/accountSettings';
import { useObjectStorageBucketsFromRegions } from 'src/queries/objectStorage';
import { useRegionsQuery } from 'src/queries/regions';
import { getRegionsByRegionId } from 'src/utilities/regions';

import { EnableObjectStorageModal } from '../EnableObjectStorageModal';
import { confirmObjectStorage } from '../utilities';
import { AccessKeyRegions } from './AccessKeyRegions';
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

export interface FormState {
  bucket_access: Scope[] | null;
  label: string;
  regions: string[];
}

/**
 * Helpers for converting a list of buckets
 * on the user's account into a list of
 * bucket_access in the shape the API will expect,
 * sorted by cluster.
 */
export const sortByRegion = (regionLookup: { [key: string]: Region }) => (
  a: Scope,
  b: Scope
) => {
  if (!a.region || !b.region) {
    return 0;
  }

  if (regionLookup[a.region].label > regionLookup[b.region].label) {
    return 1;
  }
  if (regionLookup[a.region].label < regionLookup[b.region].label) {
    return -1;
  }
  return 0;
};

export const getDefaultScopes = (
  buckets: ObjectStorageBucket[],
  regionLookup: { [key: string]: Region } = {}
): Scope[] =>
  buckets
    .map((thisBucket) => ({
      bucket_name: thisBucket.label,
      cluster: thisBucket.cluster,
      permissions: 'none' as AccessType,
      region: thisBucket.region,
    }))
    .sort(sortByRegion(regionLookup));

export const OMC_AccessKeyDrawer = (props: AccessKeyDrawerProps) => {
  const {
    isRestrictedUser,
    mode,
    objectStorageKey,
    onClose,
    onSubmit,
    open,
  } = props;

  const { data: regions } = useRegionsQuery();

  const regionsLookup = regions && getRegionsByRegionId(regions);

  const regionsSupportObjectStorage = regions?.filter((region) =>
    region.capabilities.includes('Object Storage')
  );

  const {
    data: objectStorageBuckets,
    error: bucketsError,
    isLoading: areBucketsLoading,
  } = useObjectStorageBucketsFromRegions(regionsSupportObjectStorage);

  const { data: accountSettings } = useAccountSettings();

  const buckets = objectStorageBuckets?.buckets || [];

  const hasBuckets = buckets?.length > 0;

  const hidePermissionsTable =
    bucketsError || objectStorageBuckets?.buckets.length === 0;

  const createMode = mode === 'creating';

  const [showBucketsTable, setShowBucketsTable] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  // This is for local display management only, not part of the payload
  // and so not included in Formik's types
  const [limitedAccessChecked, setLimitedAccessChecked] = useState(false);

  const title = createMode ? 'Create Access Key' : 'Edit Access Key Label';

  const initialLabelValue =
    !createMode && objectStorageKey ? objectStorageKey.label : '';
  const initialRegions =
    !createMode && objectStorageKey
      ? objectStorageKey.regions?.map((region) => region.id)
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

      onSubmit(payload, formik);
    },
    validateOnBlur: true,
    validateOnChange: false,
    validationSchema: omc_createObjectStorageKeysSchema,
  });

  const beforeSubmit = () => {
    confirmObjectStorage<FormState>(
      accountSettings?.object_storage || 'active',
      formik,
      () => setDialogOpen(true)
    );
  };

  const handleScopeUpdate = (newScopes: Scope[]) => {
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
      getDefaultScopes(bucketsInRegions, regionsLookup)
    );
  };

  useEffect(() => {
    setLimitedAccessChecked(false);
    formik.resetForm({ values: initialValues });
    setShowBucketsTable(false);
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
            error={!!formik.errors.label}
            errorText={formik.errors.label}
            label="Label"
            name="label"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            required
            value={formik.values.label}
          />
          <AccessKeyRegions
            onBlur={() => {
              const bucketsInRegions = buckets?.filter(
                (bucket) =>
                  bucket.region && formik.values.regions.includes(bucket.region)
              );

              formik.setFieldValue(
                'bucket_access',
                getDefaultScopes(bucketsInRegions, regionsLookup)
              );
              if (
                bucketsInRegions.length > 0 &&
                formik.values.regions.length > 0
              ) {
                setShowBucketsTable(true);
              }
            }}
            onChange={(values) => {
              const bucketsInRegions = buckets?.filter(
                (bucket) => bucket.region && values.includes(bucket.region)
              );
              formik.setFieldValue(
                'bucket_access',
                getDefaultScopes(bucketsInRegions, regionsLookup)
              );
              formik.setFieldValue('regions', values);
            }}
            disabled={isRestrictedUser}
            error={formik.errors.regions as string}
            name="regions"
            required
            selectedRegion={formik.values.regions}
          />
          {createMode && !hidePermissionsTable && showBucketsTable ? (
            <LimitedAccessControls
              bucket_access={formik.values.bucket_access}
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
                  formik.values.label === initialLabelValue),
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
