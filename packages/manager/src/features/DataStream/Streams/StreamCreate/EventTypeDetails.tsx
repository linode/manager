import { Typography } from '@linode/ui';
import React from 'react';

export interface EventTypeDetails {
  details: string;
  header: string;
}

export const EventTypeDetails = (props: EventTypeDetails) => {
  const { details, header } = props;

  return (
    <>
      <Typography variant="subtitle1">{header}</Typography>
      <Typography variant="body1">{details}</Typography>
    </>
  );
};
