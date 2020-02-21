import { FirewallRuleType } from 'linode-js-sdk/lib/firewalls';
import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import OrderBy from 'src/components/OrderBy';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import { firewallRuleFactory } from 'src/factories/firewalls';
import capitalize from 'src/utilities/capitalize';

const MOCK_RULES = firewallRuleFactory.buildList(4);

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row'
  }
}));

type RuleType = 'inbound' | 'outbound';

interface Props {
  ruleType: RuleType;
}

type CombinedProps = Props;

const FirewallRuleTable: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  return (
    <>
      <div className={classes.header}>
        <Typography variant="h2">{`${capitalize(
          props.ruleType
        )} Rules`}</Typography>
        <AddNewLink
          onClick={() => null}
          label={`Add an ${capitalize(props.ruleType)} Rule`}
        />
      </div>
      <OrderBy data={MOCK_RULES} orderBy={'type'} order={'asc'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <Table>
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
                  label="port range"
                  direction={order}
                  handleClick={handleOrderChange}
                >
                  Port Range
                </TableSortCell>
                <TableSortCell
                  active={orderBy === 'sources'}
                  label="sources"
                  direction={order}
                  handleClick={handleOrderChange}
                >
                  Sources
                </TableSortCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {orderedData.map((rule: FirewallRuleType, idx) => {
                return (
                  <TableRow key={idx}>
                    <TableCell>TYPE</TableCell>
                    <TableCell>{rule.protocol}</TableCell>
                    <TableCell>{rule.ports}</TableCell>
                    <TableCell>
                      {JSON.stringify(rule.addresses, null, 2)}
                    </TableCell>
                    <TableCell>(action menu)</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </OrderBy>
    </>
  );
};

export default FirewallRuleTable;
