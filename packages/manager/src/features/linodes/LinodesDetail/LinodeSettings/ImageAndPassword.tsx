import { GrantLevel } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { compose } from 'recompose';
import AccessPanel, { UserSSHKeyObject } from 'src/components/AccessPanel';
import { Item } from 'src/components/EnhancedSelect/Select';
import withImages, { WithImages } from 'src/containers/withImages.container';
import { ImageSelect } from 'src/features/Images';
import { withLinodeDetailContext } from '../linodeDetailContext';
import LinodePermissionsError from '../LinodePermissionsError';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: `${theme.spacing(3)}px 0 ${theme.spacing(3)}px 0`,
    padding: 0,
  },
}));

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

export const ImageAndPassword: React.FC<CombinedProps> = (props) => {
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
    permissions,
  } = props;

  const classes = useStyles();

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
        className={classes.root}
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
  permissions: linode._permissions,
}));

const enhanced = compose<CombinedProps, Props>(
  linodeContext,
  withImages()
)(ImageAndPassword);

export default enhanced;
