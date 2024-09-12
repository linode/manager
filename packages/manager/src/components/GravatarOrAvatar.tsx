import React from 'react';

import { useGravatar } from 'src/hooks/useGravatar';
import { useProfile } from 'src/queries/profile/profile';

import { DEFAULT_AVATAR_SIZE } from './Avatar/Avatar';
import { Box } from './Box';

interface Props {
  avatar: JSX.Element;
  gravatar: JSX.Element;
  height?: number;
  width?: number;
}

export const GravatarOrAvatar = (props: Props) => {
  const {
    avatar,
    gravatar,
    height = DEFAULT_AVATAR_SIZE,
    width = DEFAULT_AVATAR_SIZE,
  } = props;
  const { data: profile } = useProfile();
  const { hasGravatar, isLoadingGravatar } = useGravatar(profile?.email);

  return isLoadingGravatar ? (
    <Box height={height} width={width} />
  ) : hasGravatar ? (
    gravatar
  ) : (
    avatar
  );
};
