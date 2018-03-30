import * as React from 'react';
import Typography from 'material-ui/Typography';

interface Props {
}

interface State {
}

type FinalProps = Props;

class APITokens extends React.Component<FinalProps, State> {
  render() {
    return (
      <Typography variant="headline">
        API Tokens
      </Typography>
    );
  }
}
export default APITokens;
