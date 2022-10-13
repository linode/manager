import * as React from 'react';
import { APIError } from '@linode/api-v4/lib/types';
import Typography from 'src/components/core/Typography';
import SupportLink from 'src/components/SupportLink';
import { useStyles } from 'src/components/Notice/Notice';
interface Props {
  errors: APIError[];
}

export const SupportError: React.FC<Props> = (props) => {
  const { errors } = props;
  const [reason] = errors[0].reason.split(/open a support ticket\./i);

  const classes = useStyles();

  return (
    <Typography className={classes.noticeText}>
      {reason} {` `}
      <SupportLink text="open a support ticket" />.
    </Typography>
  );
};
