import * as React from 'react';
import { useHistory } from 'react-router-dom';
import LinodeSvg from 'src/assets/icons/entityIcons/linode.svg';
import Typography from 'src/components/core/Typography';
import Placeholder from 'src/components/Placeholder';
import { sendEvent } from 'src/utilities/ga';

export const ListLinodesEmptyState: React.FC<{}> = (_) => {
  const { push } = useHistory();

  const emptyLinodeLandingGAEventTemplate = {
    category: 'Linodes landing page empty',
    action: 'Click:link',
  };

  return (
    <Placeholder
      title={'Linodes'}
      subtitle="Cloud-based virtual machines"
      icon={LinodeSvg}
      isEntity
      buttonProps={[
        {
          onClick: () => {
            sendEvent({
              category: 'Linodes landing page empty',
              action: 'Click:button',
              label: 'Create Linode',
            });
            push('/linodes/create');
          },
          children: 'Create Linode',
        },
      ]}
    >
      <Typography
        style={{ fontSize: '1.125rem', lineHeight: '1.75rem', maxWidth: 541 }}
      >
        Host your websites, applications, or any other Cloud-based workloads on
        a scalable and reliable platform.
      </Typography>
    </Placeholder>
  );
};

export default React.memo(ListLinodesEmptyState);
