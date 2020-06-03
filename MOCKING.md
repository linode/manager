# Mocking data

This guide covers various methods of mocking data while developing or testing Cloud Manager.

## Mocking APIv4

_Coming soon: tutorial on factories and intercepting network requests._

## Mocking feature flags

Cloud Manager uses [LaunchDarkly](https://github.com/launchdarkly/react-client-sdk) for feature flag management.

To run Cloud Manager without feature flags enabled, either:

- Run the app without `REACT_APP_LAUNCH_DARKLY_ID` defined in `.env`, or:
- [Block network requests](https://developers.google.com/web/updates/2017/04/devtools-release-notes#block-requests) to `*launchdarkly*`.

To run Cloud Manager with _specific values_ assigned to feature flags:

1. Open `src/containers/withFeatureFlagProvider.container.ts`.
2. Supply an `options.bootstrap` map to `withLDProvider`.

**Example:**

```js
options: {
  bootstrap: {
    isFeatureEnabled: false; // <-- Supply flags here.
  }
}
```
