import * as React from 'react';
import { describe, expect, it } from 'vitest';

import {
  childrenContainsNoText,
  flattenChildrenIntoAriaLabel,
  opensInNewTab,
} from './link';

describe('opensInNewTab', () => {
  it('should return true for URLs starting with "http"', () => {
    expect(opensInNewTab('http://example.com')).not.toBe(null);
    expect(opensInNewTab('https://www.example.com')).not.toBe(null);
    expect(opensInNewTab('http://sub.example.com')).not.toBe(null);
  });

  it('should return true for mailto links', () => {
    expect(opensInNewTab('mailto:contact@example.com')).not.toBe(null);
    expect(opensInNewTab('mailto:support@example.com')).not.toBe(null);
  });

  it('should return false for other URLs', () => {
    expect(opensInNewTab('ftp://example.com')).toBe(null);
    expect(opensInNewTab('tel:+1234567890')).toBe(null);
    expect(opensInNewTab('/local-route')).toBe(null);
  });
});

describe('flattenChildrenIntoAriaLabel', () => {
  it('should return a string if `children` is of type string', () => {
    const children = 'This is a string';
    expect(flattenChildrenIntoAriaLabel(children)).toBe('This is a string');
  });

  it('should flatten single-level children into a single string', () => {
    const children = <span>Text content</span>;
    expect(flattenChildrenIntoAriaLabel(children)).toBe('Text content');
  });

  it('should flatten nested children into a single string', () => {
    const children = (
      <>
        <div>First</div>
        <div>
          <p>Second</p>
          <span>Third</span>
        </div>
      </>
    );
    expect(flattenChildrenIntoAriaLabel(children)).toBe('First Second Third');
  });
});

describe('childrenContainsNoText', () => {
  it('should return true if children contain no text', () => {
    const noTextChildren = (
      <>
        <div />
        <span />
      </>
    );
    expect(childrenContainsNoText(noTextChildren)).toBe(true);
  });

  it('should return false if children contain text', () => {
    const textChildren = (
      <>
        <div>Text</div>
        <span>Content</span>
        <p>{'With Text'}</p>
      </>
    );
    expect(childrenContainsNoText(textChildren)).toBe(false);
  });

  it('should return true if children are not valid React elements', () => {
    const invalidChildren = {};
    const emptyArray: React.ReactNode[] = [];
    // @ts-expect-error we are testing an invalid input
    expect(childrenContainsNoText(invalidChildren)).toBe(true);
    expect(childrenContainsNoText(emptyArray)).toBe(true);
  });
});
