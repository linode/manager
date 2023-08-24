import React from 'react';
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DropResult,
  Droppable,
  DroppableProvided,
} from 'react-beautiful-dnd';

import { ActionMenu } from 'src/components/ActionMenu';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

import type { Configuration } from '@linode/api-v4';

interface Props {
  onRemove: (id: number) => void;
  routes: Configuration['routes'];
  setRoutes: (routes: Configuration['routes']) => void;
}

const reorder = (
  list: Configuration['routes'],
  startIndex: number,
  endIndex: number
) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const RoutesTable = ({ onRemove, routes, setRoutes }: Props) => {
  const onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (
      !result.destination ||
      result.destination.index === result.source.index
    ) {
      return;
    }

    // no movement
    if (result.destination.index === result.source.index) {
      return;
    }

    const items = reorder(
      routes,
      result.source.index,
      result.destination.index
    );

    setRoutes(items);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Table sx={{ maxWidth: 900, tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <Droppable droppableId="table">
          {(droppableProvided: DroppableProvided) => (
            <TableBody
              ref={droppableProvided.innerRef}
              {...droppableProvided.droppableProps}
            >
              {routes.length === 0 && <TableRowEmpty colSpan={3} />}
              {routes.map((route, index) => (
                <Draggable
                  draggableId={String(route.id)}
                  index={index}
                  key={route.id}
                >
                  {(
                    provided: DraggableProvided,
                    snapshot: DraggableStateSnapshot
                  ) => (
                    <TableRow
                      sx={
                        snapshot.isDragging ? { display: 'table' } : undefined
                      }
                      domRef={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <TableCell sx={{ width: '50%' }}>{route.label}</TableCell>
                      <TableCell sx={{ textAlign: 'end', width: '50%' }}>
                        <ActionMenu
                          actionsList={[
                            {
                              onClick: () => onRemove(route.id),
                              title: 'Remove',
                            },
                          ]}
                          ariaLabel={`Action Menu for route ${route.label}`}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </Draggable>
              ))}
              {droppableProvided.placeholder}
            </TableBody>
          )}
        </Droppable>
      </Table>
    </DragDropContext>
  );
};
