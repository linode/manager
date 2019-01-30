import { parse } from 'qs';
import createMailto from './createMailto';

describe('mailto', () => {
  const mailto = createMailto('my-user-agent');

  it('is a mailto link', () => {
    expect(mailto.startsWith('mailto:')).toBeTruthy();
  });

  it('includes correct recipient email address', () => {
    const recipient = mailto.split('?')[0].split(':')[1];
    expect(recipient).toBe('feedback@linode.com');
  });

  it('contains a subject', () => {
    const queryString = parse(mailto.split('?')[1]);
    expect(queryString).toHaveProperty(
      'Subject',
      'Cloud Manager User Feedback'
    );
  });

  it('contains a body', () => {
    const queryString = parse(mailto.split('?')[1]);
    expect(queryString).toHaveProperty('Body', '\n\nmy-user-agent');
  });

  it("doesn't include body if user agent is bad input", () => {
    expect(createMailto('')).toBe(
      'mailto:feedback@linode.com?Subject=Cloud%20Manager%20User%20Feedback'
    );
    expect(createMailto(21 as any)).toBe(
      'mailto:feedback@linode.com?Subject=Cloud%20Manager%20User%20Feedback'
    );
    expect(createMailto(true as any)).toBe(
      'mailto:feedback@linode.com?Subject=Cloud%20Manager%20User%20Feedback'
    );
    expect(createMailto(undefined as any)).toBe(
      'mailto:feedback@linode.com?Subject=Cloud%20Manager%20User%20Feedback'
    );
    expect(createMailto(null as any)).toBe(
      'mailto:feedback@linode.com?Subject=Cloud%20Manager%20User%20Feedback'
    );
  });
});
