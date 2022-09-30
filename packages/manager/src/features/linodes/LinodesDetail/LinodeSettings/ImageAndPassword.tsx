import classNames from 'classnames';
import { GrantLevel } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { compose } from 'recompose';
import AccessPanel, { UserSSHKeyObject } from 'src/components/AccessPanel';
import { Item } from 'src/components/EnhancedSelect/Select';
import withImages, { WithImages } from 'src/containers/withImages.container';
import { ImageSelect } from 'src/features/Images';
import { withLinodeDetailContext } from '../linodeDetailContext';
import LinodePermissionsError from '../LinodePermissionsError';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';

interface ContextProps {
  permissions: GrantLevel;
}

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: `${theme.spacing(3)}px 0px ${theme.spacing(3)}px 0px`,
      padding: 0,
    },
  });

const styled = withStyles(styles);

interface Props {
  onImageChange: (selected: Item<string>) => void;
  imageFieldError?: string;

  password: string;
  passwordError?: string;
  onPasswordChange: (password: string) => void;

  userSSHKeys: UserSSHKeyObject[];
  requestKeys: () => void;
  sshError?: string;
  className?: string;
}

type CombinedProps = Props & ContextProps & WithImages & WithStyles<ClassNames>;

export const ImageAndPassword: React.FC<CombinedProps> = (props) => {
  const {
    classes,
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
    className,
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
        className={classNames(
          {
            [classes.root]: true,
          },
          className
        )}
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
  withImages(),
  styled
)(ImageAndPassword);

export default enhanced;
