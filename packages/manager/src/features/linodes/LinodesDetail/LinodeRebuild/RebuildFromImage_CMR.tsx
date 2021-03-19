import { Formik, FormikProps } from 'formik';
import {
  rebuildLinode,
  RebuildLinodeSchema,
  RebuildRequest,
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
import withImages, { WithImages } from 'src/containers/withImages.container';
import { resetEventsPolling } from 'src/eventsPolling';
import userSSHKeyHoc, {
  UserSSHKeyProps,
} from 'src/features/linodes/userSSHKeyHoc';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { extendValidationSchema } from 'src/utilities/validatePassword';
import Typography from 'src/components/core/Typography';
import TextField from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(3),
  },
  error: {
    marginTop: theme.spacing(2),
  },
}));

interface Props {
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
  WithSnackbarProps;

interface RebuildFromImageForm {
  image: string;
  root_pass: string;
}

const initialValues: RebuildFromImageForm = {
  image: '',
  root_pass: '',
};

export const RebuildFromImage: React.FC<CombinedProps> = (props) => {
  const {
    disabled,
    imagesData,
    imagesError,
    userSSHKeys,
    sshError,
    requestKeys,
    linodeId,
    linodeLabel,
    handleRebuildError,
    onClose,
    enqueueSnackbar,
    passwordHelperText,
  } = props;

  const classes = useStyles();

  const RebuildSchema = () => extendValidationSchema(RebuildLinodeSchema);

  const [confirmationText, setConfirmationText] = React.useState<string>('');
  const submitButtonDisabled = confirmationText !== linodeLabel;

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
      authorized_users: userSSHKeys
        .filter((u) => u.selected)
        .map((u) => u.username),
    };

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

        return (
          <Grid item className={classes.root}>
            <form>
              <ImageSelect
                title="Select Image"
                images={Object.values(imagesData)}
                error={
                  (imagesError.read && imagesError.read[0].reason) ||
                  errors.image
                }
                selectedImageID={values.image}
                handleSelectImage={(selected) =>
                  setFieldValue('image', selected)
                }
                disabled={disabled}
                variant="all"
                data-qa-select-image
              />
              <AccessPanel
                password={values.root_pass}
                handleChange={(input) => setFieldValue('root_pass', input)}
                updateFor={[
                  classes,
                  disabled,
                  values.root_pass,
                  errors,
                  sshError,
                  userSSHKeys,
                  values.image,
                ]}
                error={errors.root_pass}
                sshKeyError={sshError}
                users={userSSHKeys}
                requestKeys={requestKeys}
                data-qa-access-panel
                disabled={disabled}
                passwordHelperText={passwordHelperText}
              />
              <ActionsPanel>
                <Typography variant="h2">Confirm</Typography>
                <Typography style={{ marginBottom: 8 }}>
                  To confirm these changes, type the label of the Linode{' '}
                  <strong>({linodeLabel})</strong> in the field below:
                </Typography>
                <TextField
                  label="Linode Label"
                  hideLabel
                  onChange={(e) => setConfirmationText(e.target.value)}
                  style={{ marginBottom: 16 }}
                />
                <Button
                  disabled={submitButtonDisabled || disabled}
                  buttonType="primary"
                  className="destructive"
                  onClick={handleRebuildButtonClick}
                  data-testid="rebuild-button"
                >
                  Rebuild Linode
                </Button>
              </ActionsPanel>
            </form>
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
