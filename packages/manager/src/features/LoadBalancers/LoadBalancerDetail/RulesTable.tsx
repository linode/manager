import { Hidden } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSnackbar } from 'notistack';
import React from 'react';
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd';

import { Box } from 'src/components/Box';
import { useLoadBalancerRouteUpdateMutation } from 'src/queries/aglb/routes';

import { RuleRow } from './RuleRow';
import {
  StyledInnerBox,
  StyledUl,
  sxBox,
  sxItemSpacing,
} from './RulesTable.styles';

import type { Route } from '@linode/api-v4';

interface Props {
  loadbalancerId: number;
  onDeleteRule: (ruleIndex: number) => void;
  onEditRule: (ruleIndex: number) => void;
  route: Route;
}

export const RulesTable = (props: Props) => {
  const { loadbalancerId, onDeleteRule, onEditRule, route } = props;
  const { label, protocol, rules } = route;
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: updateRoute } = useLoadBalancerRouteUpdateMutation(
    loadbalancerId,
    route?.id ?? -1
  );

  const handleRulesReorder = async (
    sourceIndex: number,
    destinationIndex: number
  ) => {
    const reorderedRules = [...rules];
    const [removed] = reorderedRules.splice(sourceIndex, 1);
    reorderedRules.splice(destinationIndex, 0, removed);

    try {
      await updateRoute({
        label,
        protocol,
        rules: reorderedRules,
      });
    } catch (error) {
      enqueueSnackbar(error?.[0].reason, { variant: 'error' });
    }
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
          <Box sx={{ ...sxItemSpacing, width: xsDown ? '45%' : '20%' }}>
            Match Value
          </Box>
          <Hidden smDown>
            <Box
              sx={{
                ...sxItemSpacing,
                width: '20%',
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
              <StyledUl {...provided.droppableProps} ref={provided.innerRef}>
                {rules.length > 0 ? (
                  rules.map((rule, index) => (
                    <RuleRow
                      index={index}
                      key={`rule-${index}`}
                      onDeleteRule={() => onDeleteRule(index)}
                      onEditRule={() => onEditRule(index)}
                      onMoveDown={() => handleMoveDown(index)}
                      onMoveUp={() => handleMoveUp(index)}
                      rule={rule}
                      totalRules={rules.length}
                    />
                  ))
                ) : (
                  <Box
                    sx={(theme) => ({
                      bgcolor: theme.bg.bgPaper,
                      display: 'flex',
                      justifyContent: 'center',
                      padding: 1.5,
                    })}
                  >
                    No Rules
                  </Box>
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
