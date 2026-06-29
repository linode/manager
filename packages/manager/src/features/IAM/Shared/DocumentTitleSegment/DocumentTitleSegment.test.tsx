import * as React from 'react';

import { renderWithProviders } from '../../utilities/testHelpers';
import { DocumentTitleSegment } from './DocumentTitleSegment';

const Parent = () => {
  return (
    <>
      <DocumentTitleSegment segment="Identity and Access" />
      <DocumentTitleSegment segment="SSO Enforcement" />
    </>
  );
};

describe('IAM DocumentTitleSegment', () => {
  it('updates the document title independently for IAM routes', () => {
    renderWithProviders(<Parent />);

    expect(document.title).toEqual(
      'SSO Enforcement | Identity and Access | Akamai Cloud Manager'
    );
  });
});
