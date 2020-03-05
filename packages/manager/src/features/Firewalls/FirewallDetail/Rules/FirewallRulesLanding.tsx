import { FirewallRules } from 'linode-js-sdk/lib/firewalls';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import FirewallRuleDrawer from './FirewallRuleDrawer';
import FirewallRuleTable from './FirewallRuleTable';

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    fontSize: '1em',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1)
  },
  table: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4)
  }
}));

interface Props {
  rules: FirewallRules;
}

type CombinedProps = Props & RouteComponentProps;

const FirewallRulesLanding: React.FC<CombinedProps> = props => {
  const { rules } = props;

  const classes = useStyles();

  const [ruleCategory, setRuleCategory] = React.useState<
    'inbound' | 'outbound'
  >('inbound');

  const [mode] = React.useState<'create' | 'edit'>('create');

  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const openDrawerForCreating = React.useCallback(
    (category: 'inbound' | 'outbound') => {
      setRuleCategory(category);
      setIsOpen(true);
    },
    []
  );

  const closeDrawer = React.useCallback(() => setIsOpen(false), []);

  return (
    <>
      <Typography variant="body1" className={classes.copy}>
        Firewall rules act as a whitelist, allowing network traffic that meets
        the rules’ parameters to pass through. Any traffic not explicitly
        permitted by a rule is blocked.
      </Typography>
      <div className={classes.table}>
        <FirewallRuleTable
          category="inbound"
          rules={rules.inbound ?? []}
          openDrawerForCreating={openDrawerForCreating}
        />
      </div>
      <div className={classes.table}>
        <FirewallRuleTable
          category="outbound"
          rules={rules.outbound ?? []}
          openDrawerForCreating={openDrawerForCreating}
        />
      </div>
      <FirewallRuleDrawer
        isOpen={isOpen}
        mode={mode}
        category={ruleCategory}
        onClose={closeDrawer}
      />
    </>
  );
};

export default compose<CombinedProps, Props>(React.memo)(FirewallRulesLanding);
