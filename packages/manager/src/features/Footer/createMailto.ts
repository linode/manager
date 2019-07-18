const { VERSION } = process.env;

const createMailto = (userAgent?: string): string => {
  const recipient = 'feedback@linode.com';
  const subject = 'Cloud Manager User Feedback';

  let mailto = `mailto:${recipient}?Subject=${encodeURIComponent(subject)}`;
  let body = '';

  if (VERSION) {
    body += `\nCloud Manager Version: ${VERSION}`;
  }

  if (userAgent && typeof userAgent === 'string') {
    body += `\n${userAgent}`;
  }

  if (body) {
    const encodedBody = encodeURIComponent(`\n${body}`);
    mailto += `&Body=${encodedBody}`;
  }

  return mailto;
};

export default createMailto;
