import { useAllAccountUsersQuery } from '@linode/queries';
import { Autocomplete, Box, SelectedIcon, StyledListItem } from '@linode/ui';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';

export interface NotificationRecipientsProps {
  /**
   * Error text to display when the field has a validation error
   */
  error?: string;
  /**
   * Function to handle the blur event
   */
  onBlur?: () => void;
  /**
   * Function to handle the change of recipients
   */
  onChange: (value: string[]) => void;
  /**
   * Callback when API fails and there are no options available
   */
  onError?: () => void;
  /**
   * Selected recipients (array of usernames)
   */
  value: string[];
}

export const NotificationRecipients = React.memo(
  (props: NotificationRecipientsProps) => {
    const { error, onBlur, onChange, onError, value } = props;

    const flags = useFlags();

    const {
      data: accountUsers,
      isLoading: isLoadingAccountUsers,
      isError: isAccountUsersError,
    } = useAllAccountUsersQuery(true, {
      '+order': 'asc',
      '+order_by': 'username',
    });

    // Notify parent if API failed to load users
    React.useEffect(() => {
      if (isAccountUsersError && onError) {
        onError();
      }
    }, [isAccountUsersError, onError]);

    const options = React.useMemo(() => {
      return (
        accountUsers?.map((user) => ({
          ...user,
          label: user.username,
        })) || []
      );
    }, [accountUsers]);

    const selectedOptions = React.useMemo(() => {
      if (!value || !Array.isArray(value)) {
        return [];
      }
      return value
        .map((val) => {
          return options.find((opt) => opt.label === val);
        })
        .filter((opt) => opt !== undefined);
    }, [options, value]);

    // Maximum recipients selection limit is fetched from launchdarkly
    const maxRecipientsSelectionLimit =
      flags.aclpAlerting?.maxEmailChannelRecipients || 10;

    // Check if total number of options and selected options are greater than the limit, if yes then disable the Select All option
    const recipientsLimitReached = options.length > maxRecipientsSelectionLimit;

    const maxSelectionsReached =
      selectedOptions.length >= maxRecipientsSelectionLimit;

    return (
      <Autocomplete
        data-testid="recipients-select"
        disableSelectAll={recipientsLimitReached}
        errorText={
          error ?? (isAccountUsersError ? 'Failed to fetch the users.' : '')
        }
        getOptionLabel={(option) => option.label}
        helperText={
          !(error || isAccountUsersError)
            ? `Select up to ${maxRecipientsSelectionLimit} Recipients`
            : ''
        }
        isOptionEqualToValue={(option, value) => option.label === value.label}
        label="Recipients"
        limitTags={1}
        loading={isLoadingAccountUsers}
        multiple
        onBlur={onBlur}
        onChange={(_, selected, reason) => {
          if (reason === 'clear') {
            onChange([]);
            return;
          }

          onChange(selected.map((item) => item.label));
        }}
        options={options}
        placeholder="Select recipients"
        renderOption={(props, option) => {
          // After selecting resources up to the max resource selection limit, rest of the unselected options will be disabled if there are any
          const { key, ...rest } = props;
          const isRecipientSelected = selectedOptions?.some(
            (item) => item.label === option.label
          );

          const isSelectAllORDeslectAllOption =
            option.label === 'Select All ' || option.label === 'Deselect All ';

          const isMaxSelectionsReached =
            maxSelectionsReached &&
            !isRecipientSelected &&
            !isSelectAllORDeslectAllOption;

          const ListItem = isSelectAllORDeslectAllOption
            ? StyledListItem
            : 'li';

          return (
            <ListItem
              {...rest}
              aria-disabled={isMaxSelectionsReached}
              data-qa-option
              key={key}
            >
              <>
                <Box sx={{ flexGrow: 1 }}>{option.label}</Box>
                <SelectedIcon visible={isRecipientSelected || false} />
              </>
            </ListItem>
          );
        }}
        slotProps={{
          popper: {
            placement: 'bottom',
          },
        }}
        value={selectedOptions}
      />
    );
  }
);
