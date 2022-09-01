import * as React from 'react';
import { compose } from 'recompose';
import { withLinodeDetailContext } from '../linodeDetailContext';
import FirewallsLanding from './LinodeFirewallsLanding';

type CombinedProps = StateProps;

export const LinodeFirewalls: React.FC<CombinedProps> = (props) => {
  const { linodeID } = props;

  return <FirewallsLanding linodeId={linodeID} />;
};

interface StateProps {
  linodeID: number;
}
const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeID: linode.id,
}));

const enhanced = compose<CombinedProps, {}>(linodeContext);

export default enhanced(LinodeFirewalls);
