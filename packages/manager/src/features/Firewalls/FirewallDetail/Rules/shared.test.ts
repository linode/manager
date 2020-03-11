import { parseFirewallRuleError } from './shared';

const generateError = (field: string) => ({
  reason: 'An error occurred.',
  field
});

describe('', () => {
  it('returns `null` when no field', () => {
    expect(parseFirewallRuleError({ reason: 'Error!' })).toBeNull();
  });

  const error = generateError('rules.inbound[0].ports');

  it('includes the reason', () => {
    expect(parseFirewallRuleError(error)).toHaveProperty(
      'reason',
      'An error occurred.'
    );
  });

  it('parses the category', () => {
    expect(
      parseFirewallRuleError(generateError('rules.inbound[0].ports'))
    ).toHaveProperty('category', 'inbound');
    expect(
      parseFirewallRuleError(generateError('rules.outbound[0].ports'))
    ).toHaveProperty('category', 'outbound');
  });

  it('parses the rule index', () => {
    expect(parseFirewallRuleError(error)).toHaveProperty('idx', 0);
  });

  it('parses the form field', () => {
    expect(
      parseFirewallRuleError(generateError('rules.inbound[0].ports'))
    ).toHaveProperty('formField', 'ports');
    expect(
      parseFirewallRuleError(generateError('rules.inbound[0].protocol'))
    ).toHaveProperty('formField', 'protocol');
    expect(
      parseFirewallRuleError(generateError('rules.inbound[0].addresses'))
    ).toHaveProperty('formField', 'addresses');
  });

  it('parses IPs', () => {
    const ipv4Error = generateError('rules.inbound[0].addresses.ipv4[1]');
    const ipv4Result = parseFirewallRuleError(ipv4Error);
    expect(ipv4Result).toHaveProperty('ip');
    expect(ipv4Result!.ip).toHaveProperty('type', 'ipv4');
    expect(ipv4Result!.ip).toHaveProperty('idx', 1);

    const ipv6Error = generateError('rules.inbound[0].addresses.ipv6[1]');
    const ipv6Result = parseFirewallRuleError(ipv6Error);
    expect(ipv6Result).toHaveProperty('ip');
    expect(ipv6Result!.ip).toHaveProperty('type', 'ipv6');
    expect(ipv6Result!.ip).toHaveProperty('idx', 1);
  });
});
