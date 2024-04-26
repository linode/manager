import { AFFINITY_TYPES, PlacementGroup } from '@linode/api-v4';
import { visuallyHidden } from '@mui/utils';
import React from 'react';

import { Box } from 'src/components/Box';
import { Stack } from 'src/components/Stack';
import { Tooltip } from 'src/components/Tooltip';
import { PLACEMENT_GROUP_HAS_NO_CAPACITY } from 'src/features/PlacementGroups/constants';

import {
  SelectedIcon,
  StyledListItem,
} from '../RegionSelect/RegionSelect.styles';

import type { ListItemComponentsPropsOverrides } from '@mui/material/ListItem';

interface PlacementGroupSelectOptionProps {
  disabled?: boolean;
  label: string;
  props: React.HTMLAttributes<HTMLLIElement>;
  selected?: boolean;
  value: PlacementGroup;
}

export const PlacementGroupSelectOption = ({
  disabled,
  label,
  props,
  selected,
  value,
}: PlacementGroupSelectOptionProps) => {
  return (
    <Tooltip
      PopperProps={{
        sx: { '& .MuiTooltip-tooltip': { minWidth: 215 } },
      }}
      disableFocusListener={!disabled}
      disableHoverListener={!disabled}
      disableTouchListener={!disabled}
      enterDelay={200}
      enterNextDelay={200}
      enterTouchDelay={200}
      key={value.id}
      title={disabled ? PLACEMENT_GROUP_HAS_NO_CAPACITY : ''}
    >
      <StyledListItem
        {...props}
        className={
          disabled ? `${props.className} Mui-disabled` : props.className
        }
        componentsProps={{
          root: {
            'data-qa-option': value.label,
            'data-testid': `pg-option-${value.id}`,
          } as ListItemComponentsPropsOverrides,
        }}
        onClick={(e) =>
          disabled
            ? e.preventDefault()
            : props.onClick
            ? props.onClick(e)
            : null
        }
        aria-disabled={undefined}
      >
        <Box alignItems="center" display="flex" flexGrow={1}>
          <Stack alignItems="center" direction="row" flexGrow={1} gap={2}>
            <Stack>{label}</Stack>
            <Stack flexGrow={1} />
            <Stack
              sx={{
                position: 'relative',
                right: selected ? 14 : 34,
              }}
            >
              ({AFFINITY_TYPES[value.affinity_type]})
            </Stack>
          </Stack>
          {disabled && (
            <Box
              sx={visuallyHidden}
            >{`Option disabled: ${PLACEMENT_GROUP_HAS_NO_CAPACITY}`}</Box>
          )}
        </Box>
        {selected && <SelectedIcon visible={selected} />}
      </StyledListItem>
    </Tooltip>
  );
};
