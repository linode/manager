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
  defaultValue?: GroupByOption[];
  message?: string;
  onApply: (value: GroupByOption[]) => void;
  onCancel: () => void;
  open?: boolean;
  options: GroupByOption[];
  serviceType: CloudPulseServiceType;
  subtitle?: string;
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
      defaultValue?.slice(
        0,
        Math.min(defaultValue.length ?? 0, groupBySelectionLimit)
      )
    );
    const previousValueRef = React.useRef<GroupByOption[]>(defaultValue);

    const handleApply = () => {
      previousValueRef.current = selectedValue;
      onApply(selectedValue);
    };

    React.useEffect(() => {
      const value = defaultValue?.slice(
        0,
        Math.min(defaultValue.length ?? 0, groupBySelectionLimit)
      );
      onApply(value);
      setSelectedValue(value);
    }, [serviceType]);
    const handleClose = () => {
      setSelectedValue(previousValueRef.current);
      onCancel();
    };

    return (
      <Drawer onClose={(_) => handleClose()} open={open} title={title}>
        <Stack gap={4}>
          <Typography
            component="p"
            sx={(theme) => ({ marginTop: -1, font: theme.font.normal })}
            variant="h2"
          >
            {subtitle}
          </Typography>
          <Typography
            sx={(theme) => ({ font: theme.font.normal })}
            variant="h2"
          >
            {message}
          </Typography>
          <Autocomplete
            data-testid="dimension-select"
            helperText={`You can select upto ${groupBySelectionLimit} dimensions.`}
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            label="Select Dimensions"
            multiple
            onChange={(_event, value) => {
              setSelectedValue(value);
            }}
            options={options}
            placeholder="Select Dimnensions"
            renderOption={(props, option) => {
              const { key, ...rest } = props;
              const isSelectAllORDeslectAllOption =
                option.label === 'Select All ' ||
                option.label === 'Deselect All ';
              const isSelected = props['aria-selected'] === true;
              const ListItem = isSelectAllORDeslectAllOption
                ? StyledListItem
                : 'li';
              const isDisabled =
                selectedValue.length >= groupBySelectionLimit && !isSelected;
              const isHidden =
                isSelectAllORDeslectAllOption &&
                options.length > groupBySelectionLimit;

              if (isHidden) {
                return <NullComponent />;
              }
              return (
                <ListItem key={key} {...rest} aria-disabled={isDisabled}>
                  <Box sx={{ flexGrow: 1 }}>{option.label}</Box>
                  <SelectedIcon visible={isSelected} />
                </ListItem>
              );
            }}
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
