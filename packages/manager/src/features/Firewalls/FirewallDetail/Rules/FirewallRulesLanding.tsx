import { FirewallRules, FirewallRuleType } from 'linode-js-sdk/lib/firewalls';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import FixedToolBar from 'src/components/FixedToolbar/FixedToolbar';
import withFirewalls, {
  DispatchProps
} from 'src/containers/firewalls.container';
import FirewallRuleDrawer, { Mode } from './FirewallRuleDrawer';
import curriedFirewallRuleEditorReducer, {
  editorStateToRules,
  hasModified as _hasModified,
  initRuleEditorState
} from './firewallRuleEditor';
import FirewallRuleTable, { Category } from './FirewallRuleTable';

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    fontSize: '1em',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1)
  },
  table: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4)
  },
  actions: {
    alignSelf: 'flex-end'
  }
}));

interface Props {
  rules: FirewallRules;
  firewallID: number;
}

interface Drawer {
  mode: Mode;
  category: Category;
  isOpen: boolean;
}

type CombinedProps = Props & RouteComponentProps & DispatchProps;

const FirewallRulesLanding: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { firewallID, rules } = props;

  const [drawer, setDrawer] = React.useState<Drawer>({
    mode: 'create',
    category: 'inbound',
    isOpen: false
  });

  const [discardChangesDialog, setDiscardChangesDialog] = React.useState<
    boolean
  >(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  // @todo: error state

  const openDrawer = React.useCallback(
    (category: Category, mode: Mode) =>
      setDrawer({ isOpen: true, category, mode }),
    []
  );

  const closeDrawer = React.useCallback(
    () => setDrawer({ ...drawer, isOpen: false }),
    []
  );

  const [inboundState, inboundDispatch] = React.useReducer(
    curriedFirewallRuleEditorReducer,
    rules.inbound ?? [],
    initRuleEditorState
  );

  const [outboundState, outboundDispatch] = React.useReducer(
    curriedFirewallRuleEditorReducer,
    rules.outbound ?? [],
    initRuleEditorState
  );

  const handleAddRule = (rule: FirewallRuleType, category: Category) => {
    const dispatch =
      category === 'inbound' ? inboundDispatch : outboundDispatch;

    dispatch({ type: 'NEW_RULE', rule });
  };

  // @todo: handleEditRule

  const applyChanges = () => {
    setSubmitting(true);

    // Gather rules from state for submission to the API.
    const finalRules: FirewallRules = {
      inbound: editorStateToRules(inboundState, false),
      outbound: editorStateToRules(outboundState, false)
    };

    props.updateFirewallRules({ firewallID, ...finalRules }).then(_rules => {
      setSubmitting(false);
      // Reset editor state.
      inboundDispatch({ type: 'RESET', rules: _rules.inbound ?? [] });
      outboundDispatch({ type: 'RESET', rules: _rules.outbound ?? [] });
    });
  };

  const hasModified = React.useMemo(
    () => _hasModified(inboundState) || _hasModified(outboundState),
    [inboundState, outboundState]
  );

  const inboundRules = React.useMemo(() => editorStateToRules(inboundState), [
    inboundState
  ]);
  const outboundRules = React.useMemo(() => editorStateToRules(outboundState), [
    outboundState
  ]);

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
          rulesWithStatus={inboundRules}
          openDrawer={openDrawer}
        />
      </div>
      <div className={classes.table}>
        <FirewallRuleTable
          category="outbound"
          rulesWithStatus={outboundRules}
          openDrawer={openDrawer}
        />
      </div>
      <FirewallRuleDrawer
        isOpen={drawer.isOpen}
        mode={drawer.mode}
        category={drawer.category}
        onClose={closeDrawer}
        onSubmit={handleAddRule}
      />
      {hasModified && (
        <FixedToolBar>
          <ActionsPanel className={classes.actions}>
            <Button
              buttonType="cancel"
              onClick={() => setDiscardChangesDialog(true)}
            >
              Discard Changes
            </Button>
            <Button
              buttonType="primary"
              onClick={applyChanges}
              loading={submitting}
            >
              Apply Changes
            </Button>
          </ActionsPanel>
        </FixedToolBar>
      )}
      <DiscardChangesDialog
        isOpen={discardChangesDialog}
        handleClose={() => setDiscardChangesDialog(false)}
        handleDiscard={() => {
          setDiscardChangesDialog(false);
          inboundDispatch({ type: 'DISCARD_CHANGES' });
        }}
      />
    </>
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  withFirewalls()
)(FirewallRulesLanding);

interface DiscardChangesDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  handleDiscard: () => void;
}

export const DiscardChangesDialog: React.FC<DiscardChangesDialogProps> = React.memo(
  props => {
    const { isOpen, handleClose, handleDiscard } = props;

    const actions = () => (
      <ActionsPanel>
        <Button buttonType="cancel" onClick={handleDiscard}>
          Discard changes
        </Button>

        <Button buttonType="secondary" destructive onClick={handleClose}>
          Go back and review changes
        </Button>
      </ActionsPanel>
    );

    return (
      <ConfirmationDialog
        open={isOpen}
        onClose={() => handleClose()}
        title="Discard Firewall changes?"
        actions={actions}
      >
        <Typography variant="subtitle1">
          Are you sure you want to discard changes to this Firewall?
        </Typography>
      </ConfirmationDialog>
    );
  }
);
