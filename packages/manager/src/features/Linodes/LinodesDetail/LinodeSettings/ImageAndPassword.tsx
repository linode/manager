import { styled } from '@mui/material/styles';
import * as React from 'react';

import { AccessPanel } from 'src/components/AccessPanel/AccessPanel';
import { ImageSelectv2 } from 'src/components/ImageSelectv2/ImageSelectv2';
import { useGrants, useProfile } from 'src/queries/profile/profile';

import { LinodePermissionsError } from '../LinodePermissionsError';

import type { Image } from '@linode/api-v4';

interface Props {
  authorizedUsers: string[];
  imageFieldError?: string;
  linodeId: number;
  onImageChange: (image: Image) => void;
  onPasswordChange: (password: string) => void;
  password: string;
  passwordError?: string;
  selectedImage: string;
  setAuthorizedUsers: (usernames: string[]) => void;
}

export const ImageAndPassword = (props: Props) => {
  const {
    authorizedUsers,
    imageFieldError,
    linodeId,
    onImageChange,
    onPasswordChange,
    password,
    passwordError,
    selectedImage,
    setAuthorizedUsers,
  } = props;

  const { data: grants } = useGrants();
  const { data: profile } = useProfile();

  const disabled =
    profile?.restricted &&
    grants?.linode.find((g) => g.id === linodeId)?.permissions !== 'read_write';

  return (
    <React.Fragment>
      {disabled && <LinodePermissionsError />}
      <ImageSelectv2
        disabled={disabled}
        errorText={imageFieldError}
        onChange={onImageChange}
        value={selectedImage}
      />
      <StyledAccessPanel
        disabledReason={
          disabled
            ? "You don't have permissions to modify this Linode"
            : undefined
        }
        authorizedUsers={authorizedUsers}
        disabled={disabled}
        error={passwordError}
        handleChange={onPasswordChange}
        password={password || ''}
        setAuthorizedUsers={setAuthorizedUsers}
      />
    </React.Fragment>
  );
};

const StyledAccessPanel = styled(AccessPanel, { label: 'StyledAccessPanel' })(
  ({ theme }) => ({
    margin: `${theme.spacing(3)} 0 ${theme.spacing(3)} 0`,
    padding: 0,
  })
);
