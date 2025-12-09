import { Divider } from '@linode/ui';
import * as React from 'react';

import { UserSSHKeyPanel } from 'src/components/AccessPanel/UserSSHKeyPanel';
import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';
import { PasswordInput } from 'src/components/PasswordInput/PasswordInput';

import type { Image } from '@linode/api-v4';

interface Props {
  authorizedUsers: string[];
  disabled: boolean;
  imageFieldError: string | undefined;
  onImageChange: (image: Image) => void;
  onPasswordChange: (password: string) => void;
  password: string;
  passwordError: string | undefined;
  selectedImage: Image['id'];
  setAuthorizedUsers: (usernames: string[]) => void;
}

export const ImageAndPassword = (props: Props) => {
  const {
    authorizedUsers,
    disabled,
    imageFieldError,
    onImageChange,
    onPasswordChange,
    password,
    passwordError,
    selectedImage,
    setAuthorizedUsers,
  } = props;

  return (
    <React.Fragment>
      <ImageSelect
        disabled={disabled}
        errorText={imageFieldError}
        onChange={onImageChange}
        value={selectedImage}
        variant="all"
      />
      <PasswordInput
        errorText={passwordError}
        label="Root Password"
        onChange={(e) => onPasswordChange(e.target.value)}
        value={password || ''}
      />
      <Divider spacingBottom={20} spacingTop={24} />
      <UserSSHKeyPanel
        authorizedUsers={authorizedUsers}
        disabled={disabled}
        setAuthorizedUsers={setAuthorizedUsers}
      />
    </React.Fragment>
  );
};
