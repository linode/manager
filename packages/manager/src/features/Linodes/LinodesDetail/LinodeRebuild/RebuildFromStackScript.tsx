import { rebuildLinode } from '@linode/api-v4/lib/linodes';
import { RebuildLinodeFromStackScriptSchema } from '@linode/validation/lib/linodes.schema';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { isEmpty } from 'ramda';
import * as React from 'react';

import { AccessPanel } from 'src/components/AccessPanel/AccessPanel';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';
import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';
import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel/SelectStackScriptPanel';
import StackScriptDialog from 'src/features/StackScripts/StackScriptDialog';
import {
  getCommunityStackscripts,
  getMineAndAccountStackScripts,
} from 'src/features/StackScripts/stackScriptUtils';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel/UserDefinedFieldsPanel';
import { useStackScript } from 'src/hooks/useStackScript';
import { listToItemsByID } from 'src/queries/base';
import { useEventsPollingActions } from 'src/queries/events/events';
import { useAllImagesQuery } from 'src/queries/images';
import { usePreferences } from 'src/queries/profile/preferences';
import { filterImagesByType } from 'src/store/image/image.helpers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';
import { extendValidationSchema } from 'src/utilities/validatePassword';

import { ImageEmptyState } from './ImageEmptyState';

import type { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import type { APIError } from '@linode/api-v4/lib/types';
import type { FormikProps } from 'formik';

interface Props {
  disabled: boolean;
  diskEncryptionEnabled: boolean;
  handleRebuildError: (status: string) => void;
  isLKELinode: boolean;
  linodeId: number;
  linodeIsInDistributedRegion: boolean;
  linodeLabel?: string;
  linodeRegion?: string;
  onClose: () => void;
  passwordHelperText: string;
  toggleDiskEncryptionEnabled: () => void;
  type: 'account' | 'community';
}

interface RebuildFromStackScriptForm {
  authorized_users: string[];
  disk_encryption: string | undefined;
  image: string;
  root_pass: string;
  stackscript_id: string;
}

const initialValues: RebuildFromStackScriptForm = {
  authorized_users: [],
  disk_encryption: 'enabled',
  image: '',
  root_pass: '',
  stackscript_id: '',
};

export const RebuildFromStackScript = (props: Props) => {
  const {
    diskEncryptionEnabled,
    handleRebuildError,
    isLKELinode,
    linodeId,
    linodeIsInDistributedRegion,
    linodeLabel,
    linodeRegion,
    onClose,
    passwordHelperText,
    toggleDiskEncryptionEnabled,
  } = props;

  const {
    data: preferences,
    isLoading: isLoadingPreferences,
  } = usePreferences();

  const { checkForNewEvents } = useEventsPollingActions();

  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const { data: imagesData, isLoading: isLoadingImages } = useAllImagesQuery();
  const _imagesData = listToItemsByID(imagesData ?? []);
  const isLoading = isLoadingPreferences || isLoadingImages;

  /**
   * Dynamic validation schema, with password validation
   * dependent on a value from a feature flag. Remove this
   * once API password validation is stable.
   */
  const RebuildSchema = () =>
    extendValidationSchema(RebuildLinodeFromStackScriptSchema);

  const [confirmationText, setConfirmationText] = React.useState<string>('');
  const submitButtonDisabled =
    preferences?.type_to_confirm !== false && confirmationText !== linodeLabel;

  const [
    ss,
    handleSelectStackScript,
    handleChangeUDF,
    resetStackScript,
  ] = useStackScript(
    Object.keys(_imagesData).map((eachKey) => _imagesData[eachKey])
  );

  // In this component, most errors are handled by Formik. This is not
  // possible with UDFs, since they are dynamic. Their errors need to
  // be handled separately.
  const [udfErrors, setUdfErrors] = React.useState<APIError[] | undefined>(
    undefined
  );

  const handleFormSubmit = (
    { authorized_users, image, root_pass }: RebuildFromStackScriptForm,
    {
      setErrors,
      setStatus,
      setSubmitting,
    }: FormikProps<RebuildFromStackScriptForm>
  ) => {
    setSubmitting(true);

    // if the linode is part of an LKE cluster or is in a Distributed region, the disk_encryption value
    // cannot be changed, so set it to undefined and the API will disregard it
    const diskEncryptionPayloadValue =
      isLKELinode || linodeIsInDistributedRegion
        ? undefined
        : diskEncryptionEnabled
        ? 'enabled'
        : 'disabled';

    rebuildLinode(linodeId, {
      authorized_users,
      disk_encryption: diskEncryptionPayloadValue,
      image,
      root_pass,
      stackscript_data: ss.udf_data,
      stackscript_id: ss.id,
    })
      .then((_) => {
        // Reset events polling since an in-progress event (rebuild) is happening.
        checkForNewEvents();

        setSubmitting(false);

        enqueueSnackbar('Linode rebuild started', {
          variant: 'info',
        });
        onClose();
      })
      .catch((errorResponse) => {
        const APIErrors = getAPIErrorOrDefault(errorResponse);
        setUdfErrors(getUDFErrors(APIErrors));

        const defaultMessage = `There was an issue rebuilding your Linode.`;
        const mapErrorToStatus = (generalError: string) =>
          setStatus({ generalError });

        setSubmitting(false);

        const modifiedErrors = APIErrors.map((thisError) => {
          /**
           * Errors returned for attempting to rebuild from an invalid
           * StackScript will have a field of 'script' (and an unhelpful
           * error message). Since nothing in our form is listening to this
           * field, the error will slip through without being shown to the user.
           *
           * If we have one of those, change the field to stackscriptId, which
           * we're listening for in Formik, and use a more helpful message.
           */
          if (thisError.field === 'script') {
            const reason = thisError.reason.match(/invalid stackscript/i)
              ? 'The selected StackScript is invalid.'
              : thisError.reason;
            return { field: 'stackscript_id', reason };
          } else {
            return thisError;
          }
        });

        handleFieldErrors(setErrors, modifiedErrors);
        handleGeneralErrors(mapErrorToStatus, modifiedErrors, defaultMessage);

        scrollErrorIntoView();
      });
  };

  // Since UDFs are dynamic, they are not handled by Formik. They need
  // to be validated separately. This functions checks if we've got values
  // for all REQUIRED UDFs, and sets errors appropriately.
  const validateUdfs = () => {
    const maybeErrors: APIError[] = [];

    // Walk through the defined UDFs
    ss.user_defined_fields.forEach((eachUdf) => {
      // Is it required? Do we have a value?
      if (isUDFRequired(eachUdf) && !ss.udf_data[eachUdf.name]) {
        // If not, we've got an error.
        maybeErrors.push({
          field: eachUdf.name,
          reason: `A value for the ${eachUdf.name} is required.`,
        });
      }
    });

    return maybeErrors;
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleFormSubmit}
      validateOnChange={false}
      validationSchema={RebuildSchema}
    >
      {({
        errors,
        handleSubmit,
        setFieldValue,
        status, // holds generalError messages
        validateForm,
        values,
      }) => {
        // We'd like to validate the form before submitting.
        const handleRebuildButtonClick = () => {
          // Validate stackscript_id, image, & root_pass
          validateForm().then((maybeErrors) => {
            // UDFs are not part of Formik - validate separately.
            const maybeUDFErrors = validateUdfs();
            setUdfErrors(maybeUDFErrors);

            // If there aren't any errors, we can proceed.
            if (isEmpty(maybeErrors) && maybeUDFErrors.length === 0) {
              handleSubmit();
              // The form receives the errors automatically, and we scroll them into view.
            } else {
              scrollErrorIntoView();
            }
          });
        };

        const handleSelect = (
          id: number,
          label: string,
          username: string,
          stackScriptImages: string[],
          user_defined_fields: UserDefinedField[]
        ) => {
          handleSelectStackScript(
            id,
            label,
            username,
            stackScriptImages,
            user_defined_fields
          );
          // Reset Image ID so that that an incompatible image can't be submitted accidentally
          setFieldValue('stackscript_id', id);
          setFieldValue('image', '');
        };

        if (status) {
          handleRebuildError(status.generalError);
        }

        return (
          <Grid sx={{ paddingTop: theme.spacing(3) }}>
            <form>
              <SelectStackScriptPanel
                request={
                  props.type === 'account'
                    ? getMineAndAccountStackScripts
                    : getCommunityStackscripts
                }
                category={props.type}
                data-qa-select-stackscript
                error={errors.stackscript_id}
                header="Select StackScript"
                onSelect={handleSelect}
                publicImages={filterImagesByType(_imagesData, 'public')}
                resetSelectedStackScript={resetStackScript}
                selectedId={ss.id}
                selectedUsername={ss.username}
                updateFor={[ss.id, errors]}
              />
              {ss.user_defined_fields && ss.user_defined_fields.length > 0 && (
                <UserDefinedFieldsPanel
                  errors={udfErrors}
                  handleChange={handleChangeUDF}
                  selectedLabel={ss.label}
                  selectedUsername={ss.username}
                  udf_data={ss.udf_data}
                  updateFor={[ss.user_defined_fields, ss.udf_data, udfErrors]}
                  userDefinedFields={ss.user_defined_fields}
                />
              )}

              {ss.images && ss.images.length > 0 ? (
                <ImageSelect
                  onChange={(image) =>
                    setFieldValue('image', image?.id ?? null)
                  }
                  errorText={errors.image}
                  title="Choose Image"
                  value={values.image}
                  variant="public"
                />
              ) : (
                <ImageEmptyState
                  errorText={errors.image}
                  sx={{ padding: theme.spacing(3) }}
                />
              )}
              <AccessPanel
                setAuthorizedUsers={(usernames) =>
                  setFieldValue('authorized_users', usernames)
                }
                authorizedUsers={values.authorized_users}
                data-qa-access-panel
                diskEncryptionEnabled={diskEncryptionEnabled}
                displayDiskEncryption
                error={errors.root_pass}
                handleChange={(value) => setFieldValue('root_pass', value)}
                isInRebuildFlow
                isLKELinode={isLKELinode}
                linodeIsInDistributedRegion={linodeIsInDistributedRegion}
                password={values.root_pass}
                passwordHelperText={passwordHelperText}
                selectedRegion={linodeRegion}
                toggleDiskEncryptionEnabled={toggleDiskEncryptionEnabled}
              />
              <Grid
                sx={(theme) => ({
                  marginTop: theme.spacing(2),
                })}
              >
                <TypeToConfirm
                  confirmationText={
                    <span>
                      To confirm these changes, type the label of the Linode (
                      <strong>{linodeLabel}</strong>) in the field below:
                    </span>
                  }
                  onChange={(input) => {
                    setConfirmationText(input);
                  }}
                  hideLabel
                  label="Linode Label"
                  textFieldStyle={{ marginBottom: 16 }}
                  title="Confirm"
                  typographyStyle={{ marginBottom: 8 }}
                  value={confirmationText}
                  visible={preferences?.type_to_confirm}
                />
                <ActionsPanel
                  primaryButtonProps={{
                    'data-qa-form-data-loading': isLoading,
                    'data-testid': 'rebuild',
                    disabled: submitButtonDisabled,
                    label: 'Rebuild Linode',
                    onClick: handleRebuildButtonClick,
                  }}
                  sx={{
                    display: 'flex',
                  }}
                />
              </Grid>
            </form>
            <StackScriptDialog />
          </Grid>
        );
      }}
    </Formik>
  );
};

// =============================================================================
// Helpers
// =============================================================================

const getUDFErrors = (errors: APIError[] | undefined) => {
  const fixedErrorFields = ['stackscript_id', 'root_pass', 'image', 'none'];

  return errors
    ? errors.filter((error) => {
        // ensure the error isn't a root_pass, image, or none
        const isNotUDFError = fixedErrorFields.some((errorKey) => {
          return errorKey === error.field;
        });
        // if the 'field' prop exists and isn't any other error
        return !!error.field && !isNotUDFError;
      })
    : undefined;
};

const isUDFRequired = (udf: UserDefinedField) => !udf.hasOwnProperty('default');
