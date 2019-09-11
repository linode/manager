import { Formik, FormikProps } from 'formik';
import { Image } from 'linode-js-sdk/lib/images';
import { rebuildLinode, RebuildLinodeFromStackScriptSchema } from 'linode-js-sdk/lib/linodes';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import AccessPanel from 'src/components/AccessPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import ImageSelect from 'src/components/ImageSelect';
import Notice from 'src/components/Notice';
import withImages from 'src/containers/withImages.container';
import { resetEventsPolling } from 'src/events';
import userSSHKeyHoc, {
  UserSSHKeyProps
} from 'src/features/linodes/userSSHKeyHoc';
import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel';
import StackScriptDrawer from 'src/features/StackScripts/StackScriptDrawer';
import {
  getCommunityStackscripts,
  getMineAndAccountStackScripts
} from 'src/features/StackScripts/stackScriptUtils';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';
import { useStackScript } from 'src/hooks/useStackScript';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';
import { filterPublicImages } from 'src/utilities/images';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { withLinodeDetailContext } from '../linodeDetailContext';
import { RebuildDialog } from './RebuildDialog';

type ClassNames = 'root' | 'error' | 'emptyImagePanel' | 'emptyImagePanelText';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      paddingTop: theme.spacing(3)
    },
    error: {
      marginTop: theme.spacing(2)
    },
    emptyImagePanel: {
      padding: theme.spacing(3)
    },
    emptyImagePanelText: {
      marginTop: theme.spacing(1),
      padding: `${theme.spacing(1)}px 0`
    }
  });

interface Props {
  type: 'community' | 'account';
}

interface ContextProps {
  linodeId: number;
}
interface WithImagesProps {
  imagesData: Image[];
  imagesLoading: boolean;
  imagesError?: string;
}

export type CombinedProps = Props &
  WithStyles<ClassNames> &
  WithImagesProps &
  ContextProps &
  UserSSHKeyProps &
  RouteComponentProps &
  WithSnackbarProps;

interface RebuildFromStackScriptForm {
  image: string;
  root_pass: string;
  stackscript_id: string;
}

const initialValues: RebuildFromStackScriptForm = {
  image: '',
  root_pass: '',
  stackscript_id: ''
};

export const RebuildFromStackScript: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    classes,
    imagesData,
    userSSHKeys,
    sshError,
    requestKeys,
    linodeId,
    enqueueSnackbar,
    history
  } = props;

  const [
    ss,
    handleSelectStackScript,
    handleChangeUDF,
    resetStackScript
  ] = useStackScript(imagesData);

  // In this component, most errors are handled by Formik. This is not
  // possible with UDFs, since they are dynamic. Their errors need to
  // be handled separately.
  const [udfErrors, setUdfErrors] = React.useState<
    Linode.ApiFieldError[] | undefined
  >(undefined);

  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  const handleFormSubmit = (
    { image, root_pass }: RebuildFromStackScriptForm,
    {
      setSubmitting,
      setStatus,
      setErrors
    }: FormikProps<RebuildFromStackScriptForm>
  ) => {
    setSubmitting(true);

    rebuildLinode(linodeId, {
      stackscript_id: ss.id,
      stackscript_data: ss.udf_data,
      root_pass,
      image,
      authorized_users: userSSHKeys.filter(u => u.selected).map(u => u.username)
    })
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
        const APIError = getAPIErrorOrDefault(errorResponse);
        setUdfErrors(getUDFErrors(APIError));

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

  // Since UDFs are dynamic, they are not handled by Formik. They need
  // to be validated separately. This functions checks if we've got values
  // for all REQUIRED UDFs, and sets errors appropriately.
  const validateUdfs = () => {
    const maybeErrors: Linode.ApiFieldError[] = [];

    // Walk through the defined UDFs
    ss.user_defined_fields.forEach(eachUdf => {
      // Is it required? Do we have a value?
      if (isUDFRequired(eachUdf) && !ss.udf_data[eachUdf.name]) {
        // If not, we've got an error.
        maybeErrors.push({
          field: eachUdf.name,
          reason: `A value for the ${eachUdf.name} is required.`
        });
      }
    });

    return maybeErrors;
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={RebuildLinodeFromStackScriptSchema}
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
          // Validate stackscript_id, image, & root_pass
          validateForm().then(maybeErrors => {
            // UDFs are not part of Formik - validate separately.
            const maybeUDFErrors = validateUdfs();
            setUdfErrors(maybeUDFErrors);

            // If there aren't any errors, we can open the modal.
            if (isEmpty(maybeErrors) && maybeUDFErrors.length === 0) {
              setIsDialogOpen(true);
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
          user_defined_fields: Linode.StackScript.UserDefinedField[]
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

        return (
          <Grid item className={classes.root}>
            {status && (
              <Notice
                error
                className={classes.error}
                text={status.generalError}
                data-qa-notice
              />
            )}
            <SelectStackScriptPanel
              error={errors.stackscript_id}
              selectedId={ss.id}
              selectedUsername={ss.username}
              updateFor={[classes, ss.id, errors]}
              onSelect={handleSelect}
              publicImages={filterPublicImages(imagesData)}
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
                  udfErrors
                ]}
                udf_data={ss.udf_data}
              />
            )}
            {ss.images && ss.images.length > 0 ? (
              <ImageSelect
                variant="public"
                title="Choose Image"
                images={ss.images}
                handleSelectImage={selected => setFieldValue('image', selected)}
                selectedImageID={values.image}
                error={errors.image}
              />
            ) : (
              <Paper className={classes.emptyImagePanel}>
                {/* empty state for images */}
                {errors.image && <Notice error={true} text={errors.image} />}
                <Typography variant="h2" data-qa-tp="Select Image">
                  Select Image
                </Typography>
                <Typography
                  variant="body1"
                  className={classes.emptyImagePanelText}
                  data-qa-no-compatible-images
                >
                  No Compatible Images Available
                </Typography>
              </Paper>
            )}
            <AccessPanel
              password={values.root_pass}
              handleChange={value => setFieldValue('root_pass', value)}
              updateFor={[values.root_pass, errors, userSSHKeys, ss.id]}
              error={errors.root_pass}
              users={userSSHKeys}
              sshKeyError={sshError}
              requestKeys={requestKeys}
              data-qa-access-panel
            />
            <ActionsPanel>
              <Button
                buttonType="secondary"
                className="destructive"
                onClick={handleRebuildButtonClick}
                data-qa-rebuild
                data-testid="rebuild-button"
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
            <StackScriptDrawer />
          </Grid>
        );
      }}
    />
  );
};

const styled = withStyles(styles);

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeId: linode.id
}));

const enhanced = compose<CombinedProps, Props>(
  linodeContext,
  userSSHKeyHoc,
  styled,
  withSnackbar,
  withImages((ownProps, imagesData, imagesLoading, imagesError) => ({
    ...ownProps,
    imagesData,
    imagesLoading,
    imagesError
  })),
  withRouter
);

export default enhanced(RebuildFromStackScript);

// =============================================================================
// Helpers
// =============================================================================

const getUDFErrors = (errors: Linode.ApiFieldError[] | undefined) => {
  const fixedErrorFields = ['stackscript_id', 'root_pass', 'image', 'none'];

  return errors
    ? errors.filter(error => {
        // ensure the error isn't a root_pass, image, or none
        const isNotUDFError = fixedErrorFields.some(errorKey => {
          return errorKey === error.field;
        });
        // if the 'field' prop exists and isn't any other error
        return !!error.field && !isNotUDFError;
      })
    : undefined;
};

const isUDFRequired = (udf: Linode.StackScript.UserDefinedField) =>
  !udf.hasOwnProperty('default');
