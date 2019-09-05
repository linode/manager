import { Formik, FormikProps } from 'formik';
import { GrantLevel } from 'linode-js-sdk/lib/account';
import { Image } from 'linode-js-sdk/lib/images';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import AccessPanel from 'src/components/AccessPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import ImageSelect from 'src/components/ImageSelect';
import Notice from 'src/components/Notice';
import withImages from 'src/containers/withImages.container';
import { resetEventsPolling } from 'src/events';
import userSSHKeyHoc, {
  UserSSHKeyProps
} from 'src/features/linodes/userSSHKeyHoc';
import { rebuildLinode, RebuildRequest } from 'src/services/linodes';
import { RebuildLinodeSchema } from 'src/services/linodes/linode.schema';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { withLinodeDetailContext } from '../linodeDetailContext';
import { RebuildDialog } from './RebuildDialog';

type ClassNames = 'root' | 'error';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      paddingTop: theme.spacing(3)
    },
    error: {
      marginTop: theme.spacing(2)
    }
  });

interface WithImagesProps {
  imagesData: Image[];
  imagesLoading: boolean;
  imagesError?: string;
}

interface ContextProps {
  linodeId: number;
  permissions: GrantLevel;
}

export type CombinedProps = WithImagesProps &
  WithStyles<ClassNames> &
  ContextProps &
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

export const RebuildFromImage: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    classes,
    imagesData,
    imagesError,
    userSSHKeys,
    sshError,
    requestKeys,
    linodeId,
    enqueueSnackbar,
    history,
    permissions
  } = props;

  const disabled = permissions === 'read_only';

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
        history.push(`/linodes/${linodeId}/summary`);
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
      validationSchema={RebuildLinodeSchema}
      validateOnChange={false}
      onSubmit={handleFormSubmit}
      render={formikProps => {
        const {
          errors,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          status,
          values,
          validateForm
        } = formikProps;

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
              images={imagesData}
              error={imagesError || errors.image}
              selectedImageID={values.image}
              handleSelectImage={selected => setFieldValue('image', selected)}
              disabled={disabled}
              variant="all"
              data-qa-select-image
            />
            <AccessPanel
              password={values.root_pass}
              handleChange={input => setFieldValue('root_pass', input)}
              updateFor={[
                classes,
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
              disabledReason={
                disabled
                  ? "You don't have permissions to modify this Linode"
                  : undefined
              }
            />
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
    />
  );
};

const styled = withStyles(styles);

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeId: linode.id,
  permissions: linode._permissions
}));

const enhanced = compose<CombinedProps, {}>(
  linodeContext,
  withImages((ownProps, imagesData, imagesLoading, imagesError) => ({
    ...ownProps,
    imagesData,
    imagesLoading,
    imagesError
  })),
  userSSHKeyHoc,
  styled,
  withSnackbar,
  withRouter
);

export default enhanced(RebuildFromImage);
