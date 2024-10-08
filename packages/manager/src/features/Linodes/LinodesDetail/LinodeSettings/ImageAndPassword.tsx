import { styled } from '@mui/material/styles';
import * as React from 'react';

import { AccessPanel } from 'src/components/AccessPanel/AccessPanel';
import { TargetImageSelect } from 'src/components/TargetImageSelect/TargetImageSelect';
import { useAllImagesQuery } from 'src/queries/images';
import { useGrants, useProfile } from 'src/queries/profile/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

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
    setAuthorizedUsers,
  } = props;

  const { data: grants } = useGrants();
  const { data: profile } = useProfile();

  const { data: imagesData, error: imagesError } = useAllImagesQuery();

  const _imagesError = imagesError
    ? getAPIErrorOrDefault(imagesError, 'Unable to load Images')[0]?.reason
    : undefined;

  const disabled =
    profile?.restricted &&
    grants?.linode.find((g) => g.id === linodeId)?.permissions !== 'read_write';

  return (
    <React.Fragment>
      {disabled && <LinodePermissionsError />}
      <TargetImageSelect
        disabled={disabled}
        errorText={imageFieldError ?? _imagesError}
        images={imagesData ?? []}
        onSelect={onImageChange}
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
