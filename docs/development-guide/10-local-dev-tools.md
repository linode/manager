# Local Dev Tools

To facilitate development and debugging, Cloud Manager includes a "Dev Tools" mode. Currently this mode is used for feature flag toggling, data mocking, and theme & environment switching.

In order to access the dev tools, hover or click (mobile) on the 🛠 icon in the lower left corner of your browser window. The icon will be colored green if MSW is enabled.

This mode is enabled by default while running the development server. To disable it, add `?dev-tools=false` to the URL, or write `dev-tools: false` to local storage.

This mode is disabled by default in production builds.

## Feature Flags

The display of the Flags in dev tools is defined in the `options` array in `FeatureFlagTool.tsx`. While it is convenient to add those switches to the dev tools, it is not always necessary as they can clutter the UI. Additionally, it is important to clean them up once the feature has been battle tested in production.

The flags on/off values are stored in local storage for convenience and will be remembered on reload or app restart.

By default, the boolean flags checkboxes represent their true values as returned by Launch Darkly (dev environment). Hitting the reset button will bring them back to those default values and clear local storage.

## MSW Tools

Please refer to the [Mocking Data](https://github.com/linode/manager/blob/develop/docs/development-guide/09-mocking-data.md) section of this documentation to get familiar with the usage of these tools.

## Writing a new tool

Local Dev Tools features are simply React Components that are rendered by `packages/manager/src/dev-tools/dev-tools.tsx`. They can do things like: manage state, read from the Redux store, write to the Redux store, make API calls, etc. Commonly they will render a checkbox or another form of user input.

Styles for the Local Dev Tools are included in `/dev-tools.css`.

To add a dev tool feature without checking it into source control, create a file in `src/dev-tools` ending in `.local.tsx`. This is useful for environment switching, user switching, etc.
