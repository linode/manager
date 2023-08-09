import { FirewallPolicyType } from '@linode/api-v4/lib/firewalls/types';
import { Theme } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { prop, uniqBy } from 'ramda';
import * as React from 'react';
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from 'react-beautiful-dnd';

import Undo from 'src/assets/icons/undo.svg';
import { Box } from 'src/components/Box';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { Hidden } from 'src/components/Hidden';
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
  StyledFirewallRuleBox,
  StyledFirewallRuleButton,
  StyledFirewallTableButton,
  StyledHeaderDiv,
  StyledInnerBox,
  StyledUl,
  StyledUlBox,
  sxBox,
  sxItemSpacing,
} from './FirewallRuleTable.styles';
import { ExtendedFirewallRule, RuleStatus } from './firewallRuleEditor';
import { Category, FirewallRuleError, sortPortString } from './shared';

import type { FirewallRuleDrawerMode } from './FirewallRuleDrawer.types';

interface RuleRow {
  action?: string;
  addresses: string;
  description?: null | string;
  errors?: FirewallRuleError[];
  id: number;
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

  const theme: Theme = useTheme();
  const xsDown = useMediaQuery(theme.breakpoints.down('sm'));

  const addressColumnLabel =
    category === 'inbound' ? 'sources' : 'destinations';

  const rowData = firewallRuleToRowData(rulesWithStatus);

  const openDrawerForCreating = React.useCallback(() => {
    openRuleDrawer(category, 'create');
  }, [openRuleDrawer, category]);

  const zeroRulesMessage = `No ${category} rules have been added.`;

  const screenReaderMessage =
    'Some screen readers may require you to enter focus mode to interact with firewall rule list items. In focus mode, press spacebar to begin a drag or tab to access item actions.';

  const onDragEnd = (result: DropResult) => {
    if (result.destination) {
      triggerReorder(result.source.index, result.destination?.index);
    }
  };

  const onPolicyChange = (newPolicy: FirewallPolicyType) => {
    handlePolicyChange(category, newPolicy);
  };

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
        <StyledInnerBox
          aria-label={`${category} Rules List Headers`}
          sx={sxBox}
          tabIndex={0}
        >
          <Box
            sx={{
              ...sxItemSpacing,
              paddingLeft: '27px',
              width: xsDown ? '50%' : '32%',
            }}
          >
            Label
          </Box>
          <Hidden lgDown>
            <Box sx={{ ...sxItemSpacing, width: '10%' }}>Protocol</Box>
          </Hidden>
          <Hidden smDown>
            <Box
              sx={{
                ...sxItemSpacing,
                width: '15%',
              }}
            >
              Port Range
            </Box>
            <Box sx={{ ...sxItemSpacing, width: '15%' }}>
              {capitalize(addressColumnLabel)}
            </Box>
          </Hidden>
          <Box sx={{ ...sxItemSpacing, width: '5%' }}>Action</Box>
        </StyledInnerBox>
        <Box sx={{ ...sxBox, flexDirection: 'column' }}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable" isDropDisabled={disabled}>
              {(provided) => (
                <StyledUl ref={provided.innerRef} {...provided.droppableProps}>
                  {rowData.length === 0 ? (
                    <StyledUlBox data-testid={'table-row-empty'}>
                      <Box>{zeroRulesMessage}</Box>
                    </StyledUlBox>
                  ) : (
                    rowData.map((thisRuleRow: RuleRow, index) => (
                      <Draggable
                        draggableId={String(thisRuleRow.id)}
                        index={index}
                        key={thisRuleRow.id}
                      >
                        {(provided) => (
                          <li
                            aria-label={
                              thisRuleRow.label ??
                              `firewall rule ${thisRuleRow.id}`
                            }
                            aria-roledescription={screenReaderMessage}
                            aria-selected={false}
                            key={thisRuleRow.id}
                            ref={provided.innerRef}
                            role="option"
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <FirewallRuleTableRow
                              triggerCloneFirewallRule={
                                triggerCloneFirewallRule
                              }
                              triggerDeleteFirewallRule={
                                triggerDeleteFirewallRule
                              }
                              triggerOpenRuleDrawerForEditing={
                                triggerOpenRuleDrawerForEditing
                              }
                              disabled={disabled}
                              triggerUndo={triggerUndo}
                              {...thisRuleRow}
                            />
                          </li>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </StyledUl>
              )}
            </Droppable>
          </DragDropContext>
          <PolicyRow
            category={category}
            disabled={disabled}
            handlePolicyChange={onPolicyChange}
            policy={policy}
          />
        </Box>
      </Box>
    </>
  );
};

// =============================================================================
// <FirewallRuleTableRow />
// =============================================================================
export type FirewallRuleTableRowProps = RuleRow &
  Omit<RowActionHandlers, 'triggerReorder'> & {
    disabled: boolean;
  };

const FirewallRuleTableRow = React.memo((props: FirewallRuleTableRowProps) => {
  const theme: Theme = useTheme();
  const xsDown = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    action,
    addresses,
    disabled,
    errors,
    id,
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
    idx: id,
    triggerCloneFirewallRule,
    triggerDeleteFirewallRule,
    triggerOpenRuleDrawerForEditing,
  };

  return (
    <StyledFirewallRuleBox
      aria-label={label ?? `firewall rule ${id}`}
      disabled={disabled}
      key={id}
      originalIndex={originalIndex}
      ruleId={id}
      status={status}
    >
      <Box
        sx={{
          ...sxItemSpacing,
          overflowWrap: 'break-word',
          paddingLeft: '8px',
          width: xsDown ? '50%' : '32%',
        }}
        aria-label={`Label: ${label}`}
      >
        <StyledDragIndicator aria-label="Drag indicator icon" />
        {label || (
          <MoreStyledLinkButton
            disabled={disabled}
            onClick={() => triggerOpenRuleDrawerForEditing(id)}
          >
            Add a label
          </MoreStyledLinkButton>
        )}{' '}
      </Box>
      <Hidden lgDown>
        <Box
          aria-label={`Protocol: ${protocol}`}
          sx={{ ...sxItemSpacing, width: '10%' }}
        >
          {protocol}
          <ConditionalError errors={errors} formField="protocol" />
        </Box>
      </Hidden>
      <Hidden smDown>
        <Box
          aria-label={`Ports: ${ports}`}
          sx={{ ...sxItemSpacing, width: '15%' }}
        >
          {ports === '1-65535' ? 'All Ports' : ports}
          <ConditionalError errors={errors} formField="ports" />
        </Box>
        <Box
          aria-label={`Addresses: ${addresses}`}
          sx={{ ...sxItemSpacing, overflowWrap: 'break-word', width: '15%' }}
        >
          {addresses} <ConditionalError errors={errors} formField="addresses" />
        </Box>
      </Hidden>
      <Box
        aria-label={`Action: ${action}`}
        sx={{ ...sxItemSpacing, width: '5%' }}
      >
        {capitalize(action?.toLocaleLowerCase() ?? '')}
      </Box>
      <Box sx={{ ...sxItemSpacing, marginLeft: 'auto' }}>
        {status !== 'NOT_MODIFIED' ? (
          <StyledButtonDiv>
            <StyledFirewallRuleButton
              aria-label="Undo change to Firewall Rule"
              disabled={disabled}
              onClick={() => triggerUndo(id)}
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
    </StyledFirewallRuleBox>
  );
});

interface PolicyRowProps {
  category: Category;
  disabled: boolean;
  handlePolicyChange: (newPolicy: FirewallPolicyType) => void;
  policy: FirewallPolicyType;
}

const policyOptions: Item<FirewallPolicyType>[] = [
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
  // with the Action column.
  const sxBoxGrid = {
    alignItems: 'center',
    backgroundColor: theme.bg.bgPaper,
    borderBottom: `1px solid ${theme.borderColors.borderTable}`,
    color: theme.textColors.tableStatic,
    display: 'grid',
    fontSize: '.875rem',
    gridTemplateAreas: `'one two three four five'`,
    gridTemplateColumns: '32% 10% 10% 15% 120px',
    height: '40px',
    marginTop: '10px',
    [theme.breakpoints.down('lg')]: {
      gridTemplateAreas: `'one two three four'`,
      gridTemplateColumns: '32% 15% 15% 120px',
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateAreas: `'one two'`,
      gridTemplateColumns: '50% 50%',
    },
    width: '100%',
  };

  const sxBoxPolicyText = {
    gridArea: '1 / 1 / 1 / 5',
    padding: '0px 15px 0px 15px',

    textAlign: 'right',
    [theme.breakpoints.down('lg')]: {
      gridArea: '1 / 1 / 1 / 4',
    },
    [theme.breakpoints.down('sm')]: {
      gridArea: 'one',
    },
  };

  const sxBoxPolicySelect = {
    gridArea: 'five',
    [theme.breakpoints.down('lg')]: {
      gridArea: 'four',
    },
    [theme.breakpoints.down('sm')]: {
      gridArea: 'two',
    },
  };

  return (
    <Box sx={sxBoxGrid}>
      <Box sx={sxBoxPolicyText}>{helperText}</Box>
      <Box sx={sxBoxPolicySelect}>
        <Select
          onChange={(selected: Item<FirewallPolicyType>) =>
            handlePolicyChange(selected.value)
          }
          value={policyOptions.find(
            (thisOption) => thisOption.value === policy
          )}
          disabled={disabled}
          hideLabel
          isClearable={false}
          label={`${category} policy`}
          menuPlacement="top"
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
      id: idx,
      ports: sortPortString(thisRule.ports || ''),
      type: generateRuleLabel(ruleType),
    };
  });
};
