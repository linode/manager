import { rebuildLinode } from '@linode/api-v4/lib/linodes';
import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { APIError } from '@linode/api-v4/lib/types';
import { RebuildLinodeFromStackScriptSchema } from '@linode/validation/lib/linodes.schema';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import { Formik, FormikProps } from 'formik';
import { useSnackbar } from 'notistack';
import { isEmpty } from 'ramda';
import * as React from 'react';

import { AccessPanel } from 'src/components/AccessPanel/AccessPanel';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';
import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';
import { ImageEmptyState } from 'src/features/Linodes/LinodesCreate/TabbedContent/ImageEmptyState';
import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel/SelectStackScriptPanel';
import StackScriptDialog from 'src/features/StackScripts/StackScriptDialog';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel/UserDefinedFieldsPanel';
import {
  getCommunityStackscripts,
  getMineAndAccountStackScripts,
} from 'src/features/StackScripts/stackScriptUtils';
import { useStackScript } from 'src/hooks/useStackScript';
import { listToItemsByID } from 'src/queries/base';
import { usePollingInterval } from 'src/queries/events/events';
import { useAllImagesQuery } from 'src/queries/images';
import { usePreferences } from 'src/queries/preferences';
import { filterImagesByType } from 'src/store/image/image.helpers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';
import { extendValidationSchema } from 'src/utilities/validatePassword';

interface Props {
  disabled: boolean;
  handleRebuildError: (status: string) => void;
  linodeId: number;
  linodeLabel?: string;
  onClose: () => void;
  passwordHelperText: string;
  type: 'account' | 'community';
}

interface RebuildFromStackScriptForm {
  authorized_users: string[];
  image: string;
  root_pass: string;
  stackscript_id: string;
}

const initialValues: RebuildFromStackScriptForm = {
  authorized_users: [],
  image: '',
  root_pass: '',
  stackscript_id: '',
};

export const RebuildFromStackScript = (props: Props) => {
  const {
    handleRebuildError,
    linodeId,
    linodeLabel,
    onClose,
    passwordHelperText,
  } = props;

  const {
    data: preferences,
    isLoading: isLoadingPreferences,
  } = usePreferences();

  const { resetEventsPolling } = usePollingInterval();

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

    rebuildLinode(linodeId, {
      authorized_users,
      image,
      root_pass,
      stackscript_data: ss.udf_data,
      stackscript_id: ss.id,
    })
      .then((_) => {
        // Reset events polling since an in-progress event (rebuild) is happening.
        resetEventsPolling();

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
                  updateFor={[ss.user_defined_fields, ss.udf_data, udfErrors]}
                  errors={udfErrors}
                  handleChange={handleChangeUDF}
                  selectedLabel={ss.label}
                  selectedUsername={ss.username}
                  udf_data={ss.udf_data}
                  userDefinedFields={ss.user_defined_fields}
                />
              )}

              {ss.images && ss.images.length > 0 ? (
                <ImageSelect
                  handleSelectImage={(selected) =>
                    setFieldValue('image', selected)
                  }
                  error={errors.image}
                  images={ss.images}
                  selectedImageID={values.image}
                  title="Choose Image"
                  variant="public"
                />
              ) : (
                <ImageEmptyState
                  sx={{ padding: theme.spacing(3) }}
                  errorText={errors.image}
                />
              )}
              <AccessPanel
                setAuthorizedUsers={(usernames) =>
                  setFieldValue('authorized_users', usernames)
                }
                authorizedUsers={values.authorized_users}
                data-qa-access-panel
                error={errors.root_pass}
                handleChange={(value) => setFieldValue('root_pass', value)}
                password={values.root_pass}
                passwordHelperText={passwordHelperText}
              />
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
                  'data-testid': 'rebuild',
                  'data-qa-form-data-loading': isLoading,
                  disabled: submitButtonDisabled,
                  label: 'Rebuild Linode',
                  onClick: handleRebuildButtonClick,
                }}
                sx={{
                  '& button': { alignSelf: 'flex-end' },
                  flexDirection: 'column',
                }}
              />
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
