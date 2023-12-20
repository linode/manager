import { Hidden } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useFormikContext } from 'formik';
import React from 'react';
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd';

import { Box } from 'src/components/Box';

import { RuleRow } from '../LoadBalancerDetail/RuleRow';
import {
  StyledInnerBox,
  StyledUl,
  sxBox,
  sxItemSpacing,
} from '../LoadBalancerDetail/RulesTable.styles';
import { LoadBalancerCreateFormData } from './LoadBalancerCreate';

interface Props {
  configurationIndex: number;
  onEditRule: (ruleIndex: number) => void;
  routeIndex: number;
}

export const RulesTable = (props: Props) => {
  const { configurationIndex, onEditRule, routeIndex } = props;
  const {
    setFieldValue,
    values,
  } = useFormikContext<LoadBalancerCreateFormData>();
  const theme = useTheme();

  const configuration = values.configurations![configurationIndex ?? 0];

  const route = configuration.routes![routeIndex ?? 0];

  const onDeleteRule = (ruleIndex: number) => {
    route.rules.splice(ruleIndex, 1);
    setFieldValue(
      `configurations[${configurationIndex}].routes[${routeIndex}].rules`,
      route.rules
    );
  };

  const handleRulesReorder = async (
    sourceIndex: number,
    destinationIndex: number
  ) => {
    const reorderedRules = [...route.rules];
    const [removed] = reorderedRules.splice(sourceIndex, 1);
    reorderedRules.splice(destinationIndex, 0, removed);

    setFieldValue(
      `configurations[${configurationIndex}].routes[${routeIndex}].rules`,
      reorderedRules
    );
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
                {route.rules.length > 0 ? (
                  route.rules.map((rule, index) => (
                    <RuleRow
                      index={index}
                      key={`rule-${index}`}
                      onDeleteRule={() => onDeleteRule(index)}
                      onEditRule={() => onEditRule(index)}
                      onMoveDown={() => handleMoveDown(index)}
                      onMoveUp={() => handleMoveUp(index)}
                      rule={rule}
                      totalRules={route.rules.length}
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
