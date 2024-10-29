import { rebuildLinode } from '@linode/api-v4';
import { RebuildLinodeSchema } from '@linode/validation/lib/linodes.schema';
import Grid from '@mui/material/Unstable_Grid2';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { AccessPanel } from 'src/components/AccessPanel/AccessPanel';
import { Box } from 'src/components/Box';
import { Checkbox } from 'src/components/Checkbox';
import { Divider } from 'src/components/Divider';
import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';
import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useEventsPollingActions } from 'src/queries/events/events';
import { usePreferences } from 'src/queries/profile/preferences';
import { useRegionsQuery } from 'src/queries/regions/regions';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { regionSupportsMetadata } from 'src/utilities/metadata';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';
import { extendValidationSchema } from 'src/utilities/validatePassword';

import {
  StyledActionsPanel,
  StyledGrid,
  StyledNotice,
} from './RebuildFromImage.styles';
import { UserDataAccordion } from './UserDataAccordion/UserDataAccordion';

import type { Image, RebuildRequest, UserData } from '@linode/api-v4';
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

export const REBUILD_LINODE_IMAGE_PARAM_NAME = 'selectedImageId';

export const RebuildFromImage = (props: Props) => {
  const {
    disabled,
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

  const { enqueueSnackbar } = useSnackbar();
  const flags = useFlags();

  const { data: regionsData, isLoading: isLoadingRegions } = useRegionsQuery();
  const isLoading = isLoadingPreferences || isLoadingRegions;

  const RebuildSchema = () => extendValidationSchema(RebuildLinodeSchema);

  const [confirmationText, setConfirmationText] = React.useState<string>('');
  const [isCloudInit, setIsCloudInit] = React.useState(false);

  const [userData, setUserData] = React.useState<string | undefined>('');
  const [shouldReuseUserData, setShouldReuseUserData] = React.useState<boolean>(
    false
  );

  const location = useLocation();
  const preselectedImageId = getQueryParamFromQueryString(
    location.search,
    REBUILD_LINODE_IMAGE_PARAM_NAME,
    ''
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
      disk_encryption: diskEncryptionEnabled ? 'enabled' : 'disabled',
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

    // if the linode is part of an LKE cluster or is in a Distributed region, the disk_encryption value
    // cannot be changed, so omit it from the payload
    if (isLKELinode || linodeIsInDistributedRegion) {
      delete params['disk_encryption'];
    }

    // @todo: eventually this should be a dispatched action instead of a services library call
    rebuildLinode(linodeId, params)
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
        const defaultMessage = `There was an issue rebuilding your Linode.`;
        const mapErrorToStatus = (generalError: string) =>
          setStatus({ generalError });

        setSubmitting(false);
        handleFieldErrors(setErrors, errorResponse);
        handleGeneralErrors(mapErrorToStatus, errorResponse, defaultMessage);
        scrollErrorIntoView();
      });
  };

  return (
    <Formik
      initialValues={{ ...initialValues, image: preselectedImageId }}
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

        const handleImageChange = (image: Image | null) => {
          setFieldValue('image', image?.id ?? '');
          setIsCloudInit(image?.capabilities?.includes('cloud-init') ?? false);
        };

        if (status) {
          handleRebuildError(status.generalError);
        }

        const shouldDisplayUserDataAccordion =
          flags.metadata &&
          regionSupportsMetadata(regionsData ?? [], linodeRegion ?? '') &&
          isCloudInit;

        return (
          <StyledGrid>
            <form>
              <Typography variant="h2">Select Image</Typography>
              <ImageSelect
                data-qa-select-image
                disabled={disabled}
                errorText={errors.image}
                label="Images"
                onChange={handleImageChange}
                value={values.image}
                variant="all"
              />
              <AccessPanel
                setAuthorizedUsers={(usernames) =>
                  setFieldValue('authorized_users', usernames)
                }
                authorizedUsers={values.authorized_users}
                data-qa-access-panel
                disabled={disabled}
                diskEncryptionEnabled={diskEncryptionEnabled}
                displayDiskEncryption
                error={errors.root_pass}
                handleChange={(input) => setFieldValue('root_pass', input)}
                isInRebuildFlow
                isLKELinode={isLKELinode}
                linodeIsInDistributedRegion={linodeIsInDistributedRegion}
                password={values.root_pass}
                passwordHelperText={passwordHelperText}
                selectedRegion={linodeRegion}
                toggleDiskEncryptionEnabled={toggleDiskEncryptionEnabled}
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
                        text="Adding new user data is recommended as part of the rebuild process."
                        variant="success"
                      />
                    }
                    disabled={shouldReuseUserData}
                    onChange={handleUserDataChange}
                    userData={userData}
                  />
                </>
              ) : null}
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

                <StyledActionsPanel
                  primaryButtonProps={{
                    'data-qa-form-data-loading': isLoading,
                    'data-testid': 'rebuild-button',
                    disabled: submitButtonDisabled || disabled,
                    label: 'Rebuild Linode',
                    onClick: handleRebuildButtonClick,
                  }}
                  sx={{ display: 'flex', flexDirection: 'column-reverse' }}
                />
              </Grid>
            </form>
          </StyledGrid>
        );
      }}
    </Formik>
  );
};
