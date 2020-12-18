import * as React from 'react';
import { useHistory } from 'react-router-dom';
import LinodeSvg from 'src/assets/icons/entityIcons/linode.svg';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';

export const ListLinodesEmptyState: React.FC<{}> = _ => {
  const { push } = useHistory();

  return (
    <Placeholder
      title={'Linodes'}
      icon={LinodeSvg}
      isEntity
      buttonProps={[
        {
          onClick: () => push('/linodes/create'),
          children: 'Add a Linode'
        }
      ]}
    >
      <Typography variant="subtitle1">
        Choose a plan, select an image, and deploy within minutes. Need help
        getting started?
      </Typography>
      <Typography variant="subtitle1">
        <Link to="https://linode.com/docs/getting-started-new-manager/">
          Learn more about getting started
        </Link>
        &nbsp;or&nbsp;
        <Link to="https://www.linode.com/docs/">
          visit our guides and tutorials.
        </Link>
      </Typography>
    </Placeholder>
  );
};

export default React.memo(ListLinodesEmptyState);
