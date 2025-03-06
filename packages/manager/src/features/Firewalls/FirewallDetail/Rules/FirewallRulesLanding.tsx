import { Notice, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import { useBlocker, useLocation, useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
// eslint-disable-next-line no-restricted-imports
import { Prompt } from 'src/components/Prompt/Prompt';
import {
  useAllFirewallDevicesQuery,
  useUpdateFirewallRulesMutation,
} from 'src/queries/firewalls';
import { linodeQueries } from 'src/queries/linodes/linodes';
import { nodebalancerQueries } from 'src/queries/nodebalancers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { FirewallRuleDrawer } from './FirewallRuleDrawer';
import {
  hasModified as _hasModified,
  curriedFirewallRuleEditorReducer,
  editorStateToRules,
  initRuleEditorState,
  prepareRules,
  stripExtendedFields,
} from './firewallRuleEditor';
import { FirewallRuleTable } from './FirewallRuleTable';
import { parseFirewallRuleError } from './shared';

import type { FirewallRuleDrawerMode } from './FirewallRuleDrawer.types';
import type { Category } from './shared';
import type {
  FirewallPolicyType,
  FirewallRuleType,
  FirewallRules,
} from '@linode/api-v4/lib/firewalls';
import type { APIError } from '@linode/api-v4/lib/types';

interface Props {
  disabled: boolean;
  firewallID: number;
  rules: FirewallRules;
}

interface Drawer {
  category: Category;
  mode: FirewallRuleDrawerMode;
  ruleIdx?: number;
}

// TODO: Refactor this code - Becoming too large and hard to maintain

export const FirewallRulesLanding = React.memo((props: Props) => {
  const { disabled, firewallID, rules } = props;
  const { mutateAsync: updateFirewallRules } = useUpdateFirewallRulesMutation(
    firewallID
  );
  const { data: devices } = useAllFirewallDevicesQuery(firewallID);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

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
    category: 'inbound',
    mode: 'create',
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

  const openRuleDrawer = (
    category: Category,
    mode: FirewallRuleDrawerMode,
    idx?: number
  ) => {
    setRuleDrawer({
      category,
      mode,
      ruleIdx: idx,
    });
    navigate({
      params: { id: String(firewallID), ruleId: String(idx) },
      to:
        category === 'inbound' && mode === 'create'
          ? '/firewalls/$id/rules/add/inbound'
          : category === 'inbound' && mode === 'edit'
          ? `/firewalls/$id/rules/edit/inbound/$ruleId`
          : category === 'outbound' && mode === 'create'
          ? '/firewalls/$id/rules/add/outbound'
          : `/firewalls/$id/rules/edit/outbound/$ruleId`,
    });
  };

  const closeRuleDrawer = () => {
    setRuleDrawer({ ...ruleDrawer });
    navigate({
      params: { id: String(firewallID) },
      to: '/firewalls/$id/rules',
    });
  };

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
    dispatch({ rule, type: 'NEW_RULE' });
  };

  const handleCloneRule = (category: Category, idx: number) => {
    const dispatch = dispatchFromCategory(category);
    dispatch({ idx, type: 'CLONE_RULE' });
  };

  const handleReorder = (
    category: Category,
    startIdx: number,
    endIdx: number
  ) => {
    const dispatch = dispatchFromCategory(category);
    dispatch({ endIdx, startIdx, type: 'REORDER' });
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
      idx: ruleDrawer.ruleIdx,
      modifiedRule: rule,
      type: 'MODIFY_RULE',
    });
  };

  const handleDeleteRule = (category: Category, idx: number) => {
    const dispatch = dispatchFromCategory(category);
    dispatch({ idx, type: 'DELETE_RULE' });
  };

  const handleUndo = (category: Category, idx: number) => {
    const dispatch = dispatchFromCategory(category);

    dispatch({ idx, type: 'UNDO' });
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
      inbound_policy: policy.inbound,
      outbound: preparedRules.outbound.map(stripExtendedFields),
      outbound_policy: policy.outbound,
    };

    updateFirewallRules(finalRules)
      .then((_rules) => {
        setSubmitting(false);
        // Invalidate Firewalls assigned to NodeBalancers and Linodes.
        if (devices) {
          for (const device of devices) {
            if (device.entity.type === 'linode') {
              queryClient.invalidateQueries({
                queryKey: linodeQueries.linode(device.entity.id)._ctx.firewalls
                  .queryKey,
              });
            }
            if (device.entity.type === 'nodebalancer') {
              queryClient.invalidateQueries({
                queryKey: nodebalancerQueries.nodebalancer(device.entity.id)
                  ._ctx.firewalls.queryKey,
              });
            }
          }
        }

        // Reset editor state.
        inboundDispatch({ rules: _rules.inbound ?? [], type: 'RESET' });
        outboundDispatch({ rules: _rules.outbound ?? [], type: 'RESET' });
        enqueueSnackbar('Firewall rules successfully updated', {
          variant: 'success',
        });
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
            const { category, idx } = parsedError;

            const dispatch = dispatchFromCategory(category as Category);
            dispatch({
              error: parsedError,
              idx,
              type: 'SET_ERROR',
            });
          }
        }
        enqueueSnackbar('Failed to update Firewall rules', {
          variant: 'error',
        });
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

  const { proceed, reset, status } = useBlocker({
    enableBeforeUnload: hasUnsavedChanges,
    shouldBlockFn: ({ next }) => {
      // Only block if there are unsaved changes
      if (!hasUnsavedChanges) {
        return false;
      }

      // Don't block navigation to these specific routes, since they are part of the current form
      const isNavigatingToAllowedRoute =
        next.routeId === '/firewalls/$id/rules' ||
        next.routeId === '/firewalls/$id/rules/add/inbound' ||
        next.routeId === '/firewalls/$id/rules/add/outbound' ||
        next.routeId === '/firewalls/$id/rules/edit/inbound/$ruleId' ||
        next.routeId === '/firewalls/$id/rules/edit/outbound/$ruleId';

      return !isNavigatingToAllowedRoute;
    },
    withResolver: true,
  });

  // Create a combined handler for proceeding with navigation
  const handleProceedNavigation = React.useCallback(() => {
    if (status === 'blocked' && proceed) {
      proceed();
    }
  }, [status, proceed]);

  // Create a combined handler for canceling navigation
  const handleCancelNavigation = React.useCallback(() => {
    if (status === 'blocked' && reset) {
      reset();
    }
  }, [status, reset]);

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
      {/*
        This Prompt eventually can be removed once react-router is fully deprecated
        It is here only to preserve the behavior of non-Tanstack routes
      */}
      <Prompt confirmWhenLeaving={true} when={hasUnsavedChanges}>
        {({ handleCancel, handleConfirm, isModalOpen }) => (
          <ConfirmationDialog
            actions={() => (
              <ActionsPanel
                primaryButtonProps={{
                  label: 'Go back and review changes',
                  onClick: () => {
                    handleCancelNavigation();
                    handleCancel();
                  },
                }}
                secondaryButtonProps={{
                  buttonType: 'secondary',
                  color: 'error',
                  label: 'Leave and discard changes',
                  onClick: () => {
                    handleProceedNavigation();
                    handleConfirm();
                  },
                }}
              />
            )}
            onClose={() => {
              handleCancelNavigation();
              handleCancel();
            }}
            open={status === 'blocked' || isModalOpen}
            title="Discard Firewall changes?"
          >
            <Typography variant="subtitle1">
              The changes you made to this Firewall haven&rsquo;t been applied.
              If you navigate away from this page, your changes will be
              discarded.
            </Typography>
          </ConfirmationDialog>
        )}
      </Prompt>

      {disabled ? (
        <Notice
          text={
            "You don't have permissions to modify this Firewall. Please contact an account administrator for details."
          }
          important
          variant="error"
        />
      ) : null}
      {generalErrors?.length === 1 && (
        <Notice spacingTop={8} text={generalErrors[0].reason} variant="error" />
      )}
      <StyledDiv>
        <FirewallRuleTable
          handleCloneFirewallRule={(idx: number) =>
            handleCloneRule('inbound', idx)
          }
          handleOpenRuleDrawerForEditing={(idx: number) =>
            openRuleDrawer('inbound', 'edit', idx)
          }
          handleReorder={(startIdx: number, endIdx: number) =>
            handleReorder('inbound', startIdx, endIdx)
          }
          category="inbound"
          disabled={disabled}
          handleDeleteFirewallRule={(idx) => handleDeleteRule('inbound', idx)}
          handlePolicyChange={handlePolicyChange}
          handleUndo={(idx) => handleUndo('inbound', idx)}
          openRuleDrawer={openRuleDrawer}
          policy={policy.inbound}
          rulesWithStatus={inboundRules}
        />
      </StyledDiv>
      <StyledDiv>
        <FirewallRuleTable
          handleCloneFirewallRule={(idx: number) =>
            handleCloneRule('outbound', idx)
          }
          handleOpenRuleDrawerForEditing={(idx: number) =>
            openRuleDrawer('outbound', 'edit', idx)
          }
          handleReorder={(startIdx: number, endIdx: number) =>
            handleReorder('outbound', startIdx, endIdx)
          }
          category="outbound"
          disabled={disabled}
          handleDeleteFirewallRule={(idx) => handleDeleteRule('outbound', idx)}
          handlePolicyChange={handlePolicyChange}
          handleUndo={(idx) => handleUndo('outbound', idx)}
          openRuleDrawer={openRuleDrawer}
          policy={policy.outbound}
          rulesWithStatus={outboundRules}
        />
      </StyledDiv>
      <FirewallRuleDrawer
        isOpen={
          location.pathname.endsWith('add/inbound') ||
          location.pathname.endsWith('add/outbound') ||
          location.pathname.endsWith(`edit/inbound/${ruleDrawer.ruleIdx}`) ||
          location.pathname.endsWith(`edit/outbound/${ruleDrawer.ruleIdx}`)
        }
        category={ruleDrawer.category}
        mode={ruleDrawer.mode}
        onClose={closeRuleDrawer}
        onSubmit={ruleDrawer.mode === 'create' ? handleAddRule : handleEditRule}
        ruleToModify={ruleToModify}
      />
      <StyledActionsPanel
        primaryButtonProps={{
          disabled: !hasUnsavedChanges || disabled,
          label: 'Save Changes',
          loading: submitting,
          onClick: applyChanges,
        }}
        secondaryButtonProps={{
          disabled: !hasUnsavedChanges || disabled,
          label: 'Discard Changes',
          onClick: () => setDiscardChangesModalOpen(true),
        }}
      />
      <DiscardChangesDialog
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
        handleClose={() => setDiscardChangesModalOpen(false)}
        isOpen={discardChangesModalOpen}
      />
    </>
  );
});

const StyledActionsPanel = styled(ActionsPanel, {
  label: 'StyledActionsPanel',
})({
  float: 'right',
});

const StyledDiv = styled('div', { label: 'StyledDiv' })(({ theme }) => ({
  marginBottom: theme.spacing(4),
  marginTop: theme.spacing(2),
}));

interface DiscardChangesDialogProps {
  handleClose: () => void;
  handleDiscard: () => void;
  isOpen: boolean;
}

export const DiscardChangesDialog: React.FC<DiscardChangesDialogProps> = React.memo(
  (props) => {
    const { handleClose, handleDiscard, isOpen } = props;

    const actions = React.useCallback(
      () => (
        <ActionsPanel
          primaryButtonProps={{
            label: 'Go back and review changes',
            onClick: handleClose,
          }}
          secondaryButtonProps={{
            label: 'Discard changes',
            onClick: handleDiscard,
          }}
        />
      ),
      [handleDiscard, handleClose]
    );

    return (
      <ConfirmationDialog
        actions={actions}
        onClose={() => handleClose()}
        open={isOpen}
        title="Discard Firewall changes?"
      >
        <Typography variant="subtitle1">
          Are you sure you want to discard changes to this Firewall?
        </Typography>
      </ConfirmationDialog>
    );
  }
);
