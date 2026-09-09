import {
  Badge,
  FormError,
  FormField,
  Icon,
  TagInput,
  Tooltip,
} from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useAccountUsersSearch } from '../../../hooks/useAccountUsersSearch';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { useDelegationRole } from '../../../hooks/useDelegationRole';
import { usePermissions } from '../../../hooks/usePermissions';
import { useTagInputCloseHandler } from '../../../hooks/useTagInputCloseHandler';
import { Box } from '../../../Shared/Box/Box';
import { ERROR_STATE_TITLE } from '../../../Shared/constants';
import {
  DUPLICATED_SSO_USER,
  IAM_SSO_ENFORCE_PENDO_IDS,
} from '../../constants';

import type { EnforcementSettingsFormValues } from './EnforcementSettings';
import type { TagInputElement } from '@akamai/cds-components';

interface Props {
  includedUsers: string[] | undefined;
}

export const IncludedUsersPanel = ({ includedUsers }: Props) => {
  const isSmUp = useBreakpoint('up', 'sm');
  const { control, getValues, trigger, watch } =
    useFormContext<EnforcementSettingsFormValues>();

  // Watch SSO enabled/enforced states to conditionally update badge status`
  const isSSOEnabled = watch('ssoEnabled');
  const isSSOEnforced = watch('ssoEnforced');
  const excludedUsers = watch('excludedUsers');

  // Filter out delegate users from the included/excluded users if user is a child user
  const { isChildUserType } = useDelegationRole();

  // TODO:  CDS - UIE-11408 - replace after tag input supports passing in options directly
  // instead of using ref to set preselected options
  const tagInputNodeRef = React.useRef<null | TagInputElement<string>>(null);
  const tagInputRef = React.useCallback(
    (node: null | TagInputElement<string>) => {
      tagInputNodeRef.current = node;
      if (node && includedUsers && includedUsers.length > 0) {
        node.setValue(includedUsers);
      }
    },
    [includedUsers]
  );

  // TODO - CDS - UIE-11498 - replace after tag input handles it internally
  useTagInputCloseHandler(tagInputNodeRef);

  // TODO - CDS - UIE-11498 - replace after tag input handles it internally
  // When excludedUsers changes, we must: (1) update validFn on the Lit element directly so it
  // uses the latest excludedUsers, and (2) call setValue() instead of bare requestUpdate().
  // requestUpdate() alone does not change _tags, so Lit's updated() hook never fires _updateValidity(),
  // which means the element-level `invalid` attribute is never cleared. setValue() re-sets _tags,
  // triggering the full update lifecycle: _renderTag (tag highlighting) + _updateValidity (invalid attr).
  // Replace with a reactive @property({ attribute: false }) on validFn in TagInputElement
  // so that passing a new function reference from React is sufficient to re-evaluate.
  React.useLayoutEffect(() => {
    const node = tagInputNodeRef.current;
    if (node) {
      node.validFn = (item: string) => !excludedUsers.includes(item);
      try {
        node.setValue(getValues('includedUsers'));
      } catch {
        // ElementInternals.setFormValue is not supported in jsdom (test environment).
        // Fall back to requestUpdate() which re-renders tags via _renderTag.
        node.requestUpdate();
      }
    }
  }, [excludedUsers, getValues]);

  const { data: permissions } = usePermissions('account', [
    'view_user',
    'update_idp_config_user_includes',
  ]);
  const [usernameInput, setUsernameInput] = React.useState<string>('');

  const {
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isPendingSearch,
    users,
  } = useAccountUsersSearch({
    enabled: permissions?.view_user,
    extraFilter: isChildUserType ? { user_type: 'child' } : undefined,
    search: usernameInput,
  });

  const isLoadingUsers =
    isPendingSearch ||
    isLoading ||
    isFetchingNextPage ||
    (isFetching && users.length === 0);

  const userOptions = React.useMemo(() => {
    return users.map((user) => user.username);
  }, [users]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const tagInputValidFn = (item: string) => !excludedUsers.includes(item);

  return (
    <>
      <Box direction="row" spacing={Spacing.S12}>
        <h2
          style={{
            marginTop: Spacing.S0,
            marginBottom: Spacing.S12,
            font: Typography.Heading.S,
          }}
        >
          SSO-Required Users
        </h2>
        <Badge color={isSSOEnabled && !isSSOEnforced ? 'green' : 'neutral'}>
          {isSSOEnabled && !isSSOEnforced ? 'Active' : 'Inactive'}
        </Badge>
      </Box>
      <p
        style={{
          marginTop: Spacing.S0,
          marginBottom: Spacing.S12,
        }}
      >
        Choose specific users to log in with SSO only. This could be to test the
        SSO-login process or other administrative reasons you may have. This
        list is active only while SSO is enabled and not enforced for the rest
        of the account. It has no effect once SSO is enforced globally. Users on
        the SSO-required list will have SSO enforced with the rest of the
        account.
      </p>
      <Controller
        control={control}
        name="includedUsers"
        render={({ field, fieldState }) => (
          <FormField
            error={Boolean(fieldState.error?.message)}
            labelPosition="top"
            style={{ padding: Spacing.S0 }}
          >
            <Tooltip
              disabled={permissions?.update_idp_config_user_includes}
              style={{ display: 'flex', gap: Spacing.S8 }}
              tooltipPlacement="bottom"
              tooltipText="You do not have permissions to update included users."
            >
              <TagInput
                data-pendo-id={IAM_SSO_ENFORCE_PENDO_IDS.includedUsers}
                disabled={!permissions?.update_idp_config_user_includes}
                filterFn={() => true}
                isError={Boolean(error)}
                isLoading={isLoadingUsers}
                items={userOptions}
                loadingErrorLabel={error?.[0]?.reason || ERROR_STATE_TITLE}
                onChange={(e) => {
                  field.onChange(e.detail);
                  trigger(['includedUsers', 'excludedUsers']);
                }}
                onLoadMore={handleLoadMore}
                onSearchChange={(e) => setUsernameInput(e.detail)}
                placeholder="Search by name or email or select from the list"
                ref={tagInputRef}
                restricted
                style={{
                  width: isSmUp ? 560 : '100%',
                  boxSizing: 'border-box',
                }}
                validFn={tagInputValidFn}
              />
              {!permissions?.update_idp_config_user_includes && (
                <Icon icon="info-outline" size="m" />
              )}
            </Tooltip>
            <FormError slot="error" style={{ width: isSmUp ? 560 : '100%' }}>
              {fieldState.error?.message}
            </FormError>
          </FormField>
        )}
        rules={{
          validate: (value) => {
            const excludedUsers = getValues('excludedUsers');
            const overlap = value.filter((user) =>
              excludedUsers.includes(user)
            );
            return overlap.length === 0 || DUPLICATED_SSO_USER;
          },
        }}
      />
    </>
  );
};
