import * as React from 'react';

import { SupportLink } from 'src/components/SupportLink';
import { Typography } from 'src/components/Typography';

interface Props {
  description?: string;
  title: string;
}

export const VerificationError: React.FC<Props> = (props) => {
  const { description, title } = props;
  return (
    <Typography>
      Additional verification is required to add this service. Please {` `}
      <SupportLink
        description={description}
        text="open a Support ticket"
        title={title}
      />
      .
    </Typography>
  );
};
