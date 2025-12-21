import { useAccountUsersInfiniteQuery } from '@linode/queries';
import { Autocomplete, Box, SelectedIcon, StyledListItem } from '@linode/ui';
import { useDebouncedValue } from '@linode/utilities';
import React, { useState } from 'react';

import { useFlags } from 'src/hooks/useFlags';

import type { User } from '@linode/api-v4';

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
   * Selected recipients (array of usernames)
   */
  value: string[];
}

export const NotificationRecipients = React.memo(
  (props: NotificationRecipientsProps) => {
    const { error, onBlur, onChange, value } = props;

    const [usernameInput, setUsernameInput] = useState<string>('');
    const debouncedUsernameInput = useDebouncedValue(usernameInput);

    const flags = useFlags();

    // Filter the users by the debounced username input
    const userSearchFilter = debouncedUsernameInput
      ? {
          ['+or']: [{ username: { ['+contains']: debouncedUsernameInput } }],
        }
      : undefined;

    const {
      data: accountUsers,
      fetchNextPage,
      hasNextPage,
      isFetching: isFetchingAccountUsers,
      isLoading: isLoadingAccountUsers,
    } = useAccountUsersInfiniteQuery({
      ...userSearchFilter,
      '+order': 'asc',
      '+order_by': 'username',
    });

    const options = React.useMemo(() => {
      const users = accountUsers?.pages.flatMap((page) => page.data);
      return (
        users?.map((user: User) => ({
          label: user.username,
          value: user.username,
        })) || []
      );
    }, [accountUsers]);

    const selectedOptions = React.useMemo(() => {
      if (!value || !Array.isArray(value)) {
        return [];
      }
      return value.map((val) => {
        const match = options.find((opt) => opt.value === val);
        return match ?? { label: val, value: val };
      });
    }, [options, value]);

    // Handle the scroll event to load more users when the user scrolls to the bottom of the list
    const handleScroll = (event: React.SyntheticEvent) => {
      const listboxNode = event.currentTarget;
      const isAtBottom =
        Math.abs(
          listboxNode.scrollHeight -
            listboxNode.clientHeight -
            listboxNode.scrollTop
        ) < 1;

      if (isAtBottom && hasNextPage) {
        fetchNextPage();
      }
    };

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
        disableSelectAll={
          recipientsLimitReached || debouncedUsernameInput !== ''
        }
        errorText={error}
        getOptionLabel={(option) => option.label}
        helperText={
          !error ? `Select up to ${maxRecipientsSelectionLimit} Recipients` : ''
        }
        inputValue={usernameInput}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        label="Recipients"
        limitTags={1}
        loading={isLoadingAccountUsers || isFetchingAccountUsers}
        multiple
        onBlur={onBlur}
        onChange={(_, selected, reason) => {
          if (reason === 'clear') {
            onChange([]);
            return;
          }

          onChange(selected.map((item) => item.value));
          setUsernameInput('');
        }}
        onInputChange={(_, value, reason) => {
          // Only update for actual typing; ignore MUI reset calls
          if (reason === 'input') {
            setUsernameInput(value);
          }
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
          listbox: {
            onScroll: handleScroll,
          },
          popper: {
            placement: 'bottom',
          },
        }}
        value={selectedOptions}
      />
    );
  }
);
