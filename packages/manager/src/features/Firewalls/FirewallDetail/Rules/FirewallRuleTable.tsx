import { FirewallPolicyType } from '@linode/api-v4/lib/firewalls/types';
import classNames from 'classnames';
import { prop, uniqBy } from 'ramda';
import * as React from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import DragIndicator from 'src/assets/icons/drag-indicator.svg';
import Undo from 'src/assets/icons/undo.svg';
import Button from 'src/components/Button';
import Box from '@mui/material/Box';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, useTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Typography from 'src/components/core/Typography';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
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
  type: string;
  label?: string | null;
  description?: string | null;
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
interface FirewallRuleTableProps extends RowActionHandlers {
  category: Category;
  policy: FirewallPolicyType;
  handlePolicyChange: (
    category: Category,
    newPolicy: FirewallPolicyType
  ) => void;
  openRuleDrawer: (category: Category, mode: FirewallRuleDrawerMode) => void;
  rulesWithStatus: ExtendedFirewallRule[];
  disabled: boolean;
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
          onClick={openDrawerForCreating}
          className={classes.button}
          disabled={disabled}
        >
          Add an {capitalize(category)} Rule
        </Button>
      </div>
      <Box aria-label={`${category} Rules List`} className={classes.ruleGrid}>
        <Box
          className={classes.ruleHeaderRow}
          aria-label={`${category} Rules List Headers`}
          tabIndex={0}
          sx={sxBox}
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
                      data-testid={'table-row-empty'}
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
                    >
                      <Box>{zeroRulesMessage}</Box>
                    </Box>
                  ) : (
                    rowData.map((thisRuleRow: RuleRow, index) => (
                      <Draggable
                        key={thisRuleRow.id}
                        draggableId={String(thisRuleRow.id)}
                        index={index}
                      >
                        {(provided) => (
                          <li
                            key={thisRuleRow.id}
                            role="option"
                            ref={provided.innerRef}
                            aria-label={
                              thisRuleRow.label ??
                              `firewall rule ${thisRuleRow.id}`
                            }
                            aria-selected={false}
                            aria-roledescription={screenReaderMessage}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <FirewallRuleTableRow
                              disabled={disabled}
                              triggerCloneFirewallRule={
                                triggerCloneFirewallRule
                              }
                              triggerDeleteFirewallRule={
                                triggerDeleteFirewallRule
                              }
                              triggerOpenRuleDrawerForEditing={
                                triggerOpenRuleDrawerForEditing
                              }
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
            policy={policy}
            disabled={disabled}
            handlePolicyChange={onPolicyChange}
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
        key={id}
        aria-label={label ?? `firewall rule ${id}`}
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
      >
        <Box
          aria-label={`Label: ${label}`}
          sx={{
            ...sxItemSpacing,
            overflowWrap: 'break-word',
            paddingLeft: '8px',
            width: xsDown ? '50%' : '32%',
          }}
        >
          <DragIndicator
            className={classes.dragIcon}
            aria-label="Drag indicator icon"
          />
          {label || (
            <button
              className={classes.addLabelButton}
              style={{
                color: disabled ? 'inherit' : '',
              }}
              onClick={() => triggerOpenRuleDrawerForEditing(id)}
              disabled={disabled}
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
                onClick={() => triggerUndo(id)}
                aria-label="Undo change to Firewall Rule"
                disabled={disabled}
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
  policy: FirewallPolicyType;
  disabled: boolean;
  handlePolicyChange: (newPolicy: FirewallPolicyType) => void;
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
          label={`${category} policy`}
          menuPlacement="top"
          hideLabel
          isClearable={false}
          value={policyOptions.find(
            (thisOption) => thisOption.value === policy
          )}
          options={policyOptions}
          disabled={disabled}
          onChange={(selected: Item<FirewallPolicyType>) =>
            handlePolicyChange(selected.value)
          }
        />
      </Box>
    </Box>
  );
});

interface ConditionalErrorProps {
  formField: string;
  errors?: FirewallRuleError[];
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
      addresses: generateAddressesLabel(thisRule.addresses),
      id: idx,
      ports: sortPortString(thisRule.ports || ''),
      type: generateRuleLabel(ruleType),
    };
  });
};
