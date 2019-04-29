import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import AccessPanel from 'src/components/AccessPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import withImages from 'src/containers/withImages.container';
import { resetEventsPolling } from 'src/events';
import SelectImagePanel from 'src/features/linodes/LinodesCreate/SelectImagePanel';
import userSSHKeyHoc, {
  UserSSHKeyProps
} from 'src/features/linodes/userSSHKeyHoc';
import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel';
import StackScriptDrawer from 'src/features/StackScripts/StackScriptDrawer';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';
import { useErrors } from 'src/hooks/useErrors';
import { useForm } from 'src/hooks/useForm';
import { useStackScript } from 'src/hooks/useStackScript';
import { rebuildLinode } from 'src/services/linodes';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { filterPublicImages } from 'src/utilities/images';
import { withLinodeDetailContext } from '../linodeDetailContext';
import { RebuildDialog } from './RebuildDialog';

import {
  getCommunityStackscripts,
  getMineAndAccountStackScripts
} from 'src/features/StackScripts/stackScriptUtils';

type ClassNames = 'root' | 'error' | 'emptyImagePanel' | 'emptyImagePanelText';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  error: {
    marginTop: theme.spacing.unit * 2
  },
  emptyImagePanel: {
    padding: theme.spacing.unit * 3
  },
  emptyImagePanelText: {
    marginTop: theme.spacing.unit,
    padding: `${theme.spacing.unit}px 0`
  }
});

interface Props {
  type: 'community' | 'account';
}

interface ContextProps {
  linodeId: number;
}
interface WithImagesProps {
  imagesData: Linode.Image[];
  imagesLoading: boolean;
  imagesError?: string;
}

interface RebuildFromStackScriptForm {
  imageID: string;
  password: string;
}

export type CombinedProps = Props &
  WithStyles<ClassNames> &
  WithImagesProps &
  ContextProps &
  UserSSHKeyProps &
  RouteComponentProps &
  WithSnackbarProps;

export const RebuildFromStackScript: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    classes,
    imagesData,
    userSSHKeys,
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

  const [form, setField, resetForm] = useForm<RebuildFromStackScriptForm>({
    imageID: '',
    password: ''
  });

  const [errors, setErrors, resetErrors] = useErrors();
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

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
    setField('imageID', '');
  };

  const handleSubmit = () => {
    // @todo: Ideally we would do form validation BEFORE opening up the
    // confirmation dialog.

    // StackScript ID is technically an optional field on the rebuildLinode
    // request, so we need to explicitly check for it here.
    if (!ss.id) {
      setErrors([
        { field: 'stackscript_id', reason: 'You must select a StackScript' }
      ]);
      setIsDialogOpen(false);
      return;
    }

    setIsLoading(true);

    rebuildLinode(linodeId, {
      stackscript_id: ss.id,
      stackscript_data: ss.udf_data,
      root_pass: form.password,
      image: form.imageID,
      authorized_users: userSSHKeys.filter(u => u.selected).map(u => u.username)
    })
      .then(_ => {
        resetEventsPolling();
        resetForm();
        resetErrors();
        setIsLoading(false);
        setIsDialogOpen(false);
        enqueueSnackbar('Linode rebuild started', {
          variant: 'info'
        });
        history.push(`/linodes/${linodeId}/summary`);
      })
      .catch(errorResponse => {
        setIsLoading(false);
        setIsDialogOpen(false);

        setErrors(
          getAPIErrorOrDefault(
            errorResponse,
            'There was an issue rebuilding your Linode.'
          )
        );
      });
  };

  // The error handling below could probably go into the useErrors() hook.
  const fixedErrorFields = ['stackscript_id', 'root_pass', 'image', 'none'];

  const hasErrorFor = getErrorMap(
    [
      ...fixedErrorFields,
      ...ss.user_defined_fields.map(
        (udf: Linode.StackScript.UserDefinedField) => udf.name
      )
    ],
    errors
  );
  const generalError = hasErrorFor.none;
  const udfErrors = getUDFErrors(fixedErrorFields, errors);

  return (
    <Grid item className={classes.root}>
      {generalError && (
        <Notice
          error
          className={classes.error}
          text={generalError}
          data-qa-notice
        />
      )}
      <SelectStackScriptPanel
        error={hasErrorFor.stackscript_id}
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
          updateFor={[classes, ss.user_defined_fields, ss.udf_data, errors]}
          udf_data={ss.udf_data}
        />
      )}
      {ss.images && ss.images.length > 0 ? (
        <SelectImagePanel
          variant="all"
          images={ss.images}
          handleSelection={(selected: string) => setField('imageID', selected)}
          updateFor={[classes, form.imageID, ss.images, errors]}
          selectedImageID={form.imageID}
          error={hasErrorFor.image}
        />
      ) : (
        <Paper className={classes.emptyImagePanel}>
          {/* empty state for images */}
          {hasErrorFor.image && (
            <Notice error={true} text={hasErrorFor.image} />
          )}
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
        password={form.password}
        handleChange={value => setField('password', value)}
        updateFor={[form.password, errors, userSSHKeys, ss.id]}
        error={hasErrorFor.root_pass}
        users={userSSHKeys}
        data-qa-access-panel
      />
      <ActionsPanel>
        <Button
          type="secondary"
          className="destructive"
          onClick={() => setIsDialogOpen(true)}
          data-qa-rebuild
        >
          Rebuild
        </Button>
      </ActionsPanel>
      <RebuildDialog
        isOpen={isDialogOpen}
        isLoading={isLoading}
        handleClose={() => setIsDialogOpen(false)}
        handleSubmit={handleSubmit}
      />
      <StackScriptDrawer />
    </Grid>
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

const getUDFErrors = (
  fixedErrorFields: string[],
  errors: Linode.ApiFieldError[] | undefined
) => {
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
