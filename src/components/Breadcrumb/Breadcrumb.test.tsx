import * as React from 'react';
import { cleanup, render } from 'react-testing-library';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { Breadcrumb, CombinedProps as BreadCrumbProps } from './Breadcrumb';

const customCrumbs = [
  'First Crumb',
  'Second Crumb',
  'Third Crumb',
  'Fourth Crumb'
];

const props: BreadCrumbProps = {
  classes: {
    root: '',
    preContainer: '',
    crumbsWrapper: '',
    crumb: '',
    lastCrumb: '',
    crumbLink: '',
    labelWrapper: '',
    labelText: '',
    labelSubtitle: '',
    editableContainer: '',
    prefixComponentWrapper: '',
    slash: '',
    firstSlash: ''
  }
};

afterEach(cleanup);

describe('Breadcrumb component', () => {
  it('contains the appropriate number of link text', () => {
    const { getAllByTestId } = render(
      wrapWithTheme(<Breadcrumb allCustomCrumbs={customCrumbs} {...props} />)
    );
    expect(getAllByTestId('link-text')).toHaveLength(customCrumbs.length - 1);
  });

  it('removes a crumb given the corresponding prop', () => {
    const { getAllByTestId } = render(
      wrapWithTheme(
        <Breadcrumb
          allCustomCrumbs={customCrumbs}
          {...props}
          removeCrumbX={2}
        />
      )
    );
    expect(getAllByTestId('link-text')).toHaveLength(customCrumbs.length - 2);
  });

  it('renders an editable text field given editable props', () => {
    const { queryByTestId } = render(
      wrapWithTheme(
        <Breadcrumb
          allCustomCrumbs={customCrumbs}
          {...props}
          onEditHandlers={{
            editableTextTitle: 'Editable text',
            onEdit: jest.fn(),
            onCancel: jest.fn()
          }}
        />
      )
    );
    expect(queryByTestId('editable-text')).toBeInTheDocument();
  });
});
