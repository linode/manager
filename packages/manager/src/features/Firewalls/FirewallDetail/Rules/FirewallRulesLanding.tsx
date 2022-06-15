import {
  FirewallPolicyType,
  FirewallRules,
  FirewallRuleType,
} from '@linode/api-v4/lib/firewalls';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import Prompt from 'src/components/Prompt';
import withFirewalls, {
  DispatchProps,
} from 'src/containers/firewalls.container';
import { updateFirewallRules } from 'src/queries/firewalls';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import FirewallRuleDrawer, { Mode } from './FirewallRuleDrawer';
import curriedFirewallRuleEditorReducer, {
  editorStateToRules,
  hasModified as _hasModified,
  initRuleEditorState,
  prepareRules,
  stripExtendedFields,
} from './firewallRuleEditor';
import FirewallRuleTable from './FirewallRuleTable';
import { Category, parseFirewallRuleError } from './shared';

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    paddingBottom: theme.spacing(1),
  },
  table: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  actions: {
    float: 'right',
  },
  mobileSpacing: {
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  },
}));

interface Props {
  firewallID: number;
  rules: FirewallRules;
  disabled: boolean;
}

interface Drawer {
  mode: Mode;
  category: Category;
  isOpen: boolean;
  ruleIdx?: number;
}

type CombinedProps = Props & DispatchProps & RouteComponentProps;

const FirewallRulesLanding: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { firewallID, rules, disabled } = props;

  /**
   * inbound and outbound policy aren't part of any particular rule
   * so they are managed separately rather than through the reducer.
   */

  const [policy, setPolicy] = React.useState({
    inbound: rules.inbound_policy,
    outbound: rules.outbound_policy,
  });

  const handlePolicyChange = (
    category: Category,
    newPolicy: FirewallPolicyType
  ) => {
    setPolicy((oldPolicy) => ({ ...oldPolicy, [category]: newPolicy }));
  };

  const _hasModifiedPolicy = () =>
    policy.inbound !== rules.inbound_policy ||
    policy.outbound !== rules.outbound_policy;

  /**
   * Component state and handlers
   */
  const [ruleDrawer, setRuleDrawer] = React.useState<Drawer>({
    mode: 'create',
    category: 'inbound',
    isOpen: false,
  });
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  // @todo fine-grained error handling.
  const [generalErrors, setGeneralErrors] = React.useState<
    APIError[] | undefined
  >();
  const [
    discardChangesModalOpen,
    setDiscardChangesModalOpen,
  ] = React.useState<boolean>(false);

  const openRuleDrawer = (category: Category, mode: Mode, idx?: number) =>
    setRuleDrawer({
      mode,
      ruleIdx: idx,
      category,
      isOpen: true,
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

  const handleCloneRule = (category: Category, idx: number) => {
    const dispatch = dispatchFromCategory(category);
    dispatch({ type: 'CLONE_RULE', idx });
  };

  const handleReorder = (
    category: Category,
    startIdx: number,
    endIdx: number
  ) => {
    const dispatch = dispatchFromCategory(category);
    dispatch({ type: 'REORDER', startIdx, endIdx });
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
      idx: ruleDrawer.ruleIdx,
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
    setGeneralErrors(undefined);

    // Gather rules from state for submission to the API. Keep these around,
    // because we may need to reference extended fields like "index" for error handling.
    const preparedRules = {
      inbound: prepareRules(inboundState),
      outbound: prepareRules(outboundState),
    };

    const finalRules = {
      inbound: preparedRules.inbound.map(stripExtendedFields),
      outbound: preparedRules.outbound.map(stripExtendedFields),
      inbound_policy: policy.inbound,
      outbound_policy: policy.outbound,
    };

    updateFirewallRules(firewallID, finalRules)
      .then((_rules) => {
        setSubmitting(false);
        // Reset editor state.
        inboundDispatch({ type: 'RESET', rules: _rules.inbound ?? [] });
        outboundDispatch({ type: 'RESET', rules: _rules.outbound ?? [] });
      })
      .catch((err) => {
        setSubmitting(false);

        const _err = getAPIErrorOrDefault(err);

        for (const thisError of _err) {
          const parsedError = parseFirewallRuleError(thisError);

          // If we are unable to parse this error as a FirewallRuleError,
          // consider it a general error.
          if (parsedError === null) {
            setGeneralErrors((prevGeneralErrors) => [
              ...(prevGeneralErrors ?? []),
              thisError,
            ]);
          } else {
            const { idx, category } = parsedError;

            const dispatch = dispatchFromCategory(category as Category);
            dispatch({
              type: 'SET_ERROR',
              idx,
              error: parsedError,
            });
          }
        }
      });
  };

  const hasUnsavedChanges = React.useMemo(
    () =>
      Boolean(
        _hasModified(inboundState) ||
          _hasModified(outboundState) ||
          _hasModifiedPolicy()
      ),
    [inboundState, outboundState, policy, rules]
  );

  const inboundRules = React.useMemo(() => editorStateToRules(inboundState), [
    inboundState,
  ]);
  const outboundRules = React.useMemo(() => editorStateToRules(outboundState), [
    outboundState,
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
      <Prompt when={hasUnsavedChanges} confirmWhenLeaving={true}>
        {({ isModalOpen, handleCancel, handleConfirm }) => {
          return (
            <ConfirmationDialog
              open={isModalOpen}
              onClose={handleCancel}
              title="Discard Firewall changes?"
              actions={() => (
                <ActionsPanel>
                  <Button buttonType="secondary" onClick={handleConfirm}>
                    Leave and discard changes
                  </Button>

                  <Button buttonType="primary" onClick={handleCancel}>
                    Go back and review changes
                  </Button>
                </ActionsPanel>
              )}
            >
              <Typography variant="subtitle1">
                The changes you made to this Firewall haven&rsquo;t been
                applied. If you navigate away from this page, your changes will
                be discarded.
              </Typography>
            </ConfirmationDialog>
          );
        }}
      </Prompt>

      {disabled ? (
        <Notice
          text={
            "You don't have permissions to modify this Firewall. Please contact an account administrator for details."
          }
          error
          important
        />
      ) : null}

      {generalErrors?.length === 1 && (
        <Notice spacingTop={8} error text={generalErrors[0].reason} />
      )}

      <div className={classes.table}>
        <FirewallRuleTable
          category="inbound"
          policy={policy.inbound}
          disabled={disabled}
          handlePolicyChange={handlePolicyChange}
          triggerCloneFirewallRule={(idx: number) =>
            handleCloneRule('inbound', idx)
          }
          rulesWithStatus={inboundRules}
          openRuleDrawer={openRuleDrawer}
          triggerOpenRuleDrawerForEditing={(idx: number) =>
            openRuleDrawer('inbound', 'edit', idx)
          }
          triggerDeleteFirewallRule={(idx) => handleDeleteRule('inbound', idx)}
          triggerUndo={(idx) => handleUndo('inbound', idx)}
          triggerReorder={(startIdx: number, endIdx: number) =>
            handleReorder('inbound', startIdx, endIdx)
          }
        />
      </div>
      <div className={classes.table}>
        <FirewallRuleTable
          category="outbound"
          policy={policy.outbound}
          disabled={disabled}
          handlePolicyChange={handlePolicyChange}
          triggerCloneFirewallRule={(idx: number) =>
            handleCloneRule('outbound', idx)
          }
          rulesWithStatus={outboundRules}
          openRuleDrawer={openRuleDrawer}
          triggerOpenRuleDrawerForEditing={(idx: number) =>
            openRuleDrawer('outbound', 'edit', idx)
          }
          triggerDeleteFirewallRule={(idx) => handleDeleteRule('outbound', idx)}
          triggerUndo={(idx) => handleUndo('outbound', idx)}
          triggerReorder={(startIdx: number, endIdx: number) =>
            handleReorder('outbound', startIdx, endIdx)
          }
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
      <ActionsPanel className={classes.actions}>
        <Button
          buttonType="secondary"
          disabled={!hasUnsavedChanges || disabled}
          onClick={() => setDiscardChangesModalOpen(true)}
        >
          Discard Changes
        </Button>
        <Button
          buttonType="primary"
          onClick={applyChanges}
          loading={submitting}
          disabled={!hasUnsavedChanges || disabled}
        >
          Save Changes
        </Button>
      </ActionsPanel>
      <DiscardChangesDialog
        isOpen={discardChangesModalOpen}
        handleClose={() => setDiscardChangesModalOpen(false)}
        handleDiscard={() => {
          setDiscardChangesModalOpen(false);
          setGeneralErrors(undefined);
          setPolicy({
            inbound: rules.inbound_policy,
            outbound: rules.outbound_policy,
          });
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
  (props) => {
    const { isOpen, handleClose, handleDiscard } = props;

    const actions = React.useCallback(
      () => (
        <ActionsPanel>
          <Button buttonType="secondary" onClick={handleDiscard}>
            Discard changes
          </Button>

          <Button buttonType="primary" onClick={handleClose}>
            Go back and review changes
          </Button>
        </ActionsPanel>
      ),
      [handleDiscard, handleClose]
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
