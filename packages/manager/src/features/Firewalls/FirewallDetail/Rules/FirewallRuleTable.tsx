import classnames from 'classnames';
import { prop, uniqBy } from 'ramda';
import * as React from 'react';
import DragIndicator from 'src/assets/icons/drag-indicator.svg';
import Undo from 'src/assets/icons/undo.svg';
import Button from 'src/components/Button';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import {
  generateAddressesLabel,
  generateRuleLabel,
  predefinedFirewallFromRule as ruleToPredefinedFirewall,
} from 'src/features/Firewalls/shared';
import capitalize from 'src/utilities/capitalize';
import FirewallRuleActionMenu from './FirewallRuleActionMenu';
import { Mode } from './FirewallRuleDrawer';
import { ExtendedFirewallRule, RuleStatus } from './firewallRuleEditor';
import { Category, FirewallRuleError, sortPortString } from './shared';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  },
  undoButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignContent: 'center',
    flexDirection: 'row',
  },
  undoButton: {
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
  },
  highlight: {
    backgroundColor: theme.bg.lightBlue,
  },
  error: {
    '& p': { color: theme.color.red },
  },
  button: {
    margin: '8px 0px',
  },
  dragIcon: {
    color: theme.cmrIconColors.iGrey,
    marginRight: theme.spacing(1.5),
    position: 'relative',
    top: 2,
  },
  labelCol: {
    paddingLeft: 6,
  },
  actionCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 0,
  },
  actionHeader: {
    [theme.breakpoints.down('sm')]: {
      minWidth: 70,
    },
    minWidth: 140,
  },
  table: {
    backgroundColor: theme.color.border3,
  },
  addLabelButton: {
    ...theme.applyLinkStyles,
  },
  dragging: {
    display: 'table',
    border: `solid 0.5px ${theme.cmrIconColors.iGrey}`,
    boxShadow: '0 1px 1.5px 0 rgba(0, 0, 0, 0.15)',
    '& svg': {
      color: theme.cmrTextColors.tableHeader,
    },
  },
}));

interface RuleRow {
  type: string;
  label?: string;
  description?: string;
  action?: string;
  protocol: string;
  ports: string;
  addresses: string;
  id: number;
  status: RuleStatus;
  errors?: FirewallRuleError[];
  originalIndex: number;
}

// =============================================================================
// <FirewallRuleTable />
// =============================================================================

interface RowActionHandlers {
  triggerCloneFirewallRule: (idx: number) => void;
  triggerDeleteFirewallRule: (idx: number) => void;
  triggerOpenRuleDrawerForEditing: (idx: number) => void;
  triggerUndo: (idx: number) => void;
  triggerReorder: (startIdx: number, endIdx: number) => void;
}
interface Props extends RowActionHandlers {
  category: Category;
  openRuleDrawer: (category: Category, mode: Mode) => void;
  rulesWithStatus: ExtendedFirewallRule[];
}

type CombinedProps = Props;

const FirewallRuleTable: React.FC<CombinedProps> = (props) => {
  const {
    category,
    openRuleDrawer,
    rulesWithStatus,
    triggerCloneFirewallRule,
    triggerDeleteFirewallRule,
    triggerOpenRuleDrawerForEditing,
    triggerUndo,
    triggerReorder,
  } = props;

  const classes = useStyles();

  const addressColumnLabel =
    category === 'inbound' ? 'sources' : 'destinations';

  const rowData = firewallRuleToRowData(rulesWithStatus);

  const openDrawerForCreating = React.useCallback(() => {
    openRuleDrawer(category, 'create');
  }, [openRuleDrawer, category]);

  const zeroOutboundRulesMessage =
    'No outbound rules have been added. When no outbound rules are present, all outbound traffic is allowed.';

  const onDragEnd = (result: DropResult) => {
    if (result.destination) {
      triggerReorder(result.source.index, result.destination?.index);
    }
  };

  return (
    <>
      <div className={classes.header}>
        <Typography variant="h2">{`${capitalize(category)} Rules`}</Typography>
        <Button
          buttonType="secondary"
          className={classes.button}
          onClick={openDrawerForCreating}
          superCompact
        >
          Add an {capitalize(category)} Rule
        </Button>
      </div>
      <Table style={{ tableLayout: 'auto' }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ paddingLeft: 27 }}>Label</TableCell>
            <Hidden mdDown>
              <TableCell>Description</TableCell>
            </Hidden>
            <Hidden xsDown>
              <TableCell>Protocol</TableCell>
              <TableCell>Port Range</TableCell>
            </Hidden>
            <TableCell>{capitalize(addressColumnLabel)}</TableCell>
            <TableCell>Action</TableCell>
            <TableCell className={classes.actionHeader} />
          </TableRow>
        </TableHead>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <TableBody
                {...provided.droppableProps}
                className={classes.table}
                innerRef={provided.innerRef}
              >
                {rowData.length === 0 ? (
                  <TableRowEmptyState
                    colSpan={6}
                    message={zeroOutboundRulesMessage}
                  />
                ) : (
                  rowData.map((thisRuleRow: RuleRow, index) => (
                    <Draggable
                      key={thisRuleRow.id}
                      draggableId={String(thisRuleRow.id)}
                      index={index}
                    >
                      {(provided, snapshot) => {
                        return (
                          <FirewallRuleTableRow
                            isDragging={snapshot.isDragging}
                            key={thisRuleRow.id}
                            {...thisRuleRow}
                            triggerCloneFirewallRule={triggerCloneFirewallRule}
                            triggerDeleteFirewallRule={
                              triggerDeleteFirewallRule
                            }
                            triggerOpenRuleDrawerForEditing={
                              triggerOpenRuleDrawerForEditing
                            }
                            triggerUndo={triggerUndo}
                            innerRef={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          />
                        );
                      }}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </TableBody>
            )}
          </Droppable>
        </DragDropContext>
      </Table>
    </>
  );
};

export default React.memo(FirewallRuleTable);

// =============================================================================
// <FirewallRuleTableRow />
// =============================================================================
type FirewallRuleTableRowProps = RuleRow &
  Omit<RowActionHandlers, 'triggerReorder'> & {
    innerRef: any;
    isDragging: boolean;
  };

const FirewallRuleTableRow: React.FC<FirewallRuleTableRowProps> = React.memo(
  (props) => {
    const classes = useStyles();

    const {
      id,
      action,
      label,
      description,
      protocol,
      ports,
      addresses,
      status,
      triggerCloneFirewallRule,
      triggerDeleteFirewallRule,
      triggerOpenRuleDrawerForEditing,
      triggerUndo,
      errors,
      innerRef,
      isDragging,
      originalIndex,
      ...rest
    } = props;

    const actionMenuProps = {
      idx: id,
      triggerCloneFirewallRule,
      triggerDeleteFirewallRule,
      triggerOpenRuleDrawerForEditing,
    };

    return (
      <TableRow
        key={id}
        highlight={
          // Highlight the row if it's been modified or reordered. ID is the
          // current index, so if it doesn't match the original index we know
          // that the rule has been moved.
          status === 'MODIFIED' || status === 'NEW' || originalIndex !== id
        }
        disabled={status === 'PENDING_DELETION'}
        domRef={innerRef}
        className={isDragging ? classes.dragging : ''}
        {...rest}
      >
        <TableCell className={classes.labelCol} style={{ width: '15%' }}>
          <DragIndicator className={classes.dragIcon} />
          {label || (
            <button
              className={classes.addLabelButton}
              onClick={() => triggerOpenRuleDrawerForEditing(id)}
            >
              Add a label
            </button>
          )}
        </TableCell>
        <Hidden mdDown>
          <TableCell style={{ width: '25%' }}>{description}</TableCell>
        </Hidden>
        <Hidden xsDown>
          <TableCell style={{ width: '10%' }}>
            {protocol}
            <ConditionalError errors={errors} formField="protocol" />
          </TableCell>
          <TableCell style={{ width: '15%' }}>
            {ports === '1-65535' ? 'All Ports' : ports}
            <ConditionalError errors={errors} formField="ports" />
          </TableCell>
        </Hidden>
        <TableCell style={{ width: '15%' }}>
          {addresses} <ConditionalError errors={errors} formField="addresses" />
        </TableCell>
        <TableCell>{capitalize(action?.toLocaleLowerCase() ?? '')}</TableCell>
        <TableCell className={classes.actionCell}>
          {status !== 'NOT_MODIFIED' ? (
            <div className={classes.undoButtonContainer}>
              <button
                className={classnames({
                  [classes.undoButton]: true,
                  [classes.highlight]: status !== 'PENDING_DELETION',
                })}
                onClick={() => triggerUndo(id)}
                aria-label="Undo change to Firewall Rule"
              >
                <Undo />
              </button>
              <FirewallRuleActionMenu
                {...actionMenuProps}
                disabled={status === 'PENDING_DELETION'}
              />
            </div>
          ) : (
            <FirewallRuleActionMenu {...actionMenuProps} />
          )}
        </TableCell>
      </TableRow>
    );
  }
);

interface ConditionalErrorProps {
  formField: string;
  errors?: FirewallRuleError[];
}

export const ConditionalError: React.FC<ConditionalErrorProps> = React.memo(
  (props) => {
    const classes = useStyles();

    const { formField, errors } = props;

    // It's possible to have multiple IP errors, but we only want to display ONE in the table row.
    const uniqueByFormField = uniqBy(prop('formField'), errors ?? []);

    return (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {uniqueByFormField.map((thisError) => {
          if (formField !== thisError.formField || !thisError.reason) {
            return null;
          }
          return (
            <div key={thisError.idx} className={classes.error}>
              <Typography variant="body1">{thisError.reason}</Typography>
            </div>
          );
        })}
      </>
    );
  }
);

// =============================================================================
// Utilities
// =============================================================================
/**
 * Transforms Extended Firewall Rules to the higher-level RuleRow. We do this so
 * downstream components don't have worry about transforming individual pieces
 * of data. This also allows us to sort each column of the RuleTable.
 */
export const firewallRuleToRowData = (
  firewallRules: ExtendedFirewallRule[]
): RuleRow[] => {
  return firewallRules.map((thisRule, idx) => {
    const ruleType = ruleToPredefinedFirewall(thisRule);

    return {
      ...thisRule,
      ports: sortPortString(thisRule.ports || ''),
      type: generateRuleLabel(ruleType),
      addresses: generateAddressesLabel(thisRule.addresses),
      id: idx,
    };
  });
};
