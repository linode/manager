import * as React from 'react';

import Typography from 'src/components/core/Typography';
import SupportLink from 'src/components/SupportLink';

interface Props {
  title: string;
  description?: string;
}

export const AccountLimitError: React.FC<Props> = (props) => {
  const { title } = props;
  return (
    <Typography>
      Account Limit reached. Please {` `}
      <SupportLink title={title} text="open a support ticket" />.
    </Typography>
  );
};
