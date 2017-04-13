import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { TableCell } from '~/components/tables/cells';


describe('components/tables/cells/TableCell', function () {
  let tableCell;

  beforeEach(function () {
    tableCell = mount(
      <TableCell
        column={{}}
        record={{}}
      />
    );
  });

  it('should be defined', function () {
    expect(TableCell).to.be.defined;
    expect(tableCell).to.be.defined;
    expect(tableCell.find('.Table-cell').length).to.equal(1);
  });

  it('should accept className from props', function () {
    tableCell = mount(
      <TableCell
        className="example"
        column={{}}
        record={{}}
      />
    );

    expect(tableCell.find('.example').length).to.equal(1);
  });

  it('should accept a className from the column configuration', function () {
    tableCell = mount(
      <TableCell
        column={{
          className: 'example',
        }}
        record={{}}
      />
    );

    expect(tableCell.find('.example').length).to.equal(1);
  });

  it('should accept arbitrary child elements', function () {
    tableCell = mount(
      <TableCell
        column={{
          className: 'example',
        }}
        record={{}}
      >
        <div>Example Child</div>
      </TableCell>
    );

    expect(tableCell.children('div').first().length).to.equal(1);
    expect(tableCell.children('div').first().text()).to.equal('Example Child');
  });

  it('should render a child value from record dataKey lookup', function () {
    tableCell = mount(
      <TableCell
        column={{
          dataKey: 'value',
        }}
        record={{
          value: 10,
        }}
      />
    );

    expect(tableCell.text()).to.equal('10');
  });

  it('should call an optional format fn to be used in value rendering', function () {
    const spy = sinon.spy();
    tableCell = mount(
      <TableCell
        column={{
          formatFn: spy,
        }}
        record={{}}
      />
    );

    expect(spy.callCount).to.equal(1);
  });

  it('should render children based on returned values from a format fn', function () {
    tableCell = mount(
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

    expect(tableCell.text()).to.equal('Value: 10');
  });
});
