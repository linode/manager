# Cloud Manager Dev Tools

To facilitate development and debugging, Cloud Manager includes a "Dev Tools" mode. Currently the only feature this mode includes is a toggle for the "CMR" feature flag, though it can be extended to other feature flags, mock data, environments, etc.

This mode is enabled by default while running the development server. To disable it, add `?dev-tools=false` to the URL, or `dev-tools: false` to local storage.

This mode is disabled by default in production builds, but can be enabled by adding `?dev-tools=true` to the URL, or `dev-tools: true` to local storage.

To add a dev tool feature without checking it into source control, create a file in `src/dev-tools` ending in `.local.tsx`. This is useful for environment switching, user switching, etc.
