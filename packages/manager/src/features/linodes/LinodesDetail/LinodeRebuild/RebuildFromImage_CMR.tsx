import { Formik, FormikProps } from 'formik';
import {
  rebuildLinode,
  RebuildLinodeSchema,
  RebuildRequest
} from '@linode/api-v4/lib/linodes';
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
import Notice from 'src/components/Notice';
import withImages, { WithImages } from 'src/containers/withImages.container';
import { resetEventsPolling } from 'src/eventsPolling';
import userSSHKeyHoc, {
  UserSSHKeyProps
} from 'src/features/linodes/userSSHKeyHoc';
import { PasswordValidationType } from 'src/featureFlags';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { extendValidationSchema } from 'src/utilities/validatePassword';
import { RebuildDialog } from './RebuildDialog';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(3)
  },
  error: {
    marginTop: theme.spacing(2)
  }
}));

interface Props {
  disabled: boolean;
  passwordHelperText: string;
  passwordValidation: PasswordValidationType;
  linodeId: number;
  onClose: () => void;
}

export type CombinedProps = Props &
  WithImages &
  UserSSHKeyProps &
  RouteComponentProps &
  WithSnackbarProps;

interface RebuildFromImageForm {
  image: string;
  root_pass: string;
}

const initialValues: RebuildFromImageForm = {
  image: '',
  root_pass: ''
};

export const RebuildFromImage: React.FC<CombinedProps> = props => {
  const {
    disabled,
    imagesData,
    imagesError,
    userSSHKeys,
    sshError,
    requestKeys,
    linodeId,
    onClose,
    enqueueSnackbar,
    passwordHelperText,
    passwordValidation
  } = props;

  const classes = useStyles();

  /**
   * Dynamic validation schema, with password validation
   * dependent on a value from a feature flag. Remove this
   * once API password validation is stable.
   */
  const RebuildSchema = React.useMemo(
    () =>
      extendValidationSchema(passwordValidation ?? 'none', RebuildLinodeSchema),
    [passwordValidation]
  );

  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  const handleFormSubmit = (
    { image, root_pass }: RebuildFromImageForm,
    { setSubmitting, setStatus, setErrors }: FormikProps<RebuildFromImageForm>
  ) => {
    setSubmitting(true);

    // `status` holds general error messages
    setStatus(undefined);

    const params: RebuildRequest = {
      image,
      root_pass,
      authorized_users: userSSHKeys.filter(u => u.selected).map(u => u.username)
    };

    // @todo: eventually this should be a dispatched action instead of a services library call
    rebuildLinode(linodeId, params)
      .then(_ => {
        // Reset events polling since an in-progress event (rebuild) is happening.
        resetEventsPolling();

        setSubmitting(false);
        setIsDialogOpen(false);

        enqueueSnackbar('Linode rebuild started', {
          variant: 'info'
        });
        onClose();
      })
      .catch(errorResponse => {
        const defaultMessage = `There was an issue rebuilding your Linode.`;
        const mapErrorToStatus = (generalError: string) =>
          setStatus({ generalError });

        setSubmitting(false);
        handleFieldErrors(setErrors, errorResponse);
        handleGeneralErrors(mapErrorToStatus, errorResponse, defaultMessage);
        setIsDialogOpen(false);
        scrollErrorIntoView();
      });
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
        isSubmitting,
        setFieldValue,
        status,
        values,
        validateForm
      }) => {
        // The "Rebuild" button opens a confirmation modal.
        // We'd like to validate the form before this happens.
        const handleRebuildButtonClick = () => {
          validateForm().then(maybeErrors => {
            // If there aren't any errors, we can open the modal.
            if (isEmpty(maybeErrors)) {
              setIsDialogOpen(true);
              // The form receives the errors automatically, and we scroll them into view.
            } else {
              scrollErrorIntoView();
            }
          });
        };

        return (
          <Grid item className={classes.root}>
            {/* `status` holds generalError messages */}
            {status && <Notice error>{status.generalError}</Notice>}
            <ImageSelect
              title="Select Image"
              images={Object.values(imagesData)}
              error={
                (imagesError.read && imagesError.read[0].reason) || errors.image
              }
              selectedImageID={values.image}
              handleSelectImage={selected => setFieldValue('image', selected)}
              disabled={disabled}
              variant="all"
              data-qa-select-image
            />
            <form>
              <AccessPanel
                password={values.root_pass}
                handleChange={input => setFieldValue('root_pass', input)}
                updateFor={[
                  classes,
                  disabled,
                  values.root_pass,
                  errors,
                  sshError,
                  userSSHKeys,
                  values.image
                ]}
                error={errors.root_pass}
                sshKeyError={sshError}
                users={userSSHKeys}
                requestKeys={requestKeys}
                data-qa-access-panel
                disabled={disabled}
                passwordHelperText={passwordHelperText}
              />
            </form>
            <ActionsPanel>
              <Button
                buttonType="secondary"
                className="destructive"
                onClick={handleRebuildButtonClick}
                data-testid="rebuild-button"
                disabled={disabled}
              >
                Rebuild
              </Button>
            </ActionsPanel>
            <RebuildDialog
              isOpen={isDialogOpen}
              isLoading={isSubmitting}
              handleClose={() => setIsDialogOpen(false)}
              handleSubmit={handleSubmit}
            />
          </Grid>
        );
      }}
    </Formik>
  );
};

const enhanced = compose<CombinedProps, Props>(
  withImages(),
  userSSHKeyHoc,
  withSnackbar,
  withRouter
);

export default enhanced(RebuildFromImage);
