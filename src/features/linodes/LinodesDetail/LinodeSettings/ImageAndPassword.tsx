import * as React from 'react';
import { compose } from 'recompose';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

import AccessPanel, { UserSSHKeyObject } from 'src/components/AccessPanel';
import { Item } from 'src/components/EnhancedSelect/Select';
import withImages, { WithImages } from 'src/containers/withImages.container';
import { ImageSelect } from 'src/features/Images';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  onImageChange: (selected: Item<string>) => void;
  imageFieldError?: string;

  password: string;
  passwordError?: string;
  onPasswordChange: (password: string) => void;

  userSSHKeys: UserSSHKeyObject[];
}

type CombinedProps = Props & WithImages & WithStyles<ClassNames>;

export const ImageAndPassword: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    images,
    imageError,
    imageFieldError,
    onImageChange,
    onPasswordChange,
    password,
    passwordError,
    userSSHKeys
  } = props;

  return (
    <React.Fragment>
      <ImageSelect
        images={images}
        imageError={imageError}
        imageFieldError={imageFieldError}
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
  withImages((ownProps, images, imagesLoading, imageError) => ({
    ...ownProps,
    images,
    imagesLoading,
    imageError
  }))
)(ImageAndPassword);

export default enhanced;
