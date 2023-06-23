import { GrantLevel } from '@linode/api-v4/lib/account';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { compose } from 'recompose';
import AccessPanel from 'src/components/AccessPanel/AccessPanel';
import { Item } from 'src/components/EnhancedSelect/Select';
import { ImageSelect } from 'src/features/Images';
import { useAllImagesQuery } from 'src/queries/images';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { withLinodeDetailContext } from '../linodeDetailContext';
import LinodePermissionsError from '../LinodePermissionsError';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: `${theme.spacing(3)} 0 ${theme.spacing(3)} 0`,
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

  setAuthorizedUsers: (usernames: string[]) => void;
  authorizedUsers: string[];
}

type CombinedProps = Props & ContextProps;

export const ImageAndPassword: React.FC<CombinedProps> = (props) => {
  const {
    imageFieldError,
    onImageChange,
    onPasswordChange,
    password,
    passwordError,
    setAuthorizedUsers,
    authorizedUsers,
    permissions,
  } = props;

  const classes = useStyles();

  const { data: imagesData, error: imagesError } = useAllImagesQuery();
  const _imagesError = imagesError
    ? getAPIErrorOrDefault(imagesError, 'Unable to load Images')[0].reason
    : undefined;

  const disabled = permissions === 'read_only';

  return (
    <React.Fragment>
      {disabled && <LinodePermissionsError />}
      <ImageSelect
        images={imagesData ?? []}
        imageError={_imagesError}
        imageFieldError={imageFieldError}
        onSelect={onImageChange}
        disabled={disabled}
      />
      <AccessPanel
        className={classes.root}
        password={password || ''}
        handleChange={onPasswordChange}
        error={passwordError}
        authorizedUsers={authorizedUsers}
        setAuthorizedUsers={setAuthorizedUsers}
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

const enhanced = compose<CombinedProps, Props>(linodeContext)(ImageAndPassword);

export default enhanced;
