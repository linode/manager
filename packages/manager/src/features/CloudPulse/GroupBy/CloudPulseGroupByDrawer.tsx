import {
  Autocomplete,
  Box,
  Button,
  Drawer,
  SelectedIcon,
  Stack,
  StyledListItem,
  Typography,
} from '@linode/ui';
import * as React from 'react';

import NullComponent from 'src/components/NullComponent';

import type { CloudPulseServiceType } from '@linode/api-v4';

export interface GroupByDrawerProps {
  /**
   * Default selected group by options
   */
  defaultValue?: GroupByOption[];
  /**
   * Optional message to display in the drawer
   */
  message?: string;
  /**
   * Callback function triggered when apply button is clicked
   */
  onApply: (value: GroupByOption[]) => void;
  /**
   * Callback function triggered when cancel button is clicked
   */
  onCancel: () => void;
  /**
   * Controls whether the drawer is open
   */
  open?: boolean;
  /**
   * Available group by options to select from
   */
  options: GroupByOption[];
  /**
   * Type of cloud service being monitored
   */
  serviceType: CloudPulseServiceType;
  /**
   * Optional subtitle for the drawer
   */
  subtitle?: string;
  /**
   * Title for the drawer
   */
  title: string;
}

export interface GroupByOption {
  label: string;
  value: string;
}

const groupBySelectionLimit = 3;
export const CloudPulseGroupByDrawer = React.memo(
  (props: GroupByDrawerProps) => {
    const {
      open,
      title,
      subtitle,
      message,
      options,
      defaultValue = [],
      onApply,
      onCancel,
      serviceType,
    } = props;

    const [selectedValue, setSelectedValue] = React.useState<GroupByOption[]>(
      defaultValue.slice(
        0,
        Math.min(defaultValue.length, groupBySelectionLimit)
      )
    );
    const previousValueRef = React.useRef<GroupByOption[]>(
      defaultValue.slice(
        0,
        Math.min(defaultValue.length, groupBySelectionLimit)
      )
    );

    const handleApply = () => {
      previousValueRef.current = selectedValue;
      onApply(selectedValue);
    };

    React.useEffect(() => {
      const value = defaultValue.slice(
        0,
        Math.min(defaultValue.length, groupBySelectionLimit)
      );
      onApply(value);
      setSelectedValue(value);
    }, [serviceType]);
    const handleClose = () => {
      setSelectedValue(previousValueRef.current);
      onCancel();
    };

    const renderOptions = (
      props: React.HTMLAttributes<HTMLLIElement> & {
        key: string;
      },
      option: GroupByOption
    ) => {
      const { key, ...rest } = props;
      const isSelectAllORDeselectAllOption =
        option.label === 'Select All ' || option.label === 'Deselect All ';
      const isSelected = props['aria-selected'] === true;
      const ListItem = isSelectAllORDeselectAllOption ? StyledListItem : 'li';
      const isDisabled =
        selectedValue.length >= groupBySelectionLimit && !isSelected;
      const isHidden =
        isSelectAllORDeselectAllOption &&
        options.length > groupBySelectionLimit;

      if (isHidden) {
        return <NullComponent />;
      }
      return (
        <ListItem
          key={key}
          {...rest}
          aria-disabled={!isSelectAllORDeselectAllOption && isDisabled}
        >
          <Box sx={{ flexGrow: 1 }}>{option.label}</Box>
          <SelectedIcon visible={isSelected} />
        </ListItem>
      );
    };

    return (
      <Drawer onClose={(_) => handleClose()} open={open} title={title}>
        <Stack gap={4}>
          <Typography
            component="p"
            sx={(theme) => ({ marginTop: -1, font: theme.font.normal })}
            variant="h3"
          >
            {subtitle}
          </Typography>
          <Typography sx={(theme) => ({ font: theme.font.normal })}>
            {message}
          </Typography>
          <Autocomplete
            data-testid="dimension-select"
            helperText={
              options.length > 3
                ? `You can select up to ${groupBySelectionLimit} dimensions.`
                : undefined
            }
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            label="Select Dimensions"
            multiple
            onChange={(_event, value) => {
              setSelectedValue(value);
            }}
            options={options}
            placeholder="Select Dimensions"
            renderOption={renderOptions}
            value={selectedValue}
          />

          <Stack direction="row" gap={2} justifyContent="flex-end">
            <Button
              buttonType="outlined"
              data-testid="cancel"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              buttonType="primary"
              color="primary"
              data-testid="apply"
              onClick={handleApply}
            >
              Apply
            </Button>
          </Stack>
        </Stack>
      </Drawer>
    );
  }
);
