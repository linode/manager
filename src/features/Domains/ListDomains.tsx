import * as React from 'react';
import { Link } from 'react-router-dom';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, WithStyles, withStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import Tags from 'src/components/Tags';
import ActionMenu from './DomainActionMenu';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  data: Linode.Domain[];
  orderBy: string;
  order: 'asc' | 'desc';
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
  onRemove: (domain: string, domainID: number) => void;
  onClone: (domain: string, cloneId: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ListDomains: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    data, orderBy, order, handleOrderChange,
  } = props;
  return (
    <Paginate data={data} pageSize={25}>
      {({ data: paginatedData, count, handlePageChange, handlePageSizeChange, page, pageSize }) => (
        <React.Fragment>
          <Paper>
            <Table aria-label="List of your Domains">
              <TableHead>
                <TableRow>
                  <TableSortCell
                    active={orderBy === 'domain'}
                    label="domain"
                    direction={order}
                    handleClick={handleOrderChange}
                    data-qa-domain-name-header
                  >
                    Domain
                </TableSortCell>
                  <TableSortCell
                    data-qa-domain-type-header
                    active={orderBy === 'type'}
                    label="type"
                    direction={order}
                    handleClick={handleOrderChange}
                  >
                    Type
                  </TableSortCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                <RenderData
                  data={paginatedData}
                  onClone={props.onClone}
                  onRemove={props.onRemove}
                  classes={props.classes}
                />
              </TableBody>
            </Table>
          </Paper>
          <PaginationFooter
            count={count}
            page={page}
            pageSize={pageSize}
            handlePageChange={handlePageChange}
            handleSizeChange={handlePageSizeChange}
            eventCategory="domains landing"
          />

        </React.Fragment>
      )}
    </Paginate>
  );
};

interface RenderDataProps {
  data: Linode.Domain[];
  onRemove: (domain: string, domainID: number) => void;
  onClone: (domain: string, cloneId: number) => void;
  classes: any;
}

const RenderData: React.StatelessComponent<RenderDataProps> = (props) => {
  const { data, onClone, onRemove, classes } = props;

  return (
    <>
      {
        data.map(domain =>
          <TableRow
            key={domain.id}
            data-qa-domain-cell={domain.id}
            className={`${classes.domainRow} ${'fade-in-table'}`}
            rowLink={`/domains/${domain.id}`}
          >
            <TableCell parentColumn="Domain" data-qa-domain-label>
              <Link to={`/domains/${domain.id}`}>
                {domain.domain}
                <div className={classes.tagWrapper}>
                  <Tags tags={domain.tags} />
                </div>
              </Link>
            </TableCell>
            <TableCell parentColumn="Type" data-qa-domain-type>{domain.type}</TableCell>
            <TableCell>
              <ActionMenu
                domain={domain.domain}
                id={domain.id}
                onRemove={onRemove}
                onClone={onClone}
              />
            </TableCell>
          </TableRow>,
        )
      }
    </>
  );
}

const styled = withStyles(styles);

export default styled(ListDomains);
