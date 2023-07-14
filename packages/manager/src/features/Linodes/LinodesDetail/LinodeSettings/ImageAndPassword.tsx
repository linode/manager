import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import AccessPanel from 'src/components/AccessPanel/AccessPanel';
import { Item } from 'src/components/EnhancedSelect/Select';
import { ImageSelect } from 'src/features/Images';
import { useAllImagesQuery } from 'src/queries/images';
import { useGrants } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { LinodePermissionsError } from '../LinodePermissionsError';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: `${theme.spacing(3)} 0 ${theme.spacing(3)} 0`,
    padding: 0,
  },
}));

interface Props {
  authorizedUsers: string[];
  imageFieldError?: string;
  linodeId: number;
  onImageChange: (selected: Item<string>) => void;
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

  const classes = useStyles();

  const { data: imagesData, error: imagesError } = useAllImagesQuery();
  const _imagesError = imagesError
    ? getAPIErrorOrDefault(imagesError, 'Unable to load Images')[0].reason
    : undefined;

  const disabled =
    grants !== undefined &&
    grants.linode.find((g) => g.id === linodeId)?.permissions === 'read_only';

  return (
    <React.Fragment>
      {disabled && <LinodePermissionsError />}
      <ImageSelect
        disabled={disabled}
        imageError={_imagesError}
        imageFieldError={imageFieldError}
        images={imagesData ?? []}
        onSelect={onImageChange}
      />
      <AccessPanel
        disabledReason={
          disabled
            ? "You don't have permissions to modify this Linode"
            : undefined
        }
        authorizedUsers={authorizedUsers}
        className={classes.root}
        disabled={disabled}
        error={passwordError}
        handleChange={onPasswordChange}
        password={password || ''}
        setAuthorizedUsers={setAuthorizedUsers}
      />
    </React.Fragment>
  );
};
