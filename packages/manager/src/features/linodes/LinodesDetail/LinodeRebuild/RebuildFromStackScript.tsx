import { rebuildLinode } from '@linode/api-v4/lib/linodes';
import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { APIError } from '@linode/api-v4/lib/types';
import { RebuildLinodeFromStackScriptSchema } from '@linode/validation/lib/linodes.schema';
import { Formik, FormikProps } from 'formik';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import AccessPanel from 'src/components/AccessPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import ImageSelect from 'src/components/ImageSelect';
import TypeToConfirm from 'src/components/TypeToConfirm';
import withPreferences, {
  Props as PreferencesProps,
} from 'src/containers/preferences.container';
import withImages, { WithImages } from 'src/containers/withImages.container';
import { resetEventsPolling } from 'src/eventsPolling';
import ImageEmptyState from 'src/features/linodes/LinodesCreate/TabbedContent/ImageEmptyState';
import userSSHKeyHoc, {
  UserSSHKeyProps,
} from 'src/features/linodes/userSSHKeyHoc';
import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel';
import StackScriptDialog from 'src/features/StackScripts/StackScriptDialog';
import {
  getCommunityStackscripts,
  getMineAndAccountStackScripts,
} from 'src/features/StackScripts/stackScriptUtils';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';
import { useStackScript } from 'src/hooks/useStackScript';
import { filterImagesByType } from 'src/store/image/image.helpers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { extendValidationSchema } from 'src/utilities/validatePassword';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(3),
  },
  error: {
    marginTop: theme.spacing(2),
  },
  emptyImagePanel: {
    padding: theme.spacing(3),
  },
  emptyImagePanelText: {
    marginTop: theme.spacing(1),
    padding: `${theme.spacing(1)}px 0`,
  },
  actionPanel: {
    flexDirection: 'column',
    '& button': {
      alignSelf: 'flex-end',
    },
  },
}));

interface Props {
  type: 'community' | 'account';
  disabled: boolean;
  passwordHelperText: string;
  linodeId: number;
  linodeLabel?: string;
  handleRebuildError: (status: string) => void;
  onClose: () => void;
}

export type CombinedProps = Props &
  WithImages &
  UserSSHKeyProps &
  RouteComponentProps &
  PreferencesProps &
  WithSnackbarProps;

interface RebuildFromStackScriptForm {
  image: string;
  root_pass: string;
  stackscript_id: string;
}

const initialValues: RebuildFromStackScriptForm = {
  image: '',
  root_pass: '',
  stackscript_id: '',
};

export const RebuildFromStackScript: React.FC<CombinedProps> = (props) => {
  const {
    imagesData,
    userSSHKeys,
    sshError,
    requestKeys,
    linodeId,
    linodeLabel,
    handleRebuildError,
    onClose,
    enqueueSnackbar,
    passwordHelperText,
    preferences,
  } = props;

  const classes = useStyles();

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
    Object.keys(imagesData).map((eachKey) => imagesData[eachKey])
  );

  // In this component, most errors are handled by Formik. This is not
  // possible with UDFs, since they are dynamic. Their errors need to
  // be handled separately.
  const [udfErrors, setUdfErrors] = React.useState<APIError[] | undefined>(
    undefined
  );

  const handleFormSubmit = (
    { image, root_pass }: RebuildFromStackScriptForm,
    {
      setSubmitting,
      setStatus,
      setErrors,
    }: FormikProps<RebuildFromStackScriptForm>
  ) => {
    setSubmitting(true);

    rebuildLinode(linodeId, {
      stackscript_id: ss.id,
      stackscript_data: ss.udf_data,
      root_pass,
      image,
      authorized_users: userSSHKeys
        .filter((u) => u.selected)
        .map((u) => u.username),
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
      validationSchema={RebuildSchema}
      validateOnChange={false}
      onSubmit={handleFormSubmit}
    >
      {({
        errors,
        handleSubmit,
        setFieldValue,
        status, // holds generalError messages
        values,
        validateForm,
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
          <Grid item className={classes.root}>
            <form>
              <SelectStackScriptPanel
                error={errors.stackscript_id}
                selectedId={ss.id}
                selectedUsername={ss.username}
                updateFor={[classes, ss.id, errors]}
                onSelect={handleSelect}
                publicImages={filterImagesByType(imagesData, 'public')}
                resetSelectedStackScript={resetStackScript}
                data-qa-select-stackscript
                category={props.type}
                header="Select StackScript"
                request={
                  props.type === 'account'
                    ? getMineAndAccountStackScripts
                    : getCommunityStackscripts
                }
              />
              {ss.user_defined_fields && ss.user_defined_fields.length > 0 && (
                <UserDefinedFieldsPanel
                  errors={udfErrors}
                  selectedLabel={ss.label}
                  selectedUsername={ss.username}
                  handleChange={handleChangeUDF}
                  userDefinedFields={ss.user_defined_fields}
                  updateFor={[
                    classes,
                    ss.user_defined_fields,
                    ss.udf_data,
                    udfErrors,
                  ]}
                  udf_data={ss.udf_data}
                />
              )}

              {ss.images && ss.images.length > 0 ? (
                <ImageSelect
                  variant="public"
                  title="Choose Image"
                  images={ss.images}
                  handleSelectImage={(selected) =>
                    setFieldValue('image', selected)
                  }
                  selectedImageID={values.image}
                  error={errors.image}
                />
              ) : (
                <ImageEmptyState
                  className={classes.emptyImagePanel}
                  errorText={errors.image}
                />
              )}
              <AccessPanel
                password={values.root_pass}
                handleChange={(value) => setFieldValue('root_pass', value)}
                updateFor={[values.root_pass, errors, userSSHKeys, ss.id]}
                error={errors.root_pass}
                users={userSSHKeys}
                sshKeyError={sshError}
                requestKeys={requestKeys}
                data-qa-access-panel
                passwordHelperText={passwordHelperText}
              />
              <ActionsPanel className={classes.actionPanel}>
                <TypeToConfirm
                  confirmationText={
                    <span>
                      To confirm these changes, type the label of the Linode (
                      <strong>{linodeLabel}</strong>) in the field below:
                    </span>
                  }
                  title="Confirm"
                  typographyStyle={{ marginBottom: 8 }}
                  label="Linode Label"
                  onChange={(input) => {
                    setConfirmationText(input);
                  }}
                  value={confirmationText}
                  hideLabel
                  visible={preferences?.type_to_confirm}
                  textFieldStyle={{ marginBottom: 16 }}
                />
                <Button
                  buttonType="primary"
                  disabled={submitButtonDisabled}
                  onClick={handleRebuildButtonClick}
                  data-qa-rebuild
                  data-testid="rebuild-button"
                >
                  Rebuild Linode
                </Button>
              </ActionsPanel>
            </form>
            <StackScriptDialog />
          </Grid>
        );
      }}
    </Formik>
  );
};

const enhanced = compose<CombinedProps, Props>(
  userSSHKeyHoc,
  withSnackbar,
  withImages(),
  withRouter,
  withPreferences()
);

export default enhanced(RebuildFromStackScript);

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
