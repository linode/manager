import { FirewallPolicyType } from '@linode/api-v4/lib/firewalls/types';
import Box from '@mui/material/Box';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { makeStyles, useTheme } from '@mui/styles';
import classNames from 'classnames';
import { prop, uniqBy } from 'ramda';
import * as React from 'react';
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from 'react-beautiful-dnd';

import DragIndicator from 'src/assets/icons/drag-indicator.svg';
import Undo from 'src/assets/icons/undo.svg';
import { Button } from 'src/components/Button/Button';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { Hidden } from 'src/components/Hidden';
import { Typography } from 'src/components/Typography';
import {
  generateAddressesLabel,
  generateRuleLabel,
  predefinedFirewallFromRule as ruleToPredefinedFirewall,
} from 'src/features/Firewalls/shared';
import { capitalize } from 'src/utilities/capitalize';

import FirewallRuleActionMenu from './FirewallRuleActionMenu';
import { ExtendedFirewallRule, RuleStatus } from './firewallRuleEditor';
import { Category, FirewallRuleError, sortPortString } from './shared';

import type { FirewallRuleDrawerMode } from './FirewallRuleDrawer.types';

const useStyles = makeStyles((theme: Theme) => ({
  addLabelButton: {
    ...theme.applyLinkStyles,
  },
  button: {
    margin: '8px 0px',
  },
  disabled: {
    '& td': {
      color: '#D2D3D4',
    },
    backgroundColor: 'rgba(247, 247, 247, 0.25)',
  },
  dragIcon: {
    color: theme.color.grey8,
    marginRight: theme.spacing(1.5),
    position: 'relative',
    top: 2,
  },
  dragging: {
    '& svg': {
      color: theme.textColors.tableHeader,
    },
    border: `solid 0.5px ${theme.color.grey8}`,
    boxShadow: '0 1px 1.5px 0 rgba(0, 0, 0, 0.15)',
    display: 'table',
  },
  error: {
    '& p': { color: theme.color.red },
  },
  footer: {
    '&:before': {
      content: '""',
      display: 'block',
      height: theme.spacing(),
    },
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  },
  highlight: {
    backgroundColor: theme.bg.lightBlue1,
  },
  labelCol: {
    paddingLeft: 6,
  },
  ruleGrid: {
    margin: 0,
    width: '100%',
  },
  ruleHeaderRow: {
    backgroundColor: theme.bg.tableHeader,
    color: theme.textColors.tableHeader,
    fontSize: '.875rem',
    fontWeight: 'bold',
    height: '46px',
  },
  ruleList: {
    backgroundColor: theme.color.border3,
    listStyle: 'none',
    margin: 0,
    paddingLeft: 0,
    width: '100%',
  },
  ruleRow: {
    borderBottom: `1px solid ${theme.borderColors.borderTable}`,
    color: theme.textColors.tableStatic,
  },
  undoButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  undoButtonContainer: {
    alignContent: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  unmodified: {
    backgroundColor: theme.bg.bgPaper,
  },
}));

const sxBox = {
  alignItems: 'center',
  display: 'flex',
  width: '100%',
};

const sxItemSpacing = {
  padding: `0 8px`,
};

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

  const classes = useStyles();
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
      <div className={classes.header}>
        <Typography variant="h2">{`${capitalize(category)} Rules`}</Typography>
        <Button
          buttonType="primary"
          className={classes.button}
          disabled={disabled}
          onClick={openDrawerForCreating}
        >
          Add an {capitalize(category)} Rule
        </Button>
      </div>
      <Box aria-label={`${category} Rules List`} className={classes.ruleGrid}>
        <Box
          aria-label={`${category} Rules List Headers`}
          className={classes.ruleHeaderRow}
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
        </Box>
        <Box sx={{ ...sxBox, flexDirection: 'column' }}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable" isDropDisabled={disabled}>
              {(provided) => (
                <ul
                  className={classes.ruleList}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {rowData.length === 0 ? (
                    <Box
                      className={classNames(
                        classes.unmodified,
                        classes.ruleRow
                      )}
                      sx={{
                        alignItems: 'center',
                        display: 'flex',
                        fontSize: '0.875rem',
                        justifyContent: 'center',
                        padding: '8px',
                        width: '100%',
                      }}
                      data-testid={'table-row-empty'}
                    >
                      <Box>{zeroRulesMessage}</Box>
                    </Box>
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
                </ul>
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
type FirewallRuleTableRowProps = RuleRow &
  Omit<RowActionHandlers, 'triggerReorder'> & {
    disabled: boolean;
  };

const FirewallRuleTableRow: React.FC<FirewallRuleTableRowProps> = React.memo(
  (props) => {
    const classes = useStyles();
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
      <Box
        className={classNames({
          [classes.disabled]: status === 'PENDING_DELETION' || disabled,
          [classes.highlight]:
            status === 'MODIFIED' || status === 'NEW' || originalIndex !== id,
          // Highlight the row if it's been modified or reordered. ID is the
          // current index, so if it doesn't match the original index we know
          [classes.ruleGrid]: true,
          [classes.ruleRow]: true,
          // that the rule has been moved.
          [classes.unmodified]: status === 'NOT_MODIFIED',
        })}
        sx={{
          ...sxBox,
          fontSize: '0.875rem',
        }}
        aria-label={label ?? `firewall rule ${id}`}
        key={id}
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
          <DragIndicator
            aria-label="Drag indicator icon"
            className={classes.dragIcon}
          />
          {label || (
            <button
              style={{
                color: disabled ? 'inherit' : '',
              }}
              className={classes.addLabelButton}
              disabled={disabled}
              onClick={() => triggerOpenRuleDrawerForEditing(id)}
            >
              Add a label
            </button>
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
            sx={{ ...sxItemSpacing, width: '15%' }}
          >
            {addresses}{' '}
            <ConditionalError errors={errors} formField="addresses" />
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
            <div className={classes.undoButtonContainer}>
              <button
                className={classNames({
                  [classes.highlight]: status !== 'PENDING_DELETION',
                  [classes.undoButton]: true,
                })}
                aria-label="Undo change to Firewall Rule"
                disabled={disabled}
                onClick={() => triggerUndo(id)}
              >
                <Undo />
              </button>
              <FirewallRuleActionMenu {...actionMenuProps} />
            </div>
          ) : (
            <FirewallRuleActionMenu {...actionMenuProps} />
          )}
        </Box>
      </Box>
    );
  }
);

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

export const ConditionalError: React.FC<ConditionalErrorProps> = React.memo(
  (props) => {
    const classes = useStyles();

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
            <div className={classes.error} key={thisError.idx}>
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
      addresses: generateAddressesLabel(thisRule.addresses),
      id: idx,
      ports: sortPortString(thisRule.ports || ''),
      type: generateRuleLabel(ruleType),
    };
  });
};
