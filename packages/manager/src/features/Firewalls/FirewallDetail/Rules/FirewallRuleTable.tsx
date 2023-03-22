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
import Grid from 'src/components/Grid';
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
import capitalize from 'src/utilities/capitalize';
import FirewallRuleActionMenu from './FirewallRuleActionMenu';
import { Mode } from './FirewallRuleDrawer';
import { ExtendedFirewallRule, RuleStatus } from './firewallRuleEditor';
import { Category, FirewallRuleError, sortPortString } from './shared';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& .MuiGrid-root': {
      margin: 0,
      alignItems: 'center',
      fontSize: '.875rem',
    },
    '& .MuiGrid-spacing-xs-2 > .MuiGrid-item': {
      padding: 0,
      [theme.breakpoints.down('md')]: {
        marginLeft: theme.spacing(),
        marginRight: theme.spacing(),
      },
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    [theme.breakpoints.down('md')]: {
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
  unmodified: {
    backgroundColor: theme.bg.bgPaper,
  },
  highlight: {
    backgroundColor: theme.bg.lightBlue1,
  },
  disabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.25)',
    '& td': {
      color: '#D2D3D4',
    },
  },
  error: {
    '& p': { color: theme.color.red },
  },
  button: {
    margin: '8px 0px',
  },
  dragIcon: {
    color: theme.color.grey8,
    marginRight: theme.spacing(1.5),
    position: 'relative',
    top: 2,
  },
  labelCol: {
    paddingLeft: 6,
  },
  ruleGrid: {
    width: '100%',
    margin: 0,
  },
  ruleList: {
    backgroundColor: theme.color.border3,
    listStyle: 'none',
    paddingLeft: 0,
    width: '100%',
    margin: 0,
  },
  ruleHeaderRow: {
    marginTop: '5px',
    backgroundColor: theme.bg.tableHeader,
    color: theme.textColors.tableHeader,
    fontWeight: 'bold',
    height: '46px',
  },
  ruleRow: {
    borderBottom: `1px solid ${theme.borderColors.borderTable}`,
    color: theme.textColors.tableStatic,
  },
  addLabelButton: {
    ...theme.applyLinkStyles,
  },
  dragging: {
    display: 'table',
    border: `solid 0.5px ${theme.color.grey8}`,
    boxShadow: '0 1px 1.5px 0 rgba(0, 0, 0, 0.15)',
    '& svg': {
      color: theme.textColors.tableHeader,
    },
  },
  footer: {
    '&:before': {
      display: 'block',
      content: '""',
      height: theme.spacing(),
    },
  },
  policyText: {
    textAlign: 'right',
    padding: '0px 15px 0px 15px !important',
  },
  policySelect: {
    paddingLeft: 4,
  },
  policySelectInner: {
    width: 90,
  },
  policyRow: {
    marginTop: '10px !important',
    justifyContent: 'center',
    height: '40px',
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
  policy: FirewallPolicyType;
  handlePolicyChange: (
    category: Category,
    newPolicy: FirewallPolicyType
  ) => void;
  openRuleDrawer: (category: Category, mode: Mode) => void;
  rulesWithStatus: ExtendedFirewallRule[];
  disabled: boolean;
}

type CombinedProps = Props;

const FirewallRuleTable: React.FC<CombinedProps> = (props) => {
  const {
    category,
    openRuleDrawer,
    policy,
    handlePolicyChange,
    rulesWithStatus,
    disabled,
    triggerCloneFirewallRule,
    triggerDeleteFirewallRule,
    triggerOpenRuleDrawerForEditing,
    triggerUndo,
    triggerReorder,
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
      <Grid
        container
        aria-label={`${category} Rules List`}
        className={classNames(classes.root, classes.ruleGrid)}
      >
        <Grid
          container
          className={classes.ruleHeaderRow}
          aria-label={`${category} Rules List Headers`}
          tabIndex={0}
        >
          <Grid
            item
            style={{
              paddingLeft: 27,
              width: xsDown ? '50%' : '30%',
            }}
          >
            Label
          </Grid>
          <Hidden lgDown>
            <Grid item style={{ width: '10%' }}>
              Protocol
            </Grid>
          </Hidden>
          <Hidden smDown>
            <Grid
              item
              style={{
                width: '10%',
              }}
            >
              Port Range
            </Grid>
            <Grid item style={{ width: '15%' }}>
              {capitalize(addressColumnLabel)}
            </Grid>
          </Hidden>
          <Grid item style={{ width: '5%' }}>
            Action
          </Grid>
        </Grid>
        <Grid container>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable" isDropDisabled={disabled}>
              {(provided) => (
                <ul
                  className={classes.ruleList}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {rowData.length === 0 ? (
                    <Grid
                      container
                      data-testid={'table-row-empty'}
                      className={classNames(
                        classes.unmodified,
                        classes.ruleRow
                      )}
                      style={{
                        padding: 8,
                        width: '100%',
                        justifyContent: 'center',
                      }}
                    >
                      <Grid item>{zeroRulesMessage}</Grid>
                    </Grid>
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
                            aria-label={thisRuleRow.label}
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
          <Grid container>
            <PolicyRow
              category={category}
              policy={policy}
              disabled={disabled}
              handlePolicyChange={onPolicyChange}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default React.memo(FirewallRuleTable);

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
      id,
      action,
      label,
      protocol,
      ports,
      addresses,
      status,
      triggerCloneFirewallRule,
      triggerDeleteFirewallRule,
      triggerOpenRuleDrawerForEditing,
      triggerUndo,
      errors,
      disabled,
      originalIndex,
    } = props;

    const actionMenuProps = {
      idx: id,
      disabled: status === 'PENDING_DELETION' || disabled,
      triggerCloneFirewallRule,
      triggerDeleteFirewallRule,
      triggerOpenRuleDrawerForEditing,
    };

    return (
      <Grid
        container
        key={id}
        aria-label={label}
        className={classNames({
          [classes.ruleGrid]: true,
          [classes.ruleRow]: true,
          // Highlight the row if it's been modified or reordered. ID is the
          // current index, so if it doesn't match the original index we know
          // that the rule has been moved.
          [classes.unmodified]: status === 'NOT_MODIFIED',
          [classes.highlight]:
            status === 'MODIFIED' || status === 'NEW' || originalIndex !== id,
          [classes.disabled]: status === 'PENDING_DELETION' || disabled,
        })}
      >
        <Grid
          item
          style={{
            paddingLeft: 8,
            width: xsDown ? '50%' : '30%',
            overflowWrap: 'break-word',
          }}
          aria-label={`Label: ${label}`}
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
        </Grid>
        <Hidden lgDown>
          <Grid
            item
            style={{ width: '10%' }}
            aria-label={`Protocol: ${protocol}`}
          >
            {protocol}
            <ConditionalError errors={errors} formField="protocol" />
          </Grid>
        </Hidden>
        <Hidden smDown>
          <Grid item style={{ width: '10%' }} aria-label={`Ports: ${ports}`}>
            {ports === '1-65535' ? 'All Ports' : ports}
            <ConditionalError errors={errors} formField="ports" />
          </Grid>
          <Grid
            item
            style={{ width: '15%' }}
            aria-label={`Addresses: ${addresses}`}
          >
            {addresses}{' '}
            <ConditionalError errors={errors} formField="addresses" />
          </Grid>
        </Hidden>
        <Grid item style={{ width: '5%' }} aria-label={`Action: ${action}`}>
          {capitalize(action?.toLocaleLowerCase() ?? '')}
        </Grid>
        <Grid item style={{ marginLeft: 'auto' }}>
          {status !== 'NOT_MODIFIED' ? (
            <div className={classes.undoButtonContainer}>
              <button
                className={classNames({
                  [classes.undoButton]: true,
                  [classes.highlight]: status !== 'PENDING_DELETION',
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
        </Grid>
      </Grid>
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

export const PolicyRow: React.FC<PolicyRowProps> = React.memo((props) => {
  const { category, policy, disabled, handlePolicyChange } = props;
  const classes = useStyles();

  // Calculate how many cells the text should span so that the Select lines up
  // with the Action column
  const theme: Theme = useTheme();
  const xsDown = useMediaQuery(theme.breakpoints.down('sm'));
  const mdDown = useMediaQuery(theme.breakpoints.down('lg'));
  const colSpan = xsDown ? 3 : mdDown ? 5 : 7;

  const helperText = mdDown ? (
    <strong>{capitalize(category)} policy:</strong>
  ) : (
    <span>
      <strong>Default {category} policy:</strong> This policy applies to any
      traffic not covered by the {category} rules listed above.
    </span>
  );

  return (
    <Grid
      container
      className={classNames(
        classes.policyRow,
        classes.unmodified,
        classes.ruleRow
      )}
      tabIndex={0}
    >
      <Grid item xs={colSpan} className={classes.policyText}>
        {helperText}
      </Grid>
      <Grid item xs={4} className={classes.policySelect}>
        <Select
          className={classes.policySelectInner}
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
      </Grid>
    </Grid>
  );
});

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
