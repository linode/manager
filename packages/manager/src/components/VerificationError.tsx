import * as React from 'react';

import Typography from 'src/components/core/Typography';
import SupportLink from 'src/components/SupportLink';

interface Props {
  title: string;
  description?: string;
}

export const VerificationError: React.FC<Props> = (props) => {
  const { title, description } = props;
  return (
    <Typography>
      Additional verification is required to add this service. Please {` `}
      <SupportLink
        title={title}
        description={description}
        text="open a Support ticket"
      />
      .
    </Typography>
  );
};
