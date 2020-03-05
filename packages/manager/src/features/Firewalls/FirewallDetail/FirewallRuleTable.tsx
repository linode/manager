import { FirewallRuleType } from 'linode-js-sdk/lib/firewalls';
import * as React from 'react';
import ActionMenu from 'src/components/ActionMenu/ActionMenu';
import AddNewLink from 'src/components/AddNewLink';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import OrderBy from 'src/components/OrderBy';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableSortCell from 'src/components/TableSortCell';
import capitalize from 'src/utilities/capitalize';
import { v4 } from 'uuid';
import {
  generateAddressesLabel,
  generateRuleLabel,
  predefinedFirewallFromRule as ruleToPredefinedFirewall
} from '../shared';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row'
  }
}));

type Category = 'inbound' | 'outbound';

interface RuleRow {
  type: string;
  protocol: string;
  ports: string;
  addresses: string;
  id: string;
}

interface Props {
  category: Category;
  rules: FirewallRuleType[];
}

type CombinedProps = Props;

const FirewallRuleTable: React.FC<CombinedProps> = props => {
  const { category, rules } = props;

  const classes = useStyles();

  const addressColumnLabel =
    category === 'inbound' ? 'sources' : 'destinations';

  const rowData = firewallRuleToRowData(rules);

  return (
    <>
      <div className={classes.header}>
        <Typography variant="h2">{`${capitalize(category)} Rules`}</Typography>
        <AddNewLink
          // @todo: Use real handlers.
          onClick={() => alert("This doesn't do anything yet.")}
          label={`Add an ${capitalize(category)} Rule`}
        />
      </div>
      <OrderBy data={rowData} orderBy={'type'} order={'asc'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <Table isResponsive={false}>
            <TableHead>
              <TableRow>
                <TableSortCell
                  active={orderBy === 'type'}
                  label="type"
                  direction={order}
                  handleClick={handleOrderChange}
                >
                  Type
                </TableSortCell>
                <TableSortCell
                  active={orderBy === 'protocol'}
                  label="protocol"
                  direction={order}
                  handleClick={handleOrderChange}
                >
                  Protocol
                </TableSortCell>
                <TableSortCell
                  active={orderBy === 'ports'}
                  label="ports"
                  direction={order}
                  handleClick={handleOrderChange}
                >
                  Port Range
                </TableSortCell>
                <TableSortCell
                  active={orderBy === 'addresses'}
                  label="addresses"
                  direction={order}
                  handleClick={handleOrderChange}
                >
                  {capitalize(addressColumnLabel)}
                </TableSortCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {orderedData.length === 0 ? (
                <TableRowEmptyState colSpan={5} />
              ) : (
                orderedData.map((ruleRow: RuleRow, idx) => {
                  const { id, type, protocol, ports, addresses } = ruleRow;

                  return (
                    <TableRow key={id}>
                      <TableCell>{type}</TableCell>
                      <TableCell>{protocol}</TableCell>
                      <TableCell>{ports}</TableCell>
                      <TableCell>{addresses}</TableCell>
                      <TableCell>
                        {/* Mocked for now. */}
                        <ActionMenu
                          createActions={() => []}
                          ariaLabel="Action menu for Firewall rule"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </OrderBy>
    </>
  );
};

export default React.memo(FirewallRuleTable);

/**
 * Transforms a FirewallRuleType to the higher-level RuleRow. We do this so
 * downstream components don't have worry about transforming individual pieces
 * of data. This also allows us to sort each column of the RuleTable.
 */
export const firewallRuleToRowData = (
  firewallRules: FirewallRuleType[]
): RuleRow[] => {
  return firewallRules.map(thisRule => {
    const ruleType = ruleToPredefinedFirewall(thisRule);

    return {
      type: generateRuleLabel(ruleType),
      protocol: thisRule.protocol,
      addresses: generateAddressesLabel(thisRule.addresses),
      ports: thisRule.ports,
      id: v4()
    };
  });
};
