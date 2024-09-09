// TODO: refactor or delete

import React from 'react';
import { makeStyles } from 'tss-react/mui';

import { useGravatar } from 'src/hooks/useGravatar';
import { useProfile } from 'src/queries/profile/profile';
import { fadeIn } from 'src/styles/keyframes';

import { Avatar } from './Avatar/Avatar';
import { Box } from './Box';
import { GravatarByEmail } from './GravatarByEmail';
import { GravatarByUsername } from './GravatarByUsername';

import type { AvatarProps } from './Avatar/Avatar';
import type { GravatarByEmailProps } from './GravatarByEmail';
import type { GravatarByUsernameProps } from './GravatarByUsername';

interface Props {
  avatarProps?: AvatarProps;
  gravatarProps?: GravatarByEmailProps | GravatarByUsernameProps;
  height?: number;
  width?: number;
}

const useStyles = makeStyles()(() => ({
  root: {
    animation: `${fadeIn} 1.75 ease-out forwards`,
  },
}));

export const GravatarOrAvatar = (props: Props) => {
  const { avatarProps, gravatarProps, height, width } = props;
  const { data: profile } = useProfile();
  const { hasGravatar, isLoadingGravatar } = useGravatar(profile?.email);
  const { classes } = useStyles();
  const Gravatar =
    gravatarProps && 'email' in gravatarProps ? (
      <GravatarByEmail
        className={classes.root}
        email={gravatarProps?.email}
        height={height}
        width={width}
      />
    ) : (
      <GravatarByUsername
        className={classes.root}
        username={gravatarProps?.username ?? ''}
      />
    );

  return isLoadingGravatar ? (
    <Box
      height={height}
      //   sx={{ animation: `${fadeIn} .2s ease-in forwards` }}
      width={width}
    />
  ) : (
    <Box
      height={height}
      //   sx={{ animation: `${fadeIn} .2s ease-out forwards` }}
      width={width}
    >
      {hasGravatar ? (
        Gravatar
      ) : (
        <Avatar
          height={height}
          username={avatarProps?.username}
          width={width}
        />
      )}
    </Box>
  );
};
