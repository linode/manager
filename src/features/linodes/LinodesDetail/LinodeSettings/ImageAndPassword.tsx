import * as React from 'react';
import { compose } from 'recompose';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';

import AccessPanel, { UserSSHKeyObject } from 'src/components/AccessPanel';
import { Item } from 'src/components/EnhancedSelect/Select';
import { ImageSelect } from 'src/features/Images';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});


interface Props {
  images: Linode.Image[];
  imageError?: string;
  onImageChange: (selected: Item<string>) => void;

  password: string;
  passwordError?: string;
  onPasswordChange: (password: string) => void;

  userSSHKeys: UserSSHKeyObject[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ImageAndPassword: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    images,
    imageError,
    onImageChange,
    onPasswordChange,
    password,
    passwordError,
    userSSHKeys,
  } = props;

  return (
    <React.Fragment>
      <ImageSelect
        images={images}
        imageError={imageError}
        onSelect={onImageChange}
      />
      <AccessPanel
        noPadding
        password={password || ''}
        handleChange={onPasswordChange}
        error={passwordError}
        users={userSSHKeys}
      />
    </React.Fragment>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  styled,
)(ImageAndPassword);

export default enhanced;
