---
parent: Development Guide
---

# Local Dev Tools

To facilitate development and debugging, Cloud Manager includes a "Dev Tools" mode. Currently this mode is used for feature flag toggling, data mocking, and environment switching.

This mode is enabled by default while running the development server. To disable it, add `?dev-tools=false` to the URL, or write `dev-tools: false` to local storage.

This mode is disabled by default in production builds, but can be enabled by adding `?dev-tools=true` to the URL, or `dev-tools: true` to local storage.

## Writing a new tool

Local Dev Tools features are simply React Components that are rendered by `packages/manager/src/dev-tools/dev-tools.tsx`. They can do things like: manage state, read from the Redux store, write to the Redux store, make API calls, etc. Commonly they will render a checkbox or another form of user input.

Styles for the Local Dev Tools are included in `/dev-tools.css`.

To add a dev tool feature without checking it into source control, create a file in `src/dev-tools` ending in `.local.tsx`. This is useful for environment switching, user switching, etc.
