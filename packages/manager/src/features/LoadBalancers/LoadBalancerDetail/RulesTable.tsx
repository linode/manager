import { Hidden } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from 'react-beautiful-dnd';

import { ActionMenu } from 'src/components/ActionMenu';
import { Box } from 'src/components/Box';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { Tooltip } from 'src/components/Tooltip';
import { useLoadBalancerRouteUpdateMutation } from 'src/queries/aglb/routes';

import {
  StyledDragIndicator,
  StyledInnerBox,
  StyledRuleBox,
  StyledUl,
  sxBox,
  sxItemSpacing,
} from './RulesTable.styles';

import type { MatchField, Route } from '@linode/api-v4';

interface Props {
  loadbalancerId: number;
  route: Route;
}

const matchFieldMap: Record<MatchField, string> = {
  header: 'HTTP Header',
  host: 'Host',
  method: 'HTTP Method',
  path_prefix: 'Path',
  query: 'Query String',
};

export const RulesTable = ({ loadbalancerId, route }: Props) => {
  const { label, protocol, rules } = route;
  const theme: Theme = useTheme();

  const [ruelsState, setRulesState] = useState(rules);
  const { mutateAsync: updateRoute } = useLoadBalancerRouteUpdateMutation(
    loadbalancerId,
    route?.id ?? -1
  );

  const handleRulesReorder = async (
    sourceIndex: number,
    destinationIndex: number
  ) => {
    const reorderedRules = [...ruelsState];
    const [removed] = reorderedRules.splice(sourceIndex, 1);
    reorderedRules.splice(destinationIndex, 0, removed);
    await updateRoute({
      label,
      protocol,
      rules: reorderedRules,
    });
    //* * TODO: We could consider removing local persistence once integrated with the API. Ideally, the component should render fresh data */
    setRulesState(reorderedRules);
  };

  const handleMoveUp = (sourceIndex: number) => {
    handleRulesReorder(sourceIndex, sourceIndex - 1);
  };

  const handleMoveDown = (sourceIndex: number) => {
    handleRulesReorder(sourceIndex, sourceIndex + 1);
  };

  const onDragEnd = (result: DropResult) => {
    if (
      !result.destination ||
      result.destination.index === result.source.index
    ) {
      return;
    }

    if (result.destination) {
      handleRulesReorder(result.source.index, result.destination!.index);
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
                {ruelsState.length > 0 ? (
                  ruelsState.map((rule, index) => (
                    <Draggable
                      draggableId={JSON.stringify(rule)}
                      index={index}
                      key={JSON.stringify(rule)}
                    >
                      {(provided) => (
                        <li
                          aria-label={
                            rule.match_condition.hostname ??
                            `Rule ${rule.match_condition.hostname}`
                          }
                          // aria-roledescription={screenReaderMessage}
                          aria-selected={false}
                          key={JSON.stringify(rule)}
                          ref={provided.innerRef}
                          role="option"
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <StyledRuleBox
                            aria-label={`Rule ${rule.match_condition.hostname}`}
                            key={index}
                            sx={{ backgroundColor: theme.bg.bgPaper }}
                          >
                            <Box
                              aria-label={`Label: ${
                                index === 0
                                  ? 'First'
                                  : index === ruelsState.length - 1
                                  ? 'Last'
                                  : null
                              }`}
                              sx={{
                                ...sxItemSpacing,
                                overflowWrap: 'break-word',
                                paddingLeft: '8px',
                                width: xsDown ? '50%' : '15%',
                              }}
                            >
                              <StyledDragIndicator aria-label="Drag indicator icon" />
                              {index === 0
                                ? 'First'
                                : index === ruelsState.length - 1
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
                                  {
                                    disabled: index === 0,
                                    onClick: () => handleMoveUp(index),
                                    title: 'Move Up',
                                  },
                                  {
                                    disabled: index === ruelsState.length - 1,
                                    onClick: () => handleMoveDown(index),
                                    title: 'Move Down',
                                  },
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
                  <TableRowEmpty colSpan={5} message={'No Rules'} />
                )}
                {provided.placeholder}
              </StyledUl>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    </>
  );
};
