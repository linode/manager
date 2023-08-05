import * as React from 'react';

import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LandingHeader } from './LandingHeader';

describe('LandingHeader', () => {
  it('should render a title', () => {
    const { getByText } = renderWithTheme(
      <LinodeThemeWrapper>
        <LandingHeader title="My Title" />
      </LinodeThemeWrapper>
    );
    expect(getByText('My Title')).toBeInTheDocument();
  });

  it('should render breadcrumbProps pathname', () => {
    renderWithTheme(
      <LinodeThemeWrapper>
        <LandingHeader
          breadcrumbProps={{
            pathname: '/my/path/to/somewhere',
          }}
        />
      </LinodeThemeWrapper>
    );

    expect(document.body.textContent).toMatch(/my/);
    expect(document.body.textContent).toMatch(/path/);
    expect(document.body.textContent).toMatch(/to/);
    expect(document.body.textContent).toMatch(/somewhere/);
  });

  it('should render title over breadcrumb pathname', () => {
    renderWithTheme(
      <LinodeThemeWrapper>
        <LandingHeader
          breadcrumbProps={{
            pathname: '/my/path/to/somewhere',
          }}
          title="My Title"
        />
      </LinodeThemeWrapper>
    );

    expect(document.body.textContent).toMatch(/my/);
    expect(document.body.textContent).toMatch(/path/);
    expect(document.body.textContent).toMatch(/to/);
    expect(document.body.textContent).not.toMatch(/somewhere/);
    expect(document.body.textContent).toMatch(/My Title/);
  });

  it('should render a create button', () => {
    const { getByText } = renderWithTheme(
      <LinodeThemeWrapper>
        <LandingHeader
          createButtonText="Create My Entity"
          onButtonClick={() => null}
        />
      </LinodeThemeWrapper>
    );
    expect(getByText('Create My Entity')).toBeInTheDocument();
  });

  it('should render a docs link', () => {
    const { getByText } = renderWithTheme(
      <LinodeThemeWrapper>
        <LandingHeader
          docsLabel="Docs"
          docsLink="https://www.linode.com/docs/products/compute/compute-instances/faqs/"
        />
      </LinodeThemeWrapper>
    );
    expect(getByText('Docs')).toBeInTheDocument();
  });

  it('should render extra actions', () => {
    const { getByText } = renderWithTheme(
      <LinodeThemeWrapper>
        <LandingHeader
          extraActions={<button>Extra Action</button>}
          onButtonClick={() => null}
        />
      </LinodeThemeWrapper>
    );
    expect(getByText('Extra Action')).toBeInTheDocument();
  });

  it('should render a disabled create button', () => {
    const { getByText } = renderWithTheme(
      <LinodeThemeWrapper>
        <LandingHeader
          createButtonText="Create My Entity"
          disabledCreateButton
          onButtonClick={() => null}
        />
      </LinodeThemeWrapper>
    );

    expect(getByText('Create My Entity').closest('button')).toBeDisabled();
  });

  it('should render custom crumb path based removeCrumbX prop', () => {
    const { getByText } = renderWithTheme(
      <LinodeThemeWrapper>
        <LandingHeader
          breadcrumbProps={{
            pathname: '/my/path/to/somewhere',
          }}
          removeCrumbX={1}
        />
      </LinodeThemeWrapper>
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
      <LinodeThemeWrapper>
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
      </LinodeThemeWrapper>
    );

    expect(document.body.textContent).toMatch(/My First Crumb/);
    expect(document.body.textContent).toMatch(/path/);
    expect(document.body.textContent).toMatch(/to/);
    expect(document.body.textContent).toMatch(/somewhere/);
    expect(document.body.textContent).not.toMatch(/my/);
  });
});
