import { styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import React from 'react';

import EdgeServer from 'src/assets/icons/entityIcons/edge-server.svg';
import { Box } from 'src/components/Box';
import { Flag } from 'src/components/Flag';
import { Link } from 'src/components/Link';
import { Tooltip } from 'src/components/Tooltip';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { useFlags } from 'src/hooks/useFlags';

import {
  SelectedIcon,
  StyledFlagContainer,
  StyledListItem,
} from './RegionSelect.styles';
import { RegionSelectOption } from './RegionSelect.types';

import type { ListItemComponentsPropsOverrides } from '@mui/material/ListItem';

type Props = {
  option: RegionSelectOption;
  props: React.HTMLAttributes<HTMLLIElement>;
  selected: boolean;
};

export const RegionOption = ({ option, props, selected }: Props) => {
  const flags = useFlags();
  const isDisabledMenuItem =
    Boolean(flags.dcGetWell) && Boolean(option.unavailable);

  return (
    <Tooltip
      PopperProps={{
        sx: { '& .MuiTooltip-tooltip': { minWidth: 215 } },
      }}
      title={
        isDisabledMenuItem ? (
          <>
            There may be limited capacity in this region.{' '}
            <Link to="https://www.linode.com/global-infrastructure/availability">
              Learn more
            </Link>
            .
          </>
        ) : (
          ''
        )
      }
      disableFocusListener={!isDisabledMenuItem}
      disableHoverListener={!isDisabledMenuItem}
      disableTouchListener={!isDisabledMenuItem}
      enterDelay={200}
      enterNextDelay={200}
      enterTouchDelay={200}
      key={option.value}
    >
      <StyledListItem
        {...props}
        className={
          isDisabledMenuItem
            ? `${props.className} Mui-disabled`
            : props.className
        }
        componentsProps={{
          root: {
            'data-qa-option': option.value,
            'data-testid': option.value,
          } as ListItemComponentsPropsOverrides,
        }}
        onClick={(e) =>
          isDisabledMenuItem
            ? e.preventDefault()
            : props.onClick
            ? props.onClick(e)
            : null
        }
        aria-disabled={undefined}
      >
        <>
          <Box alignItems="center" display="flex" flexGrow={1}>
            <StyledFlagContainer>
              <Flag country={option.data.country} />
            </StyledFlagContainer>
            {option.label}
            {isDisabledMenuItem && (
              <Box sx={visuallyHidden}>
                Disabled option - There may be limited capacity in this region.
                Learn more at
                https://www.linode.com/global-infrastructure/availability.
              </Box>
            )}
          </Box>
          {option.site_type === 'edge' && (
            <TooltipIcon
              icon={<EdgeServer />}
              status="other"
              sxTooltipIcon={sxIcon}
              text="This region is an edge site."
            />
          )}
        </>
      </StyledListItem>
    </Tooltip>
  );
};

const sxIcon = {
  '& svg': {
    height: 21,
    width: 24,
  },
  '&:hover': {
    color: 'inherit',
  },
  color: 'inherit',
  padding: 0,
};

// const StyledEndAdornment = styled(Box, { label: 'StyledEndAdornment' })(
//   ({ theme }) => ({
//     '& svg': {
//       height: 21,
//       width: 24,
//     },
//     '&:hover': {
//       color: 'inherit',
//     },
//     color: 'inherit',
//     display: 'flex',
//     marginLeft: 4,
//   })
// );
