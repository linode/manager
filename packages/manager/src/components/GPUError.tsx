import * as React from 'react';

import Typography from 'src/components/core/Typography';
import SupportLink from 'src/components/SupportLink';

export const GPUError: React.FC<{}> = () => {
  return (
    <>
      <Typography>
        Additional verification is required to add this service. Please {` `}
        <SupportLink
          title="GPU Request"
          description=""
          text="open a Support ticket"
        />
        .
      </Typography>
    </>
  );
};
