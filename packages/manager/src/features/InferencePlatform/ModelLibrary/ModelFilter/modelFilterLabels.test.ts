import { CTX_MAX, CTX_MIN, formatContextLabel } from './MaxContextFilter';
import { formatParamLabel, PARAM_MAX, PARAM_MIN } from './ParametersFilter';

// ---------------------------------------------------------------------------
// formatParamLabel
// ---------------------------------------------------------------------------

describe('formatParamLabel', () => {
  it('returns "All sizes" when both min and max are the defaults', () => {
    expect(formatParamLabel(PARAM_MIN, PARAM_MAX)).toBe('All sizes');
  });

  it('returns a formatted range string for non-default values', () => {
    expect(formatParamLabel(6, 100)).toBe('6B – 100B');
  });

  it('returns a formatted range when only the min differs from default', () => {
    expect(formatParamLabel(6, PARAM_MAX)).toBe(`6B – ${PARAM_MAX}B`);
  });

  it('returns a formatted range when only the max differs from default', () => {
    expect(formatParamLabel(PARAM_MIN, 100)).toBe(`${PARAM_MIN}B – 100B`);
  });
});

// ---------------------------------------------------------------------------
// formatContextLabel
// ---------------------------------------------------------------------------

describe('formatContextLabel', () => {
  it('returns "All sizes" when both min and max are the defaults', () => {
    expect(formatContextLabel(CTX_MIN, CTX_MAX)).toBe('All sizes');
  });

  it('returns a formatted range string for non-default values', () => {
    expect(formatContextLabel(32, 128)).toBe('32K – 128K');
  });

  it('returns a formatted range when only the min differs from default', () => {
    expect(formatContextLabel(32, CTX_MAX)).toBe(`32K – ${CTX_MAX}K`);
  });

  it('returns a formatted range when only the max differs from default', () => {
    expect(formatContextLabel(CTX_MIN, 128)).toBe(`${CTX_MIN}K – 128K`);
  });
});
