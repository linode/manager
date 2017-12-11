import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import { TableCell } from 'linode-components';


describe('components/tables/cells/TableCell', function () {
  let tableCell;

  beforeEach(function () {
  });

  it('should render without error', () => {
    const wrapper = shallow(
      <TableCell
        className="example"
        column={{}}
        record={{}}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('should accept className from props', function () {
    tableCell = shallow(
      <TableCell
        className="example"
        column={{}}
        record={{}}
      />
    );

    expect(tableCell.find('.example').length).toBe(1);
  });

  it('should accept a className from the column configuration', function () {
    tableCell = shallow(
      <TableCell
        column={{
          className: 'example',
        }}
        record={{}}
      />
    );

    expect(tableCell.find('.example').length).toBe(1);
  });

  it('should accept arbitrary child elements', function () {
    tableCell = shallow(
      <TableCell
        column={{
          className: 'example',
        }}
        record={{}}
      >
        <div>Example Child</div>
      </TableCell>
    );

    expect(tableCell.children('div').first().length).toBe(1);
    expect(tableCell.children('div').first().text()).toBe('Example Child');
  });

  it('should render a child value from record dataKey lookup', function () {
    tableCell = shallow(
      <TableCell
        column={{
          dataKey: 'value',
        }}
        record={{
          value: 10,
        }}
      />
    );

    expect(tableCell.text()).toBe('10');
  });

  it('should call an optional format fn to be used in value rendering', function () {
    const spy = sinon.spy();
    tableCell = shallow(
      <TableCell
        column={{
          formatFn: spy,
        }}
        record={{}}
      />
    );

    expect(spy.callCount).toBe(1);
  });

  it('should render children based on returned values from a format fn', function () {
    tableCell = shallow(
      <TableCell
        column={{
          dataKey: 'value',
          formatFn: function (children) {
            return `Value: ${children}`;
          },
        }}
        record={{
          value: 10,
        }}
      />
    );

    expect(tableCell.text()).toBe('Value: 10');
  });
});
