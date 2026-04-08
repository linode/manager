import { Divider, Notice, Stack, Typography } from '@linode/ui';
import * as React from 'react';

import { UserSSHKeyPanel } from 'src/components/AccessPanel/UserSSHKeyPanel';
import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';
import { PasswordInput } from 'src/components/PasswordInput/PasswordInput';
import { useIsPasswordLessLinodesEnabled } from 'src/utilities/linodes';

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

  const { isPasswordLessLinodesEnabled } = useIsPasswordLessLinodesEnabled();

  return (
    <React.Fragment>
      <ImageSelect
        disabled={disabled}
        errorText={imageFieldError}
        onChange={onImageChange}
        value={selectedImage}
        variant="all"
      />
      {isPasswordLessLinodesEnabled ? (
        <Stack>
          <Divider spacingBottom={20} spacingTop={24} />
          <Typography sx={{ mb: 2 }} variant="h2">
            Security
          </Typography>
          <UserSSHKeyPanel
            authorizedUsers={authorizedUsers}
            disabled={disabled}
            headingVariant="h3"
            setAuthorizedUsers={setAuthorizedUsers}
          />
          <Divider spacingBottom={20} spacingTop={24} />
          <Typography variant="h3">Authentication Method</Typography>
          {passwordError && (
            <Notice
              sx={{ mb: 0, mt: 2 }}
              text={passwordError}
              variant="error"
            />
          )}
          <PasswordInput
            label="Root Password"
            onChange={(e) => onPasswordChange(e.target.value)}
            value={password || ''}
          />
          <Divider spacingBottom={20} spacingTop={24} />
        </Stack>
      ) : (
        <Stack>
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
        </Stack>
      )}
    </React.Fragment>
  );
};
