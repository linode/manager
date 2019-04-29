import { withSnackbar, WithSnackbarProps } from 'notistack';
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
import { rebuildLinode, RebuildRequest } from 'src/services/linodes';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
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

  const [selectedImage, setSelectedImage] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [errors, setErrors] = React.useState<Linode.ApiFieldError[]>([]);

  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const handleSubmit = () => {
    // @todo: Ideally we would do form validation BEFORE opening up the
    // confirmation dialog.
    setIsLoading(true);

    const params: RebuildRequest = {
      image: selectedImage,
      root_pass: password!,
      authorized_users: userSSHKeys.filter(u => u.selected).map(u => u.username)
    };

    // @todo: eventually this should be a dispatched action instead of a services library call
    rebuildLinode(linodeId, params)
      .then(_ => {
        resetEventsPolling();

        setIsLoading(false);
        setIsDialogOpen(false);
        setSelectedImage('');
        setPassword('');
        setErrors([]);

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
        scrollErrorIntoView();
      });
  };

  const hasErrorFor = getErrorMap(['image', 'root_pass', 'none'], errors);
  const generalError = hasErrorFor.none;

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
      <SelectImagePanel
        images={imagesData}
        error={imagesError || hasErrorFor.image}
        updateFor={[classes, selectedImage, errors]}
        selectedImageID={selectedImage}
        handleSelection={selected => setSelectedImage(selected)}
        data-qa-select-image
        disabled={disabled}
      />
      <AccessPanel
        password={password}
        handleChange={value => setPassword(value)}
        updateFor={[classes, password, errors, userSSHKeys, selectedImage]}
        error={hasErrorFor.root_pass}
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
          onClick={() => setIsDialogOpen(true)}
          data-qa-rebuild
          disabled={disabled}
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
    </Grid>
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
