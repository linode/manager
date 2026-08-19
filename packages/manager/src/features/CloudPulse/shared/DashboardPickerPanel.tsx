import {
  BetaChip,
  Box,
  ChevronUpIcon,
  List,
  Paper,
  TextField,
  Typography,
} from '@linode/ui';
import SearchIcon from '@mui/icons-material/Search';
import useAutocomplete, {
  type AutocompleteGroupedOption,
} from '@mui/material/useAutocomplete';
import React, { useEffect, useRef, useState } from 'react';

import { StyledTriggerButton } from './DashboardPicker.styles';
import {
  closeTriggerButtonSx,
  panelSx,
  searchFieldContainerSx,
  StyledGroupHeader,
  StyledGroupLabel,
  StyledGroupSection,
  StyledListbox,
  StyledOptionItem,
  StyledOptionLabel,
} from './DashboardPickerPanel.styles';

import type { CloudPulseServiceType, Dashboard } from '@linode/api-v4';
import type { Theme } from '@linode/ui';
import type { AclpServices } from 'src/featureFlags';

export interface DashboardPickerPanelProps {
  /**
   * Feature-flag metadata by service type.
   */
  aclpServices?: Partial<AclpServices>;
  /**
   * Closes the picker panel.
   */
  handleClose: () => void;
  /**
   * Called when a dashboard option is selected.
   */
  onChange: (dashboard: Dashboard | null) => void;
  /**
   * Dashboard options available in the autocomplete list.
   */
  options: Dashboard[];
  /**
   * Map used to convert service type keys into display labels.
   */
  serviceTypeMap: Map<CloudPulseServiceType, string>;
  /**
   * When false, group headers are hidden (single service type context).
   */
  showServiceTypeLabel?: boolean;
  /**
   * Trigger text mirrored at the top of the open panel.
   */
  triggerLabel: string;
  /**
   * Typography sx function for the trigger label.
   */
  triggerTextSx: (
    theme: Theme,
    isOpen?: boolean
  ) => {
    color: string;
    fontWeight: string;
  };
  /**
   * Currently selected dashboard value.
   */
  value: Dashboard | null;
}

export const DashboardPickerPanel = ({
  aclpServices,
  handleClose,
  onChange,
  options,
  serviceTypeMap,
  showServiceTypeLabel = true,
  triggerLabel,
  triggerTextSx,
  value,
}: DashboardPickerPanelProps) => {
  const [inputValue, setInputValue] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { getInputProps, getListboxProps, getOptionProps, groupedOptions } =
    useAutocomplete<Dashboard, false, false, false>({
      getOptionLabel: (option) => option.label,
      groupBy: (option) => option.service_type,
      inputValue,
      isOptionEqualToValue: (option, val) => option.id === val.id,
      onChange: (_, newValue, reason) => {
        // MUI treats emptying the search text as "clear selection" for
        // single-select autocompletes, firing onChange(null, 'clear').
        // Ignore that reason so deleting the last character doesn't
        // deselect the dashboard and close the panel.
        if (reason === 'clear') {
          return;
        }
        onChange(newValue);
        handleClose();
      },
      onInputChange: (_, newValue, reason) => {
        if (reason === 'input' || reason === 'clear') {
          setInputValue(newValue);
        }
      },
      open: true,
      options,
      value,
    });

  const { ref: inputRefFromHook, ...restInputProps } = getInputProps();

  const mergeInputRef = (el: HTMLInputElement | null) => {
    searchInputRef.current = el;
    if (typeof inputRefFromHook === 'function') {
      (inputRefFromHook as React.RefCallback<HTMLInputElement>)(el);
    } else if (inputRefFromHook) {
      (
        inputRefFromHook as React.MutableRefObject<HTMLInputElement | null>
      ).current = el;
    }
  };

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  return (
    <Paper
      aria-label="Dashboard picker"
      data-pendo-id="cloudpulse-dashboard-picker-panel"
      role="dialog"
      sx={panelSx}
    >
      <Box sx={{ width: '100%' }}>
        <StyledTriggerButton
          data-pendo-id="cloudpulse-dashboard-picker-close"
          onClick={handleClose}
          sx={(theme) => ({
            ...closeTriggerButtonSx(theme),
            '& .dashboard-picker-trigger-icon': {
              color: theme.tokens.component.LinkSelect.Filled.Icon,
            },
          })}
          type="button"
        >
          <Typography
            className="dashboard-picker-trigger-text"
            sx={(theme) => triggerTextSx(theme, true)}
            variant="h2"
          >
            {triggerLabel}
          </Typography>
          <ChevronUpIcon className="dashboard-picker-trigger-icon" />
        </StyledTriggerButton>

        <Box
          data-pendo-id="cloudpulse-dashboard-picker-search"
          sx={searchFieldContainerSx}
        >
          <TextField
            hideLabel
            inputRef={mergeInputRef}
            label=""
            noMarginTop
            placeholder="Search"
            slotProps={{
              htmlInput: {
                ...restInputProps,
                'data-pendo-id': 'cloudpulse-dashboard-picker-search',
              },
              input: {
                startAdornment: (
                  <SearchIcon
                    fontSize="small"
                    sx={(theme) => ({
                      color: theme.tokens.component.Search.Default.SearchIcon,
                      mr: 1,
                    })}
                  />
                ),
              },
            }}
            sx={(theme) => ({
              backgroundColor: theme.tokens.component.Search.Default.Background,
              borderColor: theme.tokens.component.Search.Default.Border,
              color: theme.tokens.component.Search.Default.Text,
            })}
          />
        </Box>

        <StyledListbox {...getListboxProps()}>
          {(groupedOptions as AutocompleteGroupedOption<Dashboard>[]).map(
            (group) => (
              <StyledGroupSection component="li" key={group.key}>
                {showServiceTypeLabel && (
                  <StyledGroupHeader>
                    <StyledGroupLabel>
                      {serviceTypeMap.get(
                        group.group as CloudPulseServiceType
                      ) ?? group.group}
                    </StyledGroupLabel>
                    {aclpServices?.[group.group as CloudPulseServiceType]
                      ?.metrics?.beta && <BetaChip />}
                  </StyledGroupHeader>
                )}
                <List disablePadding>
                  {group.options.map((option, idx) => (
                    <StyledOptionItem
                      data-pendo-id={`cloudpulse-dashboard-picker-option-${option.id}`}
                      {...getOptionProps({
                        index: group.index + idx,
                        option,
                      })}
                      key={option.id}
                    >
                      <StyledOptionLabel
                        data-pendo-id={option.label}
                        variant="body1"
                      >
                        {option.label}
                      </StyledOptionLabel>
                    </StyledOptionItem>
                  ))}
                </List>
              </StyledGroupSection>
            )
          )}
          {groupedOptions.length === 0 && (
            <Box
              sx={(theme) => ({
                px: 1.5,
                py: 1,
                [theme.breakpoints.down('sm')]: {
                  px: 1,
                  py: 0.75,
                },
              })}
            >
              <Typography
                sx={(theme) => ({ color: theme.palette.text.secondary })}
                variant="body2"
              >
                No dashboards found
              </Typography>
            </Box>
          )}
        </StyledListbox>
      </Box>
    </Paper>
  );
};
