import { GrantLevel } from 'linode-js-sdk/lib/account';
import * as React from 'react';
import { compose } from 'recompose';
import AccessPanel, { UserSSHKeyObject } from 'src/components/AccessPanel';
import { Item } from 'src/components/EnhancedSelect/Select';
import withImages, { WithImages } from 'src/containers/withImages.container';
import { ImageSelect } from 'src/features/Images';
import { withLinodeDetailContext } from '../linodeDetailContext';
import LinodePermissionsError from '../LinodePermissionsError';

interface ContextProps {
  permissions: GrantLevel;
}

interface Props {
  onImageChange: (selected: Item<string>) => void;
  imageFieldError?: string;

  password: string;
  passwordError?: string;
  onPasswordChange: (password: string) => void;

  userSSHKeys: UserSSHKeyObject[];
  requestKeys: () => void;
  sshError?: string;
}

type CombinedProps = Props & ContextProps & WithImages;

export const ImageAndPassword: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    imagesData,
    imagesError,
    imageFieldError,
    onImageChange,
    onPasswordChange,
    password,
    passwordError,
    requestKeys,
    userSSHKeys,
    sshError,
    permissions
  } = props;

  const disabled = permissions === 'read_only';

  return (
    <React.Fragment>
      {disabled && <LinodePermissionsError />}
      <ImageSelect
        images={Object.values(imagesData)}
        imageError={imagesError.read ? imagesError.read[0].reason : undefined}
        imageFieldError={imageFieldError}
        onSelect={onImageChange}
        disabled={disabled}
      />
      <AccessPanel
        noPadding
        password={password || ''}
        handleChange={onPasswordChange}
        error={passwordError}
        users={userSSHKeys}
        requestKeys={requestKeys}
        sshKeyError={sshError}
        disabled={disabled}
        disabledReason={
          disabled
            ? "You don't have permissions to modify this Linode"
            : undefined
        }
      />
    </React.Fragment>
  );
};

const linodeContext = withLinodeDetailContext<ContextProps>(({ linode }) => ({
  permissions: linode._permissions
}));

const enhanced = compose<CombinedProps, Props>(
  linodeContext,
  withImages()
)(ImageAndPassword);

export default enhanced;
