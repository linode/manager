/**
 * @file Constants related to Cypress's handling of LaunchDarkly feature flags.
 */

// LaunchDarkly URL pattern for feature flag retrieval.
export const launchDarklyUrlPattern =
  'https://app.launchdarkly.com/sdk/evalx/*/contexts/*';

// LaunchDarkly URL pattern for feature flag / event streaming.
export const launchDarklyClientstreamPattern =
  'https://clientstream.launchdarkly.com/eval/*/*';
