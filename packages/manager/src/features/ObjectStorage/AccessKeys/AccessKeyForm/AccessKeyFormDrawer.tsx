import { getAPIErrorOrDefault, getErrorMap } from '@akamai/compute-ui-core/api';
import { sortByString } from '@akamai/compute-ui-core/formatting';
import { useAccountSettings, useProfile } from '@linode/queries';
import {
  ActionsPanel,
  CircleProgress,
  Drawer,
  ErrorState,
  Notice,
  TextField,
  Typography,
} from '@linode/ui';
import { useOpenClose } from '@linode/utilities';
import {
  createObjectStorageKeysSchema,
  updateObjectStorageKeysSchema,
} from '@linode/validation';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';

import { Link } from 'src/components/Link';
import { useObjectStorageBuckets } from 'src/features/ObjectStorage/Buckets/hooks/useObjectStorageBuckets';
import { useObjectStorageRegions } from 'src/features/ObjectStorage/shared/hooks/useObjectStorageRegions';
import {
  useCreateAccessKeyMutation,
  useObjectStorageAccessKey,
  useUpdateAccessKeyMutation,
} from 'src/queries/object-storage/queries';

import { EnableObjectStorageModal } from '../../shared/components/Modal/EnableObjectStorageModal';
import { ObjectStorageRegionMultiSelect } from '../../shared/components/RegionSelect/ObjectStorageRegionMultiSelect';
import { confirmObjectStorage } from '../../shared/utils/utilities';
import {
  generateUpdatePayload,
  hasAccessBeenSelectedForAllBuckets,
  hasLabelOrRegionsChanged,
} from '../utils/utils';
import { AccessKeyBucketAccessControls } from './AccessKeyBucketAccessControls';
import { AccessKeySecretTokenDialog } from './AccessKeySecretTokenDialog';

import type { MODE } from '../../shared/types';
import type {
  CreateObjectStorageKeyPayload,
  ObjectStorageBucket,
  ObjectStorageKey,
  ObjectStorageKeyBucketAccess,
  ObjectStorageKeyBucketAccessPermissions,
  Region,
  UpdateObjectStorageKeyPayload,
} from '@linode/api-v4';
import type { OpenClose } from '@linode/utilities';
import type { FormikHelpers } from 'formik';

export interface AccessKeyDrawerProps {
  accessKeyId?: number;
  isOpen: boolean;
  mode: MODE;
  onClose: () => void;
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
    .map(
      (thisBucket): DisplayedAccessKeyScope => ({
        bucket_name: thisBucket.label,
        region: thisBucket.region,
        cluster: thisBucket.cluster,
        permissions: null,
      })
    )
    .sort(sortByRegion(regionLookup));

export const AccessKeyFormDrawer = (props: AccessKeyDrawerProps) => {
  const { mode, onClose, isOpen, accessKeyId } = props;

  const displayKeysDialog = useOpenClose();
  // Key to display in Confirmation Modal upon creation
  const [keyToDisplay, setKeyToDisplay] =
    React.useState<null | ObjectStorageKey>(null);

  const {
    data: buckets = [],
    error,
    isLoading: areBucketsLoading,
  } = useObjectStorageBuckets();

  const hasBuckets = buckets.length > 0;
  const createMode = mode === 'creating';
  const title = createMode ? 'Create Access Key' : 'Edit Access Key';

  return (
    <>
      <Drawer
        onClose={onClose}
        open={isOpen}
        title={title}
        wide={createMode && hasBuckets}
      >
        <AccessKeyDrawerContent
          accessKeyId={accessKeyId}
          areBucketsLoading={areBucketsLoading}
          buckets={buckets}
          bucketsError={error}
          createMode={createMode}
          displayKeysDialog={displayKeysDialog}
          hasBuckets={hasBuckets}
          isOpen={isOpen}
          onClose={onClose}
          setKeyToDisplay={setKeyToDisplay}
        />
      </Drawer>

      {keyToDisplay && (
        <AccessKeySecretTokenDialog
          objectStorageKey={keyToDisplay}
          onClose={displayKeysDialog.close}
          open={displayKeysDialog.isOpen}
          title="Access Keys"
        />
      )}
    </>
  );
};

export interface AccessKeyDrawerContentProps {
  accessKeyId?: number;
  areBucketsLoading: boolean;
  buckets: ObjectStorageBucket[];
  bucketsError: null | string;
  createMode: boolean;
  displayKeysDialog: OpenClose;
  hasBuckets: boolean;
  isOpen: boolean;
  onClose: () => void;
  setKeyToDisplay: (key: ObjectStorageKey) => void;
}

// TODO: Extract AccessKeyForm component from the content component
const AccessKeyDrawerContent = (props: AccessKeyDrawerContentProps) => {
  const {
    onClose,
    isOpen,
    accessKeyId,
    setKeyToDisplay,
    displayKeysDialog,
    createMode,
    buckets,
    areBucketsLoading,
    bucketsError,
    hasBuckets,
  } = props;

  const {
    data: objectStorageKey,
    isLoading: isObjectStorageKeyLoading,
    error: objectStorageKeyError,
  } = useObjectStorageAccessKey(
    accessKeyId ?? -1,
    accessKeyId !== null && accessKeyId !== undefined
  );

  const { data: profile, error: profileError } = useProfile();
  const isRestrictedUser = profile?.restricted ?? false;

  const { regionsByIdMap, errors: regionsError } = useObjectStorageRegions();

  const { data: accountSettings } = useAccountSettings();
  const { mutateAsync: createAccessKey } = useCreateAccessKeyMutation();
  const { mutateAsync: updateAccessKey } = useUpdateAccessKeyMutation();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  // This is for local display management only, not part of the payload
  // and so not included in Formik's types
  const [limitedAccessChecked, setLimitedAccessChecked] = useState(false);

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

  const handleCreateKey = (
    values: CreateObjectStorageKeyPayload,
    {
      setErrors,
      setStatus,
      setSubmitting,
    }: FormikHelpers<CreateObjectStorageKeyPayload>
  ) => {
    // Clear out status (used for general errors)
    setStatus(null);
    setSubmitting(true);

    createAccessKey(values)
      .then((data) => {
        setSubmitting(false);

        setKeyToDisplay(data);

        onClose();
        displayKeysDialog.open();
      })
      .catch((errorResponse) => {
        setSubmitting(false);

        const errors = getAPIErrorOrDefault(
          errorResponse,
          'There was an issue creating your Access Key.'
        );
        const mappedErrors = getErrorMap(['label'], errors);

        // `status` holds general errors
        if (mappedErrors.none) {
          setStatus(mappedErrors.none);
        }

        setErrors(mappedErrors);
      });
  };

  const handleEditKey = (
    values: UpdateObjectStorageKeyPayload,
    {
      setErrors,
      setStatus,
      setSubmitting,
    }: FormikHelpers<UpdateObjectStorageKeyPayload>
  ) => {
    // This shouldn't happen, but just in case.
    if (!objectStorageKey) {
      return;
    }

    // Clear out status (used for general errors)
    setStatus(null);

    // If the new label is the same as the old one, no need to make an API
    // request. Just close the drawer and return early.
    if (values.label === objectStorageKey.label) {
      return onClose();
    }

    setSubmitting(true);

    updateAccessKey({ data: values, id: objectStorageKey.id })
      .then((_) => {
        setSubmitting(false);
        onClose();
      })
      .catch((errorResponse) => {
        setSubmitting(false);

        const errors = getAPIErrorOrDefault(
          errorResponse,
          'There was an issue updating your Access Key.'
        );
        const mappedErrors = getErrorMap(['label'], errors);

        // `status` holds general errors
        if (mappedErrors.none) {
          setStatus(mappedErrors.none);
        }

        setErrors(mappedErrors);
      });
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (createMode) {
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

        handleCreateKey(payload, formik);
      } else {
        const updatePayload = generateUpdatePayload(values, initialValues);
        handleEditKey(updatePayload, formik);
      }
    },
    validateOnBlur: true,
    validationSchema: createMode
      ? createObjectStorageKeysSchema
      : updateObjectStorageKeysSchema,
  });

  const isSaveDisabled =
    isRestrictedUser ||
    (!createMode &&
      objectStorageKey &&
      !hasLabelOrRegionsChanged(formik.values, objectStorageKey)) ||
    (createMode &&
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
    const bucketsInRegions = buckets.filter(
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
  }, [isOpen]);

  if (areBucketsLoading || isObjectStorageKeyLoading) {
    return <CircleProgress />;
  }

  if (objectStorageKeyError || bucketsError || regionsError || profileError) {
    const error = objectStorageKeyError ?? regionsError ?? profileError;

    return (
      <ErrorState errorText={(error && error[0])?.reason ?? bucketsError!} />
    );
  }

  return (
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
          This key will have unlimited access to all buckets on your account.
          The option to create a limited access key is only available after
          creating one or more buckets.
        </Typography>
      ) : null}

      <TextField
        data-qa-add-label
        disabled={isRestrictedUser}
        error={formik.touched.label ? !!formik.errors.label : false}
        errorText={formik.touched.label ? formik.errors.label : undefined}
        label="Label"
        name="label"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        required
        value={formik.values.label}
      />

      <ObjectStorageRegionMultiSelect
        disabled={isRestrictedUser}
        error={
          formik.touched.regions ? (formik.errors.regions as string) : undefined
        }
        name="regions"
        onChange={(values) => {
          const bucketsInRegions = buckets.filter(
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
          Unlimited S3 access key can be used to create buckets in the selected
          region using S3 Endpoint returned on successful creation of the key.
        </Typography>
      )}

      {createMode && !bucketsError && (
        <AccessKeyBucketAccessControls
          bucket_access={formik.values.bucket_access}
          checked={limitedAccessChecked}
          handleToggle={handleToggleAccess}
          mode="creating"
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
  );
};
