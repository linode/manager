import { Hidden } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from 'react-beautiful-dnd';

import DragIndicator from 'src/assets/icons/drag-indicator.svg';
import { ActionMenu } from 'src/components/ActionMenu';
import { Box } from 'src/components/Box';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { Tooltip } from 'src/components/Tooltip';
import { RuleStatus } from 'src/features/Firewalls/FirewallDetail/Rules/firewallRuleEditor';
import { isPropValid } from 'src/utilities/isPropValid';

import type { MatchField, Route } from '@linode/api-v4';

interface Props {
  rules: Route['rules'];
}

interface StyledRuleBoxProps {
  originalIndex: number;
  ruleId: number;
  status: RuleStatus;
}

const matchFieldMap: Record<MatchField, string> = {
  header: 'HTTP Header',
  host: 'Host',
  method: 'HTTP Method',
  path_prefix: 'Path',
  query: 'Query String',
};

export const StyledDragIndicator = styled(DragIndicator, {
  label: 'StyledDragIndicator',
})(({ theme }) => ({
  color: theme.color.grey8,
  marginRight: theme.spacing(1.5),
  position: 'relative',
  top: 2,
}));

export const StyledUl = styled('ul', { label: 'StyledUl' })(({ theme }) => ({
  backgroundColor: theme.color.border3,
  listStyle: 'none',
  margin: 0,
  paddingLeft: 0,
  width: '100%',
}));

export const sxBox = {
  alignItems: 'center',
  display: 'flex',
  width: '100%',
};

export const StyledInnerBox = styled(Box, { label: 'StyledInnerBox' })(
  ({ theme }) => ({
    backgroundColor: theme.bg.tableHeader,
    color: theme.textColors.tableHeader,
    fontSize: '.875rem',
    fontWeight: 'bold',
    height: '46px',
  })
);

export const StyledRuleBox = styled(Box, {
  label: 'StyledRuleBox',
  shouldForwardProp: (prop) => isPropValid(['originalIndex', 'ruleId'], prop),
})<StyledRuleBoxProps>(({ originalIndex, ruleId, status, theme }) => ({
  borderBottom: `1px solid ${theme.borderColors.borderTable}`,
  color: theme.textColors.tableStatic,
  fontSize: '0.875rem',
  margin: 0,
  ...sxBox,

  // Conditional styles
  // Highlight the row if it's been modified or reordered. ID is the current index,
  // so if it doesn't match the original index we know that the rule has been moved.
  ...(status === 'PENDING_DELETION'
    ? {
        '& td': { color: '#D2D3D4' },
        backgroundColor: 'rgba(247, 247, 247, 0.25)',
      }
    : {}),
  ...(status === 'MODIFIED' || status === 'NEW' || originalIndex !== ruleId
    ? { backgroundColor: theme.bg.lightBlue1 }
    : {}),
  ...(status === 'NOT_MODIFIED' ? { backgroundColor: theme.bg.bgPaper } : {}),
}));

export const sxItemSpacing = {
  padding: `0 8px`,
};

export const RulesTable = ({ rules }: Props) => {
  const theme: Theme = useTheme();

  const onDragEnd = (result: DropResult) => {
    if (result.destination) {
      // triggerReorder(result.source.index, result.destination?.index);
    }
  };

  const xsDown = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      <Box aria-label={`Rules List`} sx={{ margin: 0, width: '100%' }}>
        <StyledInnerBox
          aria-label={` Rules List Headers`}
          sx={sxBox}
          tabIndex={0}
        >
          <Box
            sx={{
              ...sxItemSpacing,
              paddingLeft: '27px',
              width: xsDown ? '50%' : '15%',
            }}
          >
            Execution
          </Box>
          <Box sx={{ ...sxItemSpacing, width: '20%' }}>Match Value</Box>
          <Hidden smDown>
            <Box
              sx={{
                ...sxItemSpacing,
                width: '15%',
              }}
            >
              Match Type
            </Box>
            <Box sx={{ ...sxItemSpacing, width: '20%' }}>Service Targets</Box>
            <Box sx={{ ...sxItemSpacing, width: '20%' }}>
              Session Stickiness
            </Box>
          </Hidden>
          <Box sx={{ ...sxItemSpacing, width: '5%' }}></Box>
        </StyledInnerBox>
      </Box>

      <Box sx={{ ...sxBox, flexDirection: 'column' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <StyledUl ref={provided.innerRef} {...provided.droppableProps}>
                {rules.length > 0 ? (
                  rules.map((rule, index) => (
                    <Draggable
                      draggableId={String(rule.match_condition.hostname)}
                      index={index}
                      key={rule.match_condition.hostname}
                    >
                      {(provided) => (
                        <li
                          // aria-label={rule.label ?? `firewall rule ${thisRuleRow.id}`}
                          // aria-roledescription={screenReaderMessage}
                          aria-selected={false}
                          key={rule.match_condition.hostname}
                          ref={provided.innerRef}
                          role="option"
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <StyledRuleBox
                            // aria-label={label ?? `firewall rule ${id}`}
                            key={index}
                            originalIndex={0}
                            ruleId={index}
                            status={'NOT_MODIFIED'}
                          >
                            <Box
                              sx={{
                                ...sxItemSpacing,
                                overflowWrap: 'break-word',
                                paddingLeft: '8px',
                                width: xsDown ? '50%' : '15%',
                              }}
                              // aria-label={`Label: ${label}`}
                            >
                              <StyledDragIndicator aria-label="Drag indicator icon" />
                              {index === 0
                                ? 'First'
                                : index === rules.length - 1
                                ? 'Last'
                                : null}
                            </Box>
                            <Box
                              aria-label={`Match value: ${rule.match_condition.match_value}`}
                              sx={{ ...sxItemSpacing, width: '20%' }}
                            >
                              {rule.match_condition.match_value}
                            </Box>

                            <Hidden smDown>
                              <Box
                                aria-label={`Match Field: ${
                                  matchFieldMap[
                                    rule.match_condition.match_field
                                  ]
                                }`}
                                sx={{ ...sxItemSpacing, width: '20%' }}
                              >
                                {
                                  matchFieldMap[
                                    rule.match_condition.match_field
                                  ]
                                }
                              </Box>
                            </Hidden>
                            <Hidden smDown>
                              <Box
                                sx={{
                                  ...sxItemSpacing,
                                  overflowWrap: 'break-word',
                                  width: '20%',
                                }}
                                aria-label={`Service Targets: ${rule.match_condition.service_targets.length}`}
                              >
                                <Tooltip
                                  title={
                                    <>
                                      {rule.match_condition.service_targets.map(
                                        ({ id, label }) => (
                                          <div key={label}>
                                            {label}:{id}
                                          </div>
                                        )
                                      )}
                                    </>
                                  }
                                >
                                  <div
                                    style={{
                                      maxWidth: '30px',
                                      textDecoration: 'underline',
                                    }}
                                  >
                                    {
                                      rule.match_condition.service_targets
                                        .length
                                    }
                                  </div>
                                </Tooltip>
                              </Box>
                            </Hidden>
                            <Hidden smDown>
                              <Box
                                aria-label={`Session Stickiness: ${
                                  rule.match_condition
                                    .session_stickiness_cookie &&
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
                                {rule.match_condition
                                  .session_stickiness_cookie &&
                                rule.match_condition.session_stickiness_ttl
                                  ? 'Yes'
                                  : 'No'}
                              </Box>
                            </Hidden>
                            <Box
                              aria-label={`Action Menu`}
                              sx={{ ...sxItemSpacing, width: '5%' }}
                            >
                              {/** TODO: AGLB: The Action menu behavior should be implemented in future AGLB tickets. */}
                              <ActionMenu
                                actionsList={[
                                  { onClick: () => null, title: 'Edit' },
                                  { onClick: () => null, title: 'Move Up' },
                                  { onClick: () => null, title: 'Move Down' },
                                  { onClick: () => null, title: 'Remove' },
                                ]}
                                ariaLabel={`Action Menu for Rule ${rule.match_condition.match_value}`}
                              />
                            </Box>
                          </StyledRuleBox>
                        </li>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <TableRowEmpty colSpan={5} message={'No Linodes'} />
                )}
              </StyledUl>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    </>
  );
};
