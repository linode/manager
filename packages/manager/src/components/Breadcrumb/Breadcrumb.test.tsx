import { cleanup, render } from '@testing-library/react';
import * as React from 'react';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { Breadcrumb, CombinedProps as BreadCrumbProps } from './Breadcrumb';

const props: BreadCrumbProps = {
  classes: {
    root: '',
    preContainer: '',
    crumbsWrapper: '',
    crumb: '',
    noCap: '',
    crumbLink: '',
    labelWrapper: '',
    labelText: '',
    labelSubtitle: '',
    editableContainer: '',
    prefixComponentWrapper: '',
    slash: '',
    firstSlash: ''
  },
  pathname: '/linodes/9872893679817/test/lastcrumb'
};

afterEach(cleanup);

describe('Breadcrumb component', () => {
  it('contains the appropriate number of link text', () => {
    const { getAllByTestId } = render(wrapWithTheme(<Breadcrumb {...props} />));
    expect(getAllByTestId('link-text')).toHaveLength(3);
  });

  it('removes a crumb given the corresponding prop', () => {
    const { getAllByTestId } = render(
      wrapWithTheme(<Breadcrumb {...props} removeCrumbX={2} />)
    );
    expect(getAllByTestId('link-text')).toHaveLength(2);
  });

  it('renders an editable text field given editable props', () => {
    const { queryByTestId } = render(
      wrapWithTheme(
        <Breadcrumb
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
