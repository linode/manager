import { Formik } from 'formik';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import AccessPanel from 'src/components/AccessPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import withImages from 'src/containers/withImages.container';
import { resetEventsPolling } from 'src/events';
import userSSHKeyHoc, {
  UserSSHKeyProps
} from 'src/features/linodes/userSSHKeyHoc';
// @todo: Extract these utils out of Volumes
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/features/Volumes/VolumeDrawer/utils';
import { rebuildLinode, RebuildRequest } from 'src/services/linodes';
import { RebuildLinodeSchema } from 'src/services/linodes/linode.schema';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { withLinodeDetailContext } from '../linodeDetailContext';
import { RebuildDialog } from './RebuildDialog';
import SelectImagePanel from './SelectImagePanel';

type ClassNames = 'root' | 'error';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  error: {
    marginTop: theme.spacing.unit * 2
  }
});

interface WithImagesProps {
  imagesData: Linode.Image[];
  imagesLoading: boolean;
  imagesError?: string;
}

interface ContextProps {
  linodeId: number;
  permissions: Linode.GrantLevel;
}

export type CombinedProps = WithImagesProps &
  WithStyles<ClassNames> &
  ContextProps &
  UserSSHKeyProps &
  RouteComponentProps &
  WithSnackbarProps;

export const RebuildFromImage: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    classes,
    imagesData,
    imagesError,
    userSSHKeys,
    linodeId,
    enqueueSnackbar,
    history,
    permissions
  } = props;

  const disabled = permissions === 'read_only';

  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  const initialValues = {
    image: '',
    root_pass: ''
  };
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={RebuildLinodeSchema}
      validateOnChange={false}
      onSubmit={(
        values,
        { setSubmitting, setStatus, setErrors, resetForm }
      ) => {
        setSubmitting(true);

        // `status` holds general error messages
        setStatus(undefined);

        const { image, root_pass } = values;

        const params: RebuildRequest = {
          image,
          root_pass,
          authorized_users: userSSHKeys
            .filter(u => u.selected)
            .map(u => u.username)
        };

        // @todo: eventually this should be a dispatched action instead of a services library call
        rebuildLinode(linodeId, params)
          .then(_ => {
            resetEventsPolling();

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
            handleGeneralErrors(
              mapErrorToStatus,
              errorResponse,
              defaultMessage
            );
            setIsDialogOpen(false);
            scrollErrorIntoView();
          });
      }}
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

        const handleOpen = () => {
          validateForm().then(maybeErrors => {
            if (isEmpty(maybeErrors)) {
              setIsDialogOpen(true);
            } else {
              scrollErrorIntoView();
            }
          });
        };

        return (
          <Grid item className={classes.root}>
            {/* `status` holds generalError messages */}
            {status && <Notice error>{status.generalError}</Notice>}

            <SelectImagePanel
              images={imagesData}
              error={imagesError || errors.image}
              updateFor={[classes, values.image, errors]}
              selectedImageID={values.image}
              handleSelection={selected => setFieldValue('image', selected)}
              data-qa-select-image
              disabled={disabled}
            />
            <AccessPanel
              password={values.root_pass}
              handleChange={input => setFieldValue('root_pass', input)}
              updateFor={[
                classes,
                values.root_pass,
                errors,
                userSSHKeys,
                values.image
              ]}
              error={errors.root_pass}
              users={userSSHKeys}
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
                type="secondary"
                className="destructive"
                onClick={handleOpen}
                data-qa-rebuild
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
