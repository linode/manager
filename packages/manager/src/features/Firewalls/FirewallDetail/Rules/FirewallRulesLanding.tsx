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
  initRuleEditorState,
  prepareRules
} from './firewallRuleEditor';
import FirewallRuleTable from './FirewallRuleTable';
import { Category } from './types';

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

  /**
   * Component state and handlers
   */
  const [ruleDrawer, setRuleDrawer] = React.useState<Drawer>({
    mode: 'create',
    category: 'inbound',
    isOpen: false
  });
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  // @todo fine-grained error handling.
  const [error, setError] = React.useState<string | undefined>();
  const [discardChangesModalOpen, setDiscardChangesModalOpen] = React.useState<
    boolean
  >(false);

  const openRuleDrawer = (category: Category, mode: Mode, idx?: number) =>
    setRuleDrawer({
      mode,
      ruleIdx: idx,
      category,
      isOpen: true
    });

  const closeRuleDrawer = () => setRuleDrawer({ ...ruleDrawer, isOpen: false });

  /**
   * Rule Editor state hand handlers
   */
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

  const dispatchFromCategory = (category: Category) =>
    category === 'inbound' ? inboundDispatch : outboundDispatch;

  const handleAddRule = (category: Category, rule: FirewallRuleType) => {
    const dispatch = dispatchFromCategory(category);
    dispatch({ type: 'NEW_RULE', rule });
  };

  const handleEditRule = (
    category: Category,
    rule: Partial<FirewallRuleType>
  ) => {
    // This shouldn't happen.
    if (ruleDrawer.ruleIdx === undefined) {
      return;
    }

    const dispatch = dispatchFromCategory(category);
    dispatch({
      type: 'MODIFY_RULE',
      modifiedRule: rule,
      idx: ruleDrawer.ruleIdx
    });
  };

  const handleDeleteRule = (category: Category, idx: number) => {
    const dispatch = dispatchFromCategory(category);
    dispatch({ type: 'DELETE_RULE', idx });
  };

  const handleUndo = (category: Category, idx: number) => {
    const dispatch = dispatchFromCategory(category);
    dispatch({ type: 'UNDO', idx });
  };

  const applyChanges = () => {
    setSubmitting(true);
    setError(undefined);

    // Gather rules from state for submission to the API.
    const finalRules: FirewallRules = {
      inbound: prepareRules(inboundState),
      outbound: prepareRules(outboundState)
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

  const shouldDisplayFixedToolbar = React.useMemo(
    () => _hasModified(inboundState) || _hasModified(outboundState),
    [inboundState, outboundState]
  );

  const inboundRules = React.useMemo(() => editorStateToRules(inboundState), [
    inboundState
  ]);
  const outboundRules = React.useMemo(() => editorStateToRules(outboundState), [
    outboundState
  ]);

  // This is for the Rule Drawer. If there is a rule to modify,
  // we need to pass it to the drawer to pre-populate the form fields.
  const ruleToModify =
    ruleDrawer.ruleIdx !== undefined
      ? ruleDrawer.category === 'inbound'
        ? inboundRules[ruleDrawer.ruleIdx]
        : outboundRules[ruleDrawer.ruleIdx]
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
          openRuleDrawer={openRuleDrawer}
          triggerOpenRuleDrawerForEditing={(idx: number) =>
            openRuleDrawer('inbound', 'edit', idx)
          }
          triggerDeleteFirewallRule={idx => handleDeleteRule('inbound', idx)}
          triggerUndo={idx => handleUndo('inbound', idx)}
        />
      </div>
      <div className={classes.table}>
        <FirewallRuleTable
          category="outbound"
          rulesWithStatus={outboundRules}
          openRuleDrawer={openRuleDrawer}
          triggerOpenRuleDrawerForEditing={(idx: number) =>
            openRuleDrawer('outbound', 'edit', idx)
          }
          triggerDeleteFirewallRule={idx => handleDeleteRule('outbound', idx)}
          triggerUndo={idx => handleUndo('outbound', idx)}
        />
      </div>
      <FirewallRuleDrawer
        isOpen={ruleDrawer.isOpen}
        mode={ruleDrawer.mode}
        category={ruleDrawer.category}
        onClose={closeRuleDrawer}
        onSubmit={ruleDrawer.mode === 'create' ? handleAddRule : handleEditRule}
        ruleToModify={ruleToModify}
      />
      {shouldDisplayFixedToolbar && (
        <FixedToolBar>
          <ActionsPanel className={classes.actions}>
            <Button
              buttonType="cancel"
              onClick={() => setDiscardChangesModalOpen(true)}
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
        isOpen={discardChangesModalOpen}
        handleClose={() => setDiscardChangesModalOpen(false)}
        handleDiscard={() => {
          setDiscardChangesModalOpen(false);
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

    const actions = React.useCallback(
      () => (
        <ActionsPanel>
          <Button buttonType="cancel" onClick={handleDiscard}>
            Discard changes
          </Button>

          <Button buttonType="primary" onClick={handleClose}>
            Go back and review changes
          </Button>
        </ActionsPanel>
      ),
      []
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
