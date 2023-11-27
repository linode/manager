import Hidden from '@mui/material/Hidden';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Box } from 'src/components/Box';
import { TextTooltip } from 'src/components/TextTooltip';

import { matchFieldMap } from './Routes/utils';
import {
  StyledDragIndicator,
  StyledRuleBox,
  sxItemSpacing,
} from './RulesTable.styles';

import type { Rule } from '@linode/api-v4';
import type { Theme } from '@mui/material';

const screenReaderMessage =
  'Some screen readers may require you to enter focus mode to interact with Loadbalancer rule list items. In focus mode, press spacebar to begin a drag or tab to access item actions.';

interface RuleRowProps {
  index: number;
  onDeleteRule: () => void;
  onEditRule: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  rule: Rule;
  totalRules: number;
}

const getExecutionLabel = (index: number, total: number) => {
  if (index === 0) {
    return 'First';
  } else if (index === total - 1) {
    return 'Last';
  }
  return index + 1;
};

export const RuleRow = (props: RuleRowProps) => {
  const {
    index,
    onDeleteRule,
    onEditRule,
    onMoveDown,
    onMoveUp,
    rule,
    totalRules,
  } = props;

  const xsDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  return (
    <Draggable draggableId={String(index)} index={index} key={index}>
      {(provided) => (
        <li
          aria-label={`Rule ${index}`}
          aria-roledescription={screenReaderMessage}
          aria-selected={false}
          ref={provided.innerRef}
          role="option"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <StyledRuleBox
            key={index}
            sx={(theme) => ({ backgroundColor: theme.bg.bgPaper })}
          >
            <Box
              sx={{
                ...sxItemSpacing,
                overflowWrap: 'break-word',
                paddingLeft: '8px',
                width: xsDown ? '50%' : '15%',
              }}
            >
              <StyledDragIndicator aria-label="Drag indicator icon" />
              {getExecutionLabel(index, totalRules)}
            </Box>
            <Box
              sx={{
                ...sxItemSpacing,
                width: xsDown ? '45%' : '20%',
              }}
              aria-label={`Match value: ${rule.match_condition.match_value}`}
            >
              {rule.match_condition.match_value}
            </Box>

            <Hidden smDown>
              <Box
                aria-label={`Match Field: ${
                  matchFieldMap[rule.match_condition.match_field]
                }`}
                sx={{ ...sxItemSpacing, width: '20%' }}
              >
                {matchFieldMap[rule.match_condition.match_field]}
              </Box>
            </Hidden>
            <Hidden smDown>
              <Box
                sx={{
                  ...sxItemSpacing,
                  overflowWrap: 'break-word',
                  width: '20%',
                }}
                aria-label={`Service Targets: ${rule.service_targets.length}`}
              >
                {rule.service_targets.length > 0 ? (
                  <TextTooltip
                    tooltipText={
                      <>
                        {rule.service_targets.map(({ id, label }) => (
                          <div key={label}>
                            {label}:{id}
                          </div>
                        ))}
                      </>
                    }
                    displayText={String(rule.service_targets.length)}
                  />
                ) : (
                  'None'
                )}
              </Box>
            </Hidden>
            <Hidden smDown>
              <Box
                aria-label={`Session Stickiness: ${
                  rule.match_condition.session_stickiness_cookie &&
                  rule.match_condition.session_stickiness_ttl
                    ? 'Yes'
                    : 'No'
                }`}
                sx={{
                  ...sxItemSpacing,
                  overflowWrap: 'break-word',
                  width: '20%',
                }}
              >
                {rule.match_condition.session_stickiness_cookie ||
                rule.match_condition.session_stickiness_ttl
                  ? 'Yes'
                  : 'No'}
              </Box>
            </Hidden>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row-reverse',
                width: '5%',
              }}
              aria-label={`Action Menu`}
            >
              <ActionMenu
                actionsList={[
                  {
                    onClick: onEditRule,
                    title: 'Edit',
                  },
                  {
                    disabled: index === 0,
                    onClick: onMoveUp,
                    title: 'Move Up',
                  },
                  {
                    disabled: index === totalRules - 1,
                    onClick: onMoveDown,
                    title: 'Move Down',
                  },
                  {
                    onClick: onDeleteRule,
                    title: 'Delete',
                  },
                ]}
                ariaLabel={`Action Menu for Rule ${index}`}
              />
            </Box>
          </StyledRuleBox>
        </li>
      )}
    </Draggable>
  );
};
