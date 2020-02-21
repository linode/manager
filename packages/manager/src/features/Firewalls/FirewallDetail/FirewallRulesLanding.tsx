import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import FirewallRuleTable from './FirewallRuleTable';

const useStyles = makeStyles((theme: Theme) => ({
  explainerCopy: {
    fontSize: '1em',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1)
  },
  table: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4)
  }
}));

// interface Props { }

type CombinedProps = RouteComponentProps;

const FirewallRulesLanding: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  // return <h2>Firewall Rules Landing</h2>;

  return (
    <>
      <Typography variant="body1" className={classes.explainerCopy}>
        Firewall rules act as a whitelist, allowing network traffic that meets
        the rules’ parameters to pass through. Any traffic not explicitly
        permitted by a rule is blocked.
      </Typography>
      <div className={classes.table}>
        <FirewallRuleTable ruleType="inbound" />
      </div>
      <div className={classes.table}>
        <FirewallRuleTable ruleType="outbound" />
      </div>
    </>
  );
};

export default compose<CombinedProps, {}>(React.memo)(FirewallRulesLanding);
