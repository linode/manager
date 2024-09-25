import { lazyRouteComponent } from '@tanstack/react-router';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { strictLazyRouteComponent } from './utils';

vi.mock('@tanstack/react-router', () => ({
  lazyRouteComponent: vi.fn((loader) => loader),
}));

describe('strictLazyRouteComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle default exports correctly', async () => {
    const DefaultComponent = () => <div>Default Component</div>;
    const mockImporter = vi.fn(() =>
      Promise.resolve({ default: DefaultComponent })
    );

    const result = strictLazyRouteComponent(mockImporter);
    expect(lazyRouteComponent).toHaveBeenCalledWith(expect.any(Function));

    const loadedComponent = await (result as any)();
    expect(loadedComponent).toEqual({ default: DefaultComponent });
  });

  it('should handle named exports correctly', async () => {
    const NamedComponent = () => <div>Named Component</div>;
    const mockImporter = vi.fn(() => Promise.resolve({ NamedComponent }));

    const result = strictLazyRouteComponent(mockImporter, 'NamedComponent');
    expect(lazyRouteComponent).toHaveBeenCalledWith(expect.any(Function));

    const loadedComponent = await (result as any)();
    expect(loadedComponent).toEqual({ default: NamedComponent });
  });

  it('should throw an error for non-existent named exports', async () => {
    const mockImporter = vi.fn(() =>
      Promise.resolve({ SomeOtherComponent: () => null })
    );

    const result = strictLazyRouteComponent(
      mockImporter,
      // @ts-expect-error - forcing the wrong type
      'NonExistentComponent'
    );
    await expect((result as any)()).rejects.toThrow(
      'Export "NonExistentComponent" not found in module'
    );
  });

  it('should throw an error for modules without default export when no name is provided', async () => {
    const mockImporter = vi.fn(() =>
      Promise.resolve({ SomeComponent: () => null })
    );

    // @ts-expect-error - forcing the wrong type
    const result = strictLazyRouteComponent(mockImporter);
    await expect((result as any)()).rejects.toThrow(
      'No default export found in module'
    );
  });

  it('should handle React.forwardRef components', async () => {
    const ForwardRefComponent = React.forwardRef(() => (
      <div>ForwardRef Component</div>
    ));
    const mockImporter = vi.fn(() =>
      Promise.resolve({ default: ForwardRefComponent })
    );

    const result = strictLazyRouteComponent(mockImporter);
    const loadedComponent = await (result as any)();
    expect(loadedComponent).toEqual({ default: ForwardRefComponent });
  });

  it('should handle React.memo components', async () => {
    const MemoComponent = React.memo(() => <div>Memo Component</div>);
    const mockImporter = vi.fn(() => Promise.resolve({ MemoComponent }));

    const result = strictLazyRouteComponent(mockImporter, 'MemoComponent');
    const loadedComponent = await (result as any)();
    expect(loadedComponent).toEqual({ default: MemoComponent });
  });

  it('should throw an error for non-component exports', async () => {
    const mockImporter = vi.fn(() =>
      Promise.resolve({ notAComponent: 'string' })
    );

    const result = strictLazyRouteComponent(mockImporter, 'notAComponent');
    await expect((result as any)()).rejects.toThrow(
      'Export "notAComponent" is not a valid React component'
    );
  });

  it('should handle async imports correctly', async () => {
    const AsyncComponent = () => <div>Async Component</div>;
    const mockImporter = vi.fn(() => Promise.resolve({ AsyncComponent }));

    const result = strictLazyRouteComponent(mockImporter, 'AsyncComponent');
    expect(lazyRouteComponent).toHaveBeenCalledWith(expect.any(Function));

    const loadedComponent = await (result as any)();
    expect(loadedComponent).toEqual({ default: AsyncComponent });
    expect(mockImporter).toHaveBeenCalledTimes(1);
  });

  it('should work with TypeScript generics', async () => {
    interface Props {
      name: string;
    }
    const GenericComponent: React.FC<Props> = ({ name }) => (
      <div>Hello, {name}</div>
    );
    const mockImporter = vi.fn(() => Promise.resolve({ GenericComponent }));

    const result = strictLazyRouteComponent(mockImporter, 'GenericComponent');
    const loadedComponent = await (result as any)();
    expect(loadedComponent).toEqual({ default: GenericComponent });
  });

  it('should throw a type error when no export name is provided for named exports', () => {
    const mockImporter = () => Promise.resolve({ NamedComponent: () => null });

    // @ts-expect-error - forcing the wrong type
    strictLazyRouteComponent(mockImporter);
  });

  it('should not throw a type error when no export name is provided for default exports', () => {
    const mockImporter = () => Promise.resolve({ default: () => null });

    // This should not throw a TypeScript error
    strictLazyRouteComponent(mockImporter);
  });
});
