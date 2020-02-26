import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
// import { makeStyles, Theme } from 'src/components/core/styles'

// const useStyles = makeStyles((theme: Theme) => ({
//   root: {}
// }))
import Typography from 'src/components/core/Typography';

// interface Props { }

type CombinedProps = RouteComponentProps;

const FirewallLinodesLanding: React.FC<CombinedProps> = props => {
  // const classes = useStyles();

  return (
    <>
      <Typography>
        The following Linodes have been assigned to this Firewall.
      </Typography>
    </>
  );
};

export default compose<CombinedProps, {}>(React.memo)(FirewallLinodesLanding);
