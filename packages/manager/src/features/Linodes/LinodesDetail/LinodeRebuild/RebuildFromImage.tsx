import {
  RebuildRequest,
  UserData,
  rebuildLinode,
} from '@linode/api-v4/lib/linodes';
import { RebuildLinodeSchema } from '@linode/validation/lib/linodes.schema';
import { Formik, FormikProps } from 'formik';
import { useSnackbar } from 'notistack';
import { isEmpty } from 'ramda';
import * as React from 'react';

import AccessPanel from 'src/components/AccessPanel/AccessPanel';
import Grid from '@mui/material/Unstable_Grid2';
import { Box } from 'src/components/Box';
import { Checkbox } from 'src/components/Checkbox';
import { Divider } from 'src/components/Divider';
import ImageSelect from 'src/components/ImageSelect';
import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';
import { resetEventsPolling } from 'src/eventsPolling';
import { UserDataAccordion } from 'src/features/Linodes/LinodesCreate/UserDataAccordion/UserDataAccordion';
import { useFlags } from 'src/hooks/useFlags';
import { useAllImagesQuery } from 'src/queries/images';
import { usePreferences } from 'src/queries/preferences';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { extendValidationSchema } from 'src/utilities/validatePassword';

import {
  StyledActionsPanel,
  StyledGrid,
  StyledNotice,
} from './RebuildFromImage.styles';

interface Props {
  disabled: boolean;
  handleRebuildError: (status: string) => void;
  linodeId: number;
  linodeLabel?: string;
  onClose: () => void;
  passwordHelperText: string;
}

interface RebuildFromImageForm {
  authorized_users: string[];
  image: string;
  metadata?: UserData;
  root_pass: string;
}

const initialValues: RebuildFromImageForm = {
  authorized_users: [],
  image: '',
  metadata: {
    user_data: '',
  },
  root_pass: '',
};

export const RebuildFromImage = (props: Props) => {
  const {
    disabled,
    handleRebuildError,
    linodeId,
    linodeLabel,
    onClose,
    passwordHelperText,
  } = props;

  const { data: preferences } = usePreferences();

  const { enqueueSnackbar } = useSnackbar();
  const flags = useFlags();

  const { data: _imagesData, error: imagesError } = useAllImagesQuery();

  const RebuildSchema = () => extendValidationSchema(RebuildLinodeSchema);

  const [confirmationText, setConfirmationText] = React.useState<string>('');

  const [userData, setUserData] = React.useState<string | undefined>('');
  const [shouldReuseUserData, setShouldReuseUserData] = React.useState<boolean>(
    false
  );

  const handleUserDataChange = (userData: string) => {
    setUserData(userData);
  };

  const handleShouldReuseUserDataChange = () => {
    setShouldReuseUserData((shouldReuseUserData) => !shouldReuseUserData);
  };

  React.useEffect(() => {
    if (shouldReuseUserData) {
      setUserData('');
    }
  }, [shouldReuseUserData]);

  const submitButtonDisabled =
    preferences?.type_to_confirm !== false && confirmationText !== linodeLabel;

  const handleFormSubmit = (
    { authorized_users, image, root_pass }: RebuildFromImageForm,
    { setErrors, setStatus, setSubmitting }: FormikProps<RebuildFromImageForm>
  ) => {
    setSubmitting(true);

    // `status` holds general error messages
    setStatus(undefined);

    const params: RebuildRequest = {
      authorized_users,
      image,
      metadata: {
        user_data: userData
          ? window.btoa(userData)
          : !userData && !shouldReuseUserData
          ? null
          : '',
      },
      root_pass,
    };

    /*
      User Data logic:
      1) if user data has been provided, encode it and include it in the payload
      2) if user data has not been provided and the Reuse User Data checkbox is
        not checked, send null in the payload
      3) if the Reuse User Data checkbox is checked, remove the Metadata property from the payload.
    */
    if (shouldReuseUserData) {
      delete params['metadata'];
    }

    // @todo: eventually this should be a dispatched action instead of a services library call
    rebuildLinode(linodeId, params)
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
        const defaultMessage = `There was an issue rebuilding your Linode.`;
        const mapErrorToStatus = (generalError: string) =>
          setStatus({ generalError });

        setSubmitting(false);
        handleFieldErrors(setErrors, errorResponse);
        handleGeneralErrors(mapErrorToStatus, errorResponse, defaultMessage);
        scrollErrorIntoView();
      });
  };

  const _imagesError = imagesError
    ? getAPIErrorOrDefault(imagesError, 'Unable to load Images')[0].reason
    : undefined;

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
            // If there aren't any errors, we can submit the form.
            if (isEmpty(maybeErrors)) {
              handleSubmit();
              // The form receives the errors automatically, and we scroll them into view.
            } else {
              scrollErrorIntoView();
            }
          });
        };

        if (status) {
          handleRebuildError(status.generalError);
        }

        const shouldDisplayUserDataAccordion =
          flags.metadata &&
          Boolean(
            values.image &&
              _imagesData
                ?.find((image) => image.id === values.image)
                ?.capabilities?.includes('cloud-init')
          );

        return (
          <StyledGrid>
            <form>
              <ImageSelect
                handleSelectImage={(selected) =>
                  setFieldValue('image', selected)
                }
                data-qa-select-image
                disabled={disabled}
                error={_imagesError || errors.image}
                images={_imagesData ?? []}
                selectedImageID={values.image}
                title="Select Image"
                variant="all"
              />
              <AccessPanel
                setAuthorizedUsers={(usernames) =>
                  setFieldValue('authorized_users', usernames)
                }
                authorizedUsers={values.authorized_users}
                data-qa-access-panel
                disabled={disabled}
                error={errors.root_pass}
                handleChange={(input) => setFieldValue('root_pass', input)}
                password={values.root_pass}
                passwordHelperText={passwordHelperText}
              />
              {shouldDisplayUserDataAccordion ? (
                <>
                  <Divider spacingTop={40} />
                  <UserDataAccordion
                    renderCheckbox={
                      <Box>
                        <Checkbox
                          checked={shouldReuseUserData}
                          onChange={handleShouldReuseUserDataChange}
                          sxFormLabel={{ paddingLeft: '2px' }}
                          text={`Reuse user data previously provided for ${linodeLabel}`}
                        />
                      </Box>
                    }
                    renderNotice={
                      <StyledNotice
                        variant="success"
                        text="Adding new user data is recommended as part of the rebuild process."
                      />
                    }
                    disabled={shouldReuseUserData}
                    onChange={handleUserDataChange}
                    userData={userData}
                  />
                </>
              ) : null}
              <Grid sx={{ marginTop: '16px' }}>
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
                <StyledActionsPanel
                  primaryButtonProps={{
                    'data-testid': 'rebuild-button',
                    disabled: submitButtonDisabled || disabled,
                    label: 'Rebuild Linode',
                    onClick: handleRebuildButtonClick,
                  }}
                />
              </Grid>
            </form>
          </StyledGrid>
        );
      }}
    </Formik>
  );
};
