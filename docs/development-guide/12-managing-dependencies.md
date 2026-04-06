# Managing Dependencies

Dependencies are managed with [pnpm](https://pnpm.io/).

## Installing new dependencies

First, consider if you _definitely need_ to install the dependency. Basic utilities like string capitalization, extended array methods, etc. should generally be written by hand to avoid unnecessary reliance on third-party libraries to keep the bundle size low.

If the library features you are after would require a lot of effort to write and test yourself, installing a well-tested and well-adopted open-source library is a good option.

To install a dependency, simply add the package to the appropriate `package.json` and run `pnpm install` from the root level of the repo. pnpm will automatically update `pnpm-lock.yaml` and add the library code to `node_modules/`.

## Updating dependencies

To update a dependency, simply update its version number in the appropriate `package.json` and run `pnpm install` from the root level of the repo.

### Security patches

If a _direct dependency_ gets a security patch, it's usually easy to update it using the instructions above.

If a _sub-dependency_ (dependency of a dependency) gets a security patch, first we must see which of our direct dependencies uses it. Running `pnpm why -r <dependency_name>` and looking through `pnpm-lock.yaml` is a good way to do this.

The best case scenario here is that all packages in the dependency tree have been updated to accept the security patch, and we can update the direct dependency using the instructions above.

More often this will not be the case, however, and we'll need to force pnpm to resolve to the patched version using the `resolutions` field in `package.json`. Depending on the situation, you will need to update one or all of the `package.json` files in this repo.
