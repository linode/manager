import * as React from 'react';
import Typography from 'material-ui/Typography';

interface Props {
}

interface State {
}

type FinalProps = Props;

class OAuthClients extends React.Component<FinalProps, State> {
  render() {
    return (
      <Typography variant="headline">
        OAuth Clients
      </Typography>
    );
  }
}
export default OAuthClients;
