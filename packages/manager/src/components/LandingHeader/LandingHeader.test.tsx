import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { LandingHeader } from './LandingHeader';

describe('LandingHeader', () => {
  it('should render a title', () => {
    const { getByText } = renderWithTheme(<LandingHeader title="My Title" />);
    expect(getByText('My Title')).toBeInTheDocument();
  });

  it('should render breadcrumbProps pathname', () => {
    renderWithTheme(
      <LandingHeader
        breadcrumbProps={{
          pathname: '/my/path/to/somewhere',
        }}
      />
    );

    expect(document.body.textContent).toMatch(/my/);
    expect(document.body.textContent).toMatch(/path/);
    expect(document.body.textContent).toMatch(/to/);
    expect(document.body.textContent).toMatch(/somewhere/);
  });

  it('should render title over breadcrumb pathname', () => {
    renderWithTheme(
      <LandingHeader
        breadcrumbProps={{
          pathname: '/my/path/to/somewhere',
        }}
        title="My Title"
      />
    );

    expect(document.body.textContent).toMatch(/my/);
    expect(document.body.textContent).toMatch(/path/);
    expect(document.body.textContent).toMatch(/to/);
    expect(document.body.textContent).not.toMatch(/somewhere/);
    expect(document.body.textContent).toMatch(/My Title/);
  });

  it('should render a create button', () => {
    const { getByText } = renderWithTheme(
      <LandingHeader
        createButtonText="Create My Entity"
        onButtonClick={() => null}
      />
    );
    expect(getByText('Create My Entity')).toBeInTheDocument();
  });

  it('should render a docs link', () => {
    const { getByText } = renderWithTheme(
      <LandingHeader
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/faqs-for-compute-instances"
      />
    );
    expect(getByText('Docs')).toBeInTheDocument();
  });

  it('should render extra actions', () => {
    const { getByText } = renderWithTheme(
      <LandingHeader
        extraActions={<button>Extra Action</button>}
        onButtonClick={() => null}
      />
    );
    expect(getByText('Extra Action')).toBeInTheDocument();
  });

  it('should render a disabled create button', () => {
    const { getByText } = renderWithTheme(
      <LandingHeader
        createButtonText="Create My Entity"
        disabledCreateButton
        onButtonClick={() => null}
      />
    );

    expect(getByText('Create My Entity').closest('button')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('should render custom crumb path based removeCrumbX prop', () => {
    const { getByText } = renderWithTheme(
      <LandingHeader
        breadcrumbProps={{
          pathname: '/my/path/to/somewhere',
        }}
        removeCrumbX={1}
      />
    );

    expect(document.body.textContent).not.toMatch(/my/);
    expect(document.body.textContent).toMatch(/path/);
    expect(document.body.textContent).toMatch(/to/);
    expect(document.body.textContent).toMatch(/somewhere/);
    expect(getByText('path')).toBeInTheDocument();
    expect(getByText('to')).toBeInTheDocument();
    expect(getByText('somewhere')).toBeInTheDocument();
  });

  it('should render custom crumb path based removeCrumbX prop', () => {
    renderWithTheme(
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'My First Crumb',
              linkTo: '/someRoute',
              noCap: true,
              position: 1,
            },
          ],
          pathname: '/my/path/to/somewhere',
        }}
      />
    );

    expect(document.body.textContent).toMatch(/My First Crumb/);
    expect(document.body.textContent).toMatch(/path/);
    expect(document.body.textContent).toMatch(/to/);
    expect(document.body.textContent).toMatch(/somewhere/);
    expect(document.body.textContent).not.toMatch(/my/);
  });
});
