import { Button } from '@linode/ui';
import { render, screen, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import * as React from 'react';

import {
  assertOrder,
  baseStore,
  getShadowRootElement,
  mockMatchMedia,
  renderWithTheme,
  renderWithThemeAndFormik,
  renderWithThemeAndHookFormContext,
  renderWithThemeAndRouter,
  resizeScreenSize,
  withMarkup,
  wrapWithStore,
  wrapWithTableBody,
} from './testHelpers';

describe('testHelpers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('mockMatchMedia', () => {
    it('should mock window.matchMedia', () => {
      mockMatchMedia();
      expect(window.matchMedia).toBeDefined();
      const result = window.matchMedia('(min-width: 600px)');
      expect(result.matches).toBe(true);
    });
  });

  describe('resizeScreenSize', () => {
    it('should set window.matchMedia with the given width', () => {
      resizeScreenSize(1024);
      const result = window.matchMedia('(min-width: 1000px)');
      expect(result.matches).toBe(true);
    });
  });

  describe('baseStore', () => {
    it('should create a store with merged state', () => {
      const customStore = { someKey: 'someValue' };
      const store = baseStore(customStore as any);
      expect(store.getState()).toEqual(expect.objectContaining(customStore));
    });
  });

  describe('renderWithTheme', () => {
    it('should render the component with theme', () => {
      const { container, getByText } = renderWithTheme(<Button>Test</Button>);

      expect(container.firstChild).toHaveClass('MuiButtonBase-root');

      expect(getByText('Test')).toBeInTheDocument();
    });
  });

  describe('renderWithThemeAndRouter', () => {
    it('should render the component with theme and router', async () => {
      const TestComponent = () => <div>Test</div>;
      const { getByText, router } = await renderWithThemeAndRouter(
        <TestComponent />
      );

      expect(router.state.location.pathname).toBe('/');

      await waitFor(() => {
        router.navigate({
          params: { betaId: 'beta' },
          to: '/betas/signup/$betaId',
        });
      });

      expect(router.state.location.pathname).toBe('/betas/signup/beta');
      expect(getByText('Test')).toBeInTheDocument();
    });
  });

  describe('wrapWithStore', () => {
    it('should wrap the component with Redux store', () => {
      const TestComponent = () => <div>Test</div>;
      const wrapped = wrapWithStore({ children: <TestComponent /> });
      render(wrapped);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('wrapWithTableBody', () => {
    it('should wrap the component with table and tbody', () => {
      const TestComponent = () => (
        <tr>
          <td>Test</td>
        </tr>
      );
      const wrapped = wrapWithTableBody(<TestComponent />);
      render(wrapped);
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('Test').closest('table')).toBeInTheDocument();
    });
  });

  describe('renderWithThemeAndFormik', () => {
    it('renders the component within Formik context', () => {
      const TestComponent = () => (
        <Formik
          initialValues={{ testInput: 'initial value' }}
          onSubmit={() => {}}
        >
          {({ handleSubmit, values }) => (
            <form onSubmit={handleSubmit}>
              <input
                name="testInput"
                readOnly
                type="text"
                value={values.testInput || ''}
              />
              <button type="submit">Submit</button>
            </form>
          )}
        </Formik>
      );

      const { container } = renderWithThemeAndFormik(<TestComponent />, {
        initialValues: { testInput: 'initial value' },
        onSubmit: vi.fn(),
      });

      expect(container.querySelector('form')).toBeInTheDocument();
      expect(container.querySelector('input[name="testInput"]')).toHaveValue(
        'initial value'
      );
      expect(
        container.querySelector('button[type="submit"]')
      ).toBeInTheDocument();
    });
  });

  describe('renderWithThemeAndHookFormContext', () => {
    it('should render the component with theme and react-hook-form', () => {
      const TestComponent = () => <div>Test</div>;
      const { getByText } = renderWithThemeAndHookFormContext({
        component: <TestComponent />,
      });
      expect(getByText('Test')).toBeInTheDocument();
    });
  });

  describe('withMarkup', () => {
    it('should find text with markup', () => {
      const { getByText } = render(
        <div>
          <span>Hello</span> World
        </div>
      );
      const getTextWithMarkup = withMarkup(getByText);
      expect(getTextWithMarkup('Hello World')).toBeInTheDocument();
    });
  });

  describe('assertOrder', () => {
    it('should assert the order of elements', () => {
      const { container } = render(
        <div>
          <p data-testid="el1">First</p>
          <p data-testid="el2">Second</p>
          <p data-testid="el3">Third</p>
        </div>
      );
      expect(() =>
        assertOrder(container, '[data-testid]', ['First', 'Second', 'Third'])
      ).not.toThrow();
      expect(() =>
        assertOrder(container, '[data-testid]', ['Third', 'Second', 'First'])
      ).toThrow();
    });
  });

  describe('getShadowRootElement', () => {
    let host: HTMLElement;

    beforeEach(() => {
      host = document.createElement('div');
      document.body.appendChild(host);
    });

    afterEach(() => {
      document.body.removeChild(host);
    });

    it('should resolve with null if the Shadow DOM is not attached', async () => {
      const result = await getShadowRootElement<HTMLButtonElement>(
        host,
        'button'
      );
      expect(result).toBeNull();
    });

    it('should resolve with the element if it already exists in the Shadow DOM', async () => {
      const shadowRoot = host.attachShadow({ mode: 'open' });
      const button = document.createElement('button');
      button.textContent = 'Click Me';
      shadowRoot.appendChild(button);

      const result = await getShadowRootElement<HTMLButtonElement>(
        host,
        'button'
      );
      expect(result).toBe(button);
      expect(result?.textContent).toBe('Click Me');
    });

    it('should resolve with the element when it is added to the Shadow DOM later', async () => {
      const shadowRoot = host.attachShadow({ mode: 'open' });

      setTimeout(() => {
        const button = document.createElement('button');
        button.textContent = 'Click Me';
        shadowRoot.appendChild(button);
      }, 100);

      const result = await getShadowRootElement<HTMLButtonElement>(
        host,
        'button'
      );
      expect(result).not.toBeNull();
      expect(result?.textContent).toBe('Click Me');
    });

    it('should disconnect the MutationObserver after resolving', async () => {
      const shadowRoot = host.attachShadow({ mode: 'open' });
      const observerSpy = vi.spyOn(MutationObserver.prototype, 'disconnect');

      setTimeout(() => {
        const button = document.createElement('button');
        shadowRoot.appendChild(button);
      }, 100);

      await getShadowRootElement<HTMLButtonElement>(host, 'button');
      expect(observerSpy).toHaveBeenCalled();
      observerSpy.mockRestore();
    });
  });
});
