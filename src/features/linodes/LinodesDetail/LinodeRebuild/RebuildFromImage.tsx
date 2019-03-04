import { InjectedNotistackProps, withSnackbar } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import AccessPanel from 'src/components/AccessPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import withImages from 'src/containers/withImages.container';
import { resetEventsPolling } from 'src/events';
import SelectImagePanel from 'src/features/linodes/LinodesCreate/SelectImagePanel.tsx';
import userSSHKeyHoc, {
  UserSSHKeyProps
} from 'src/features/linodes/userSSHKeyHoc';
import { rebuildLinode, RebuildRequest } from 'src/services/linodes';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { withLinodeDetailContext } from '../linodeDetailContext';

interface WithImagesProps {
  imagesData: Linode.Image[];
  imagesLoading: boolean;
  imagesError?: string;
}

interface ContextProps {
  linodeId: number;
}

export type CombinedProps = WithImagesProps &
  ContextProps &
  UserSSHKeyProps &
  InjectedNotistackProps;

export const RebuildFromImage: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    imagesData,
    imagesError,
    userSSHKeys,
    linodeId,
    enqueueSnackbar
  } = props;

  const [selectedImage, setSelectedImage] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [errors, setErrors] = React.useState<Linode.ApiFieldError[]>([]);

  const handleSubmit = () => {
    // @todo: as this is destructive, we really should be presenting a confirmation dialog before doing this.

    const params: RebuildRequest = {
      image: selectedImage,
      root_pass: password!,
      authorized_users: userSSHKeys.filter(u => u.selected).map(u => u.username)
    };

    // @todo: eventually this should be a dispatched action instead of a services library call
    rebuildLinode(linodeId, params)
      .then(response => {
        resetEventsPolling();

        setSelectedImage('');
        setPassword('');
        setErrors([]);

        enqueueSnackbar('Linode rebuild started', {
          variant: 'info'
        });
      })
      .catch(errorResponse => {
        setErrors(
          getAPIErrorOrDefault(
            errorResponse,
            'There was an issue rebuilding your Linode.'
          )
        );
      });
  };

  const hasErrorFor = getErrorMap(['image', 'root_pass'], errors);

  return (
    <>
      <SelectImagePanel
        images={imagesData}
        error={imagesError || hasErrorFor.image}
        updateFor={[selectedImage, errors]}
        selectedImageID={selectedImage}
        handleSelection={selected => setSelectedImage(selected)}
        data-qa-select-image
      />
      <AccessPanel
        password={password}
        handleChange={value => setPassword(value)}
        updateFor={[password, errors, userSSHKeys, selectedImage]}
        error={hasErrorFor.root_pass}
        users={userSSHKeys}
        data-qa-access-panel
      />
      <ActionsPanel>
        <Button
          type="secondary"
          className="destructive"
          onClick={handleSubmit}
          data-qa-rebuild
        >
          Rebuild
        </Button>
      </ActionsPanel>
    </>
  );
};

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeId: linode.id
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
  withSnackbar
);

export default enhanced(RebuildFromImage);
