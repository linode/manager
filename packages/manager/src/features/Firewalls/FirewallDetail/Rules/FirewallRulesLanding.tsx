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
import Notice from 'src/components/Notice';
import withFirewalls, {
  DispatchProps
} from 'src/containers/firewalls.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
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
  ruleIdx?: number;
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

  const [error, setError] = React.useState<string | undefined>();

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

  const handleEditRule = (
    rule: Partial<FirewallRuleType>,
    category: Category
  ) => {
    if (drawer.ruleIdx === undefined) {
      return;
    }

    const dispatch =
      category === 'inbound' ? inboundDispatch : outboundDispatch;

    dispatch({ type: 'MODIFY_RULE', modifiedRule: rule, idx: drawer.ruleIdx });
  };

  // @todo: handleEditRule

  const applyChanges = () => {
    setSubmitting(true);
    setError(undefined);

    // Gather rules from state for submission to the API.
    const finalRules: FirewallRules = {
      inbound: editorStateToRules(inboundState, {
        withDeleted: false,
        withStatus: false
      }),
      outbound: editorStateToRules(outboundState, {
        withDeleted: false,
        withStatus: false
      })
    };

    props
      .updateFirewallRules({ firewallID, ...finalRules })
      .then(_rules => {
        setSubmitting(false);
        // Reset editor state.
        inboundDispatch({ type: 'RESET', rules: _rules.inbound ?? [] });
        outboundDispatch({ type: 'RESET', rules: _rules.outbound ?? [] });
      })
      .catch(err => {
        const _err = getAPIErrorOrDefault(err);

        setSubmitting(false);
        setError(_err[0].reason);
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

  const handleDeleteInboundFirewallRule = (idx: number) => {
    inboundDispatch({ type: 'DELETE_RULE', idx });
  };

  const handleDeleteOutboundFirewallRule = (idx: number) => {
    outboundDispatch({ type: 'DELETE_RULE', idx });
  };

  const handleEditInboundFirewallRule = (idx: number) => {
    setDrawer({
      mode: 'edit',
      ruleIdx: idx,
      category: 'inbound',
      isOpen: true
    });
  };

  const handleEditOutboundFirewallRule = (idx: number) => {
    setDrawer({
      mode: 'edit',
      ruleIdx: idx,
      category: 'outbound',
      isOpen: true
    });
  };

  const handleUndoDeleteInboundFirewallRule = (idx: number) => {
    inboundDispatch({ type: 'UNDO', idx });
  };

  const handleUndoDeleteOutboundFirewallRule = (idx: number) => {
    outboundDispatch({ type: 'UNDO', idx });
  };

  const ruleToModify =
    drawer.ruleIdx !== undefined
      ? drawer.category === 'inbound'
        ? inboundRules[drawer.ruleIdx]
        : outboundRules[drawer.ruleIdx]
      : undefined;

  return (
    <>
      <Typography variant="body1" className={classes.copy}>
        Firewall rules act as a whitelist, allowing network traffic that meets
        the rules’ parameters to pass through. Any traffic not explicitly
        permitted by a rule is blocked.
      </Typography>
      {error && <Notice spacingTop={8} error text={error} />}
      <div className={classes.table}>
        <FirewallRuleTable
          category="inbound"
          rulesWithStatus={inboundRules}
          openDrawer={openDrawer}
          triggerDeleteFirewallRule={handleDeleteInboundFirewallRule}
          triggerEditFirewallRule={handleEditInboundFirewallRule}
          triggerUndoDeleteFirewallRule={handleUndoDeleteInboundFirewallRule}
        />
      </div>
      <div className={classes.table}>
        <FirewallRuleTable
          category="outbound"
          rulesWithStatus={outboundRules}
          openDrawer={openDrawer}
          triggerDeleteFirewallRule={handleDeleteOutboundFirewallRule}
          triggerEditFirewallRule={handleEditOutboundFirewallRule}
          triggerUndoDeleteFirewallRule={handleUndoDeleteOutboundFirewallRule}
        />
      </div>
      <FirewallRuleDrawer
        isOpen={drawer.isOpen}
        mode={drawer.mode}
        category={drawer.category}
        onClose={closeDrawer}
        onSubmit={drawer.mode === 'create' ? handleAddRule : handleEditRule}
        ruleToModify={ruleToModify}
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
          setError(undefined);
          inboundDispatch({ type: 'DISCARD_CHANGES' });
          outboundDispatch({ type: 'DISCARD_CHANGES' });
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

        <Button buttonType="primary" onClick={handleClose}>
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
