/**
 * Block HTTP requests to domains needed by our analytics and monitoring scripts.
 *
 * This is intended to avoid sending data resulting from e.g. running our tests
 * against environments where analytics scripts are present.
 */
export const blockAnalytics = () => {
  const blockPatterns = [
    // Akamai mPulse.
    'https://*.akstat.io/*',
    'https://*.akstat.io/**/*',
    'https://*.go-mpulse.net/**/*',

    // Akamai (Unknown).
    'https://*.akamaihd.net/**/*',

    // Sentry
    'https://*.ingest.sentry.io/**/*',

    // Adobe Analytics/DTM
    'https://*.adobedtm.com/**/*',

    // New Relic
    'https://js-agent.newrelic.com/*',
    'https://js-agent.newrelic.com/**/*',
    'https://bam.nr-data.net/**/*',
  ];

  beforeEach(() => {
    blockPatterns.forEach((pattern) => {
      cy.intercept(
        {
          method: '*',
          url: pattern,
        },
        (req) => {
          req.destroy();
        }
      );
    });
  });
};
