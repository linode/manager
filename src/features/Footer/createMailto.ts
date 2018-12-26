const createMailto = (userAgent: string): string => {
  const recipient = 'feedback@linode.com';
  const subject = 'Cloud Manager User Feedback';

  let mailto = `mailto:${recipient}?Subject=${encodeURIComponent(subject)}`;

  if (userAgent && typeof userAgent === 'string') {
    const body = `\n\n${userAgent}`;
    mailto += `&Body=${encodeURIComponent(body)}`;
  }

  return mailto;
};

export default createMailto;