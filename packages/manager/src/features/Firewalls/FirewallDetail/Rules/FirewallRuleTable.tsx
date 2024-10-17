import { Box } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { prop, uniqBy } from 'ramda';
import * as React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import Undo from 'src/assets/icons/undo.svg';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Hidden } from 'src/components/Hidden';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
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
  StyledCellItemBox,
  StyledDragIndicator,
  StyledErrorDiv,
  StyledFirewallRuleBox,
  StyledFirewallRuleButton,
  StyledFirewallTableButton,
  StyledHeaderDiv,
  StyledHeaderItemBox,
  StyledInnerBox,
  StyledUl,
  StyledUlBox,
  sxBox,
} from './FirewallRuleTable.styles';
import { sortPortString } from './shared';

import type { FirewallRuleDrawerMode } from './FirewallRuleDrawer.types';
import type { ExtendedFirewallRule, RuleStatus } from './firewallRuleEditor';
import type { Category, FirewallRuleError } from './shared';
import type { FirewallPolicyType } from '@linode/api-v4/lib/firewalls/types';
import type { Theme } from '@mui/material/styles';
import type { FirewallOptionItem } from 'src/features/Firewalls/shared';

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
  const betweenSmAndLg = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

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
          <StyledHeaderItemBox
            sx={{
              width: xsDown ? '50%' : '30%',
            }}
          >
            Label
          </StyledHeaderItemBox>
          <Hidden lgDown>
            <StyledHeaderItemBox sx={{ width: '10%' }}>
              Protocol
            </StyledHeaderItemBox>
          </Hidden>
          <Hidden smDown>
            <StyledHeaderItemBox sx={{ width: betweenSmAndLg ? '14%' : '10%' }}>
              Port Range
            </StyledHeaderItemBox>
            <StyledHeaderItemBox sx={{ width: betweenSmAndLg ? '20%' : '14%' }}>
              {capitalize(addressColumnLabel)}
            </StyledHeaderItemBox>
          </Hidden>
          <StyledHeaderItemBox sx={{ width: xsDown ? '30%' : '12%' }}>
            Action
          </StyledHeaderItemBox>
          <StyledHeaderItemBox flexGrow={1} />
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
  const theme: Theme = useTheme();
  const xsDown = useMediaQuery(theme.breakpoints.down('sm'));
  const betweenSmAndLg = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

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
      <StyledCellItemBox
        sx={{
          overflowWrap: 'break-word',
          paddingLeft: '10px !important',
          width: xsDown ? '50%' : '30%',
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
      </StyledCellItemBox>
      <Hidden lgDown>
        <StyledCellItemBox
          aria-label={`Protocol: ${protocol}`}
          sx={{ width: '10%' }}
        >
          {protocol}
          <ConditionalError errors={errors} formField="protocol" />
        </StyledCellItemBox>
      </Hidden>
      <Hidden smDown>
        <StyledCellItemBox
          aria-label={`Ports: ${ports}`}
          sx={{ width: betweenSmAndLg ? '14%' : '10%' }}
        >
          {ports === '1-65535' ? 'All Ports' : ports}
          <ConditionalError errors={errors} formField="ports" />
        </StyledCellItemBox>
        <StyledCellItemBox
          sx={{
            overflowWrap: 'break-word',
            width: betweenSmAndLg ? '20%' : '14%',
          }}
          aria-label={`Addresses: ${addresses}`}
        >
          <MaskableText text={addresses} />
          <ConditionalError errors={errors} formField="addresses" />
        </StyledCellItemBox>
      </Hidden>
      <StyledCellItemBox
        aria-label={`Action: ${action}`}
        sx={{ width: xsDown ? '30%' : '12%' }}
      >
        {capitalize(action?.toLocaleLowerCase() ?? '')}
      </StyledCellItemBox>
      <StyledCellItemBox sx={{ marginLeft: 'auto' }}>
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
      </StyledCellItemBox>
    </StyledFirewallRuleBox>
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
  // with the Action column for screens < 'lg', and with the last column for screens >= 'lg'.
  const sxBoxGrid = {
    alignItems: 'center',
    backgroundColor: theme.bg.bgPaper,
    border: `1px solid ${theme.borderColors.borderTable}`,
    color: theme.textColors.tableStatic,
    display: 'grid',
    fontSize: '.875rem',
    gridTemplateAreas: `'one two three four five six'`,
    gridTemplateColumns: '30% 10% 10% 14% 12% 120px',
    height: '40px',
    marginTop: '10px',
    [theme.breakpoints.down('lg')]: {
      gridTemplateAreas: `'one two three four five'`,
      gridTemplateColumns: '30% 14% 20% 12% 120px',
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
      gridArea: '1 / 1 / 1 / 4',
    },
    [theme.breakpoints.down('sm')]: {
      gridArea: 'one',
    },
  };

  const sxBoxPolicySelect = {
    gridArea: 'six',
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
      id: idx,
      ports: sortPortString(thisRule.ports || ''),
      type: generateRuleLabel(ruleType),
    };
  });
};
