import {
  DndContext,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { prop, uniqBy } from 'ramda';
import * as React from 'react';

import Undo from 'src/assets/icons/undo.svg';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Hidden } from 'src/components/Hidden';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { Typography } from 'src/components/Typography';
import {
  generateAddressesLabel,
  generateRuleLabel,
  predefinedFirewallFromRule as ruleToPredefinedFirewall,
} from 'src/features/Firewalls/shared';
import { capitalize } from 'src/utilities/capitalize';

import { FirewallRuleActionMenu } from './FirewallRuleActionMenu';
import {
  MoreStyledLinkButton,
  StyledButtonDiv,
  StyledDragIndicator,
  StyledErrorDiv,
  StyledFirewallRuleButton,
  StyledFirewallTableButton,
  StyledHeaderDiv,
  StyledTableRow,
} from './FirewallRuleTable.styles';
import { sortPortString } from './shared';

import type { FirewallRuleDrawerMode } from './FirewallRuleDrawer.types';
import type { ExtendedFirewallRule, RuleStatus } from './firewallRuleEditor';
import type { Category, FirewallRuleError } from './shared';
import type { DragEndEvent } from '@dnd-kit/core';
import type { FirewallPolicyType } from '@linode/api-v4/lib/firewalls/types';
import type { FirewallOptionItem } from 'src/features/Firewalls/shared';

interface RuleRow {
  action?: string;
  addresses: string;
  description?: null | string;
  errors?: FirewallRuleError[];
  id: number;
  index: number;
  label?: null | string;
  originalIndex: number;
  ports: string;
  protocol: string;
  status: RuleStatus;
  type: string;
}

// =============================================================================
// <FirewallRuleTable />
// =============================================================================

interface RowActionHandlers {
  triggerCloneFirewallRule: (idx: number) => void;
  triggerDeleteFirewallRule: (idx: number) => void;
  triggerOpenRuleDrawerForEditing: (idx: number) => void;
  triggerReorder: (startIdx: number, endIdx: number) => void;
  triggerUndo: (idx: number) => void;
}

interface FirewallRuleTableProps extends RowActionHandlers {
  category: Category;
  disabled: boolean;
  handlePolicyChange: (
    category: Category,
    newPolicy: FirewallPolicyType
  ) => void;
  openRuleDrawer: (category: Category, mode: FirewallRuleDrawerMode) => void;
  policy: FirewallPolicyType;
  rulesWithStatus: ExtendedFirewallRule[];
}

export const FirewallRuleTable = (props: FirewallRuleTableProps) => {
  const {
    category,
    disabled,
    handlePolicyChange,
    openRuleDrawer,
    policy,
    rulesWithStatus,
    triggerCloneFirewallRule,
    triggerDeleteFirewallRule,
    triggerOpenRuleDrawerForEditing,
    triggerReorder,
    triggerUndo,
  } = props;

  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down('sm'));

  const addressColumnLabel =
    category === 'inbound' ? 'sources' : 'destinations';

  const rowData = firewallRuleToRowData(rulesWithStatus);

  const openDrawerForCreating = React.useCallback(() => {
    openRuleDrawer(category, 'create');
  }, [openRuleDrawer, category]);

  const zeroRulesMessage = `No ${category} rules have been added.`;

  const screenReaderMessage =
    'Some screen readers may require you to enter focus mode to interact with firewall rule list items. In focus mode, press spacebar to begin a drag or tab to access item actions.';

  const getRowDataIndex = React.useMemo(() => {
    return (id: number) => rowData.findIndex((data) => data.id === id);
  }, [rowData]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      const sourceIndex = getRowDataIndex(Number(active.id));
      const destinationIndex = getRowDataIndex(Number(over.id));
      triggerReorder(sourceIndex, destinationIndex);
    }

    // Remove focus from the initial position when the drag ends.
    if (document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }
  };

  const onPolicyChange = (newPolicy: FirewallPolicyType) => {
    handlePolicyChange(category, newPolicy);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(TouchSensor)
  );

  return (
    <>
      <StyledHeaderDiv>
        <Typography variant="h2">{`${capitalize(category)} Rules`}</Typography>
        <StyledFirewallTableButton
          buttonType="primary"
          disabled={disabled}
          onClick={openDrawerForCreating}
        >
          Add an {capitalize(category)} Rule
        </StyledFirewallTableButton>
      </StyledHeaderDiv>
      <Box
        aria-label={`${category} Rules List`}
        sx={{ margin: 0, width: '100%' }}
      >
        <DndContext
          collisionDetection={closestCorners}
          onDragEnd={onDragEnd}
          sensors={sensors}
        >
          <Table>
            <TableHead aria-label={`${category} Rules List Headers`}>
              <TableRow>
                <TableCell sx={{ width: smDown ? '50%' : '26%' }}>
                  Label
                </TableCell>
                <Hidden lgDown>
                  <TableCell sx={{ width: '10%' }}>Protocol</TableCell>
                </Hidden>
                <Hidden smDown>
                  <TableCell sx={{ width: '15%' }}>Port Range</TableCell>
                  <TableCell sx={{ width: '15%' }}>
                    {capitalize(addressColumnLabel)}
                  </TableCell>
                </Hidden>
                <TableCell sx={{ width: '10%' }}>Action</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {rowData.length === 0 ? (
                <TableRowEmpty
                  colSpan={6}
                  data-testid={'table-row-empty'}
                  message={zeroRulesMessage}
                />
              ) : (
                <SortableContext
                  items={rowData}
                  strategy={verticalListSortingStrategy}
                >
                  {rowData.map((thisRuleRow: RuleRow) => (
                    <FirewallRuleTableRow
                      aria-label={
                        thisRuleRow.label ?? `firewall rule ${thisRuleRow.id}`
                      }
                      triggerOpenRuleDrawerForEditing={
                        triggerOpenRuleDrawerForEditing
                      }
                      aria-roledescription={screenReaderMessage}
                      aria-selected={false}
                      disabled={disabled}
                      key={thisRuleRow.id}
                      triggerCloneFirewallRule={triggerCloneFirewallRule}
                      triggerDeleteFirewallRule={triggerDeleteFirewallRule}
                      triggerUndo={triggerUndo}
                      {...thisRuleRow}
                      id={thisRuleRow.id}
                    />
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </DndContext>
        <PolicyRow
          category={category}
          disabled={disabled}
          handlePolicyChange={onPolicyChange}
          policy={policy}
        />
      </Box>
    </>
  );
};

// =============================================================================
// <FirewallRuleTableRow />
// =============================================================================
interface RowActionHandlersWithDisabled
  extends Omit<RowActionHandlers, 'triggerReorder'> {
  disabled: boolean;
}

export interface FirewallRuleTableRowProps extends RuleRow {
  disabled: RowActionHandlersWithDisabled['disabled'];
  triggerCloneFirewallRule: RowActionHandlersWithDisabled['triggerCloneFirewallRule'];
  triggerDeleteFirewallRule: RowActionHandlersWithDisabled['triggerDeleteFirewallRule'];
  triggerOpenRuleDrawerForEditing: RowActionHandlersWithDisabled['triggerOpenRuleDrawerForEditing'];
  triggerUndo: RowActionHandlersWithDisabled['triggerUndo'];
}

const FirewallRuleTableRow = React.memo((props: FirewallRuleTableRowProps) => {
  const {
    action,
    addresses,
    disabled,
    errors,
    id,
    index,
    label,
    originalIndex,
    ports,
    protocol,
    status,
    triggerCloneFirewallRule,
    triggerDeleteFirewallRule,
    triggerOpenRuleDrawerForEditing,
    triggerUndo,
  } = props;

  const actionMenuProps = {
    disabled: status === 'PENDING_DELETION' || disabled,
    idx: index,
    triggerCloneFirewallRule,
    triggerDeleteFirewallRule,
    triggerOpenRuleDrawerForEditing,
  };

  const {
    active,
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const isActive = Boolean(active);

  // dnd-kit styles
  const rowStyles = {
    '& td': {
      // Highly recommend to set the `touch-action: none` for all the draggable elements-
      // in order to prevent scrolling on mobile devices.
      // refer to https://docs.dndkit.com/api-documentation/sensors/pointer#touch-action
      touchAction: 'none',
    },
    cursor: isDragging ? 'grabbing' : 'grab',
    position: 'relative',
    transform: CSS.Transform.toString(transform),
    transition: isActive ? transition : 'none',
    zIndex: isDragging ? 999 : 0,
  } as const;

  return (
    <StyledTableRow
      aria-label={label ?? `firewall rule ${id}`}
      disabled={disabled}
      key={id}
      originalIndex={originalIndex}
      ref={setNodeRef}
      ruleIndex={index}
      status={status}
      {...attributes}
      {...listeners}
      sx={rowStyles}
    >
      <TableCell aria-label={`Label: ${label}`} sx={{ whiteSpace: 'nowrap' }}>
        <StyledDragIndicator aria-label="Drag indicator icon" />
        {label || (
          <MoreStyledLinkButton
            disabled={disabled}
            onClick={() => triggerOpenRuleDrawerForEditing(index)}
          >
            Add a label
          </MoreStyledLinkButton>
        )}
      </TableCell>
      <Hidden lgDown>
        <TableCell aria-label={`Protocol: ${protocol}`}>
          {protocol}
          <ConditionalError errors={errors} formField="protocol" />
        </TableCell>
      </Hidden>
      <Hidden smDown>
        <TableCell aria-label={`Ports: ${ports}`}>
          {ports === '1-65535' ? 'All Ports' : ports}
          <ConditionalError errors={errors} formField="ports" />
        </TableCell>
        <TableCell aria-label={`Addresses: ${addresses}`}>
          <MaskableText text={addresses} />
          <ConditionalError errors={errors} formField="addresses" />
        </TableCell>
      </Hidden>
      <TableCell aria-label={`Action: ${action}`}>
        {capitalize(action?.toLocaleLowerCase() ?? '')}
      </TableCell>
      <TableCell>
        <Box sx={{ float: 'right' }}>
          {status !== 'NOT_MODIFIED' ? (
            <StyledButtonDiv>
              <StyledFirewallRuleButton
                aria-label="Undo change to Firewall Rule"
                disabled={disabled}
                onClick={() => triggerUndo(index)}
                status={status}
              >
                <Undo />
              </StyledFirewallRuleButton>
              <FirewallRuleActionMenu {...actionMenuProps} />
            </StyledButtonDiv>
          ) : (
            <FirewallRuleActionMenu {...actionMenuProps} />
          )}
        </Box>
      </TableCell>
    </StyledTableRow>
  );
});

interface PolicyRowProps {
  category: Category;
  disabled: boolean;
  handlePolicyChange: (newPolicy: FirewallPolicyType) => void;
  policy: FirewallPolicyType;
}

const policyOptions: FirewallOptionItem<FirewallPolicyType>[] = [
  { label: 'Accept', value: 'ACCEPT' },
  { label: 'Drop', value: 'DROP' },
];

export const PolicyRow = React.memo((props: PolicyRowProps) => {
  const { category, disabled, handlePolicyChange, policy } = props;
  const theme = useTheme();
  const mdDown = useMediaQuery(theme.breakpoints.down('lg'));

  const helperText = mdDown ? (
    <strong>{capitalize(category)} policy:</strong>
  ) : (
    <span>
      <strong>Default {category} policy:</strong> This policy applies to any
      traffic not covered by the {category} rules listed above.
    </span>
  );

  // Using a grid here to keep the Select and the helper text aligned
  // with the Action column for screens < 'sm', and with the last column for screens >= 'sm'.
  const sxBoxGrid = {
    alignItems: 'center',
    backgroundColor: theme.bg.bgPaper,
    border: `1px solid ${theme.borderColors.borderTable}`,
    color: theme.textColors.tableStatic,
    display: 'grid',
    fontSize: '.875rem',
    gridTemplateAreas: `'one two three four five six'`,
    gridTemplateColumns: '26% 10% 15% 15% 10% 120px',
    height: '40px',
    marginTop: '10px',
    [theme.breakpoints.down('lg')]: {
      gridTemplateAreas: `'one two three four five'`,
      gridTemplateColumns: '26% 15% 15% 10% 120px',
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateAreas: `'one two'`,
      gridTemplateColumns: '50% 50%',
    },
    width: '100%',
  };

  const sxBoxPolicyText = {
    gridArea: '1 / 1 / 1 / 6',
    padding: '0px 15px 0px 15px',
    textAlign: 'right',
    [theme.breakpoints.down('lg')]: {
      gridArea: '1 / 1 / 1 / 5',
    },
    [theme.breakpoints.down('sm')]: {
      gridArea: 'one',
    },
  };

  const sxBoxPolicySelect = {
    gridArea: 'six',
    [theme.breakpoints.down('lg')]: {
      gridArea: 'five',
    },
    [theme.breakpoints.down('sm')]: {
      gridArea: 'two',
    },
  };

  return (
    <Box sx={sxBoxGrid}>
      <Box sx={sxBoxPolicyText}>{helperText}</Box>
      <Box sx={sxBoxPolicySelect}>
        <Autocomplete
          textFieldProps={{
            hideLabel: true,
          }}
          value={policyOptions.find(
            (thisOption) => thisOption.value === policy
          )}
          autoHighlight
          disableClearable
          disabled={disabled}
          label={`${category} policy`}
          onChange={(_, selected) => handlePolicyChange(selected?.value)}
          options={policyOptions}
        />
      </Box>
    </Box>
  );
});

interface ConditionalErrorProps {
  errors?: FirewallRuleError[];
  formField: string;
}

export const ConditionalError = React.memo((props: ConditionalErrorProps) => {
  const { errors, formField } = props;

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
          <StyledErrorDiv key={thisError.idx}>
            <Typography variant="body1">{thisError.reason}</Typography>
          </StyledErrorDiv>
        );
      })}
    </>
  );
});

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
      addresses: generateAddressesLabel(thisRule.addresses),
      id: idx + 1, // ids are 1-indexed, as id given to the useSortable hook cannot be 0
      index: idx,
      ports: sortPortString(thisRule.ports || ''),
      type: generateRuleLabel(ruleType),
    };
  });
};
