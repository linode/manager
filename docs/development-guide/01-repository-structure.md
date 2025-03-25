# Repository Structure

The linode/manager repository is a monorepo that houses three packages:

- **api-v4** (Linode API JavaScript wrapper, published on NPM)
- **manager** (Cloud Manager, i.e. cloud.linode.com)
- **validation** (validation schemas used to validate API requests)

The **manager** package is dependent on the **api-v4** package, which is itself dependent on the **validation** package.

The repo has a root level `package.json` which defines project-level scripts, hooks, and dependencies. The code for dependencies shared across projects are hoisted up to the root-level `/node_modules` directory. There is a single `pnpm-lock.yaml` file for the repo which lives at the root level.

Any files relevant to the entire project or repo should be included at the root level. Files belonging to a specific package belong in `/packages/<package_name>`.

## api-v4

The application code for the api-v4 package lives in `/src`. From there, each section of the API has its own directory, e.g. `/account`, `/domains`, `/linodes`, etc.

Each subdirectory typically has:

- A file with the API request methods (e.g. `account.ts`)
- A file defining the associated TypeScript types and interfaces, called `types.ts`
- An `index.ts` file that exports everything defined in the subdirectory

If there are multiple resource types in one section of the API, there may be multiple files containing API requests methods, for example, in `/src/linodes/`:

- `actions.ts`
- `backups.ts`
- `configs.ts`
- `disks.ts`
- ...etc.

There are also a few key files in the /src directory of the api-v4 package:

- constants.ts (package-wide constants, like API_ROOT)
- index.ts (exports everything from the package)
- request.ts (the nuts and bolts of making an API request, utilizing axios for XHR requests)
- types.ts (package-wide TypeScript types and interfaces, like APIError)

The TypeScript files are compiled to the `/lib` directory, and compiled + minified to the root level `index.js`.

## validation

The validation package contains Yup schemas for validating requests made through the api-v4 package. Its structure is similar to api-v4, though it is smaller.

The `/src` directory is flat and contains many "<resource_type>.schema.ts" files, as well as an index file that exports everything, and a `constants` file with package-wide constants.

Like api-v4, TypeScript files are compiled to /lib and compiled + minified to index.ts.

## manager

A few notable directories in the root level of the manager package:

- **/build**
  - where the app is compiled to after running `pnpm build` (gitignored)
- **/config**
  - configuration for unit tests
- **/cypress**
  - end-to-end tests
- **/e2e**
  - old end-to-end tests [deprecated]
- **/public**
  - assets, fonts, HTML, and third-party JS
- **/scripts**
  - setup and startup scripts
- **/src**
  - application code

In `/src` there are several important files on the directory root:

- **App.tsx**
  - the container for the React application
- **constants.ts**
  - app-wide constants, either read from the environment or defined directly
- **events.ts and eventsPolling.ts**
  - events polling logic (events come from the /account/events endpoint and drive many behaviors throughout the app)
- **featureFlags.ts**
  - TypeScript types and interfaces corresponding to the feature flags we expect from LaunchDarkly (our third-party feature flagging service)
- **index.tsx**
  - the entry point for the React app; uses `ReactDOM.render()` to render the app to `./public/index.html`
- **MainContent.tsx**
  - routes for major sections of the app
- **request.tsx**
  - base-level request methods, responsible for injecting a user's access token to all API requests and intercepting errors
- **session.ts**
  - methods for handling session management
- **foundations/themes.ts and utilities/themes.ts**
  - app-wide styles

The /src directory has several subdirectories:

- **/data**
  - static mocked data for unit tests, not used as much anymore since we introduced dynamic factories
- **/assets**
  - icons, svgs, etc
- **/cachedData**
  - data that is cached at build-time and shipped with the app
- **/components**
  - reusable React components
- **/containers**
  - higher-order components that wrap other components with data, often using react-redux's `connect()`. Not used as much anymore since we've been moving to React Query for data fetching.
- **/dev-tools**
  - custom Cloud Manager dev tools, usefully during development
- **/factories**
  - dynamic factories (via factory-ts) to produce data for unit tests
- **/features**
  - the React application code
- **/hooks**
  - reusable React hooks (variety of uses)
- **/layouts**
  - screens related to major flows such as authentication
- **/mocks**
  - code powering the mock service worker, which allows easy mocking of the API during development
- **/queries**
  - code that uses react-query and the api-v4 package to fetch data from the API
- **/store**
  - redux actions, reducers, thunks
- **/types**
  - miscellaneous type declarations
- **/utilities**
  - miscellaneous reusable utility functions, e.g. `capitalize.ts`

## Where to go for common tasks

### "I want to…"

**"... consume data from a new API endpoint"**

1. Add the request handler and types in `/packages/api-v4`
2. If appropriate, add the schema to `/packages/validation`
3. Add a React Query hook in `/packages/manager/src/queries`
4. Use the new hook in a function component

**"... create a new, reusable component"**

1. Add a new directory (upper camel case) in `/packages/manager/src/components`
2. Author the React component, unit tests, and Storybook stories across four files:
   a. `<ComponentName>.tsx` (React component code)
   b. `<ComponentName>.test.tsx` (unit tests for the React component)
   c. `<ComponentName>.stories.mdx` (Storybook stories for the React component)
   d. `index.ts` (export the React component)

**"... implement a new feature in an existing section of the app"**

1. Find the appropriate code in `/packages/manager/src/features`
2. Modify existing components, add new components, etc.

**"... create an entirely new section of the app"**

1. Add a `<Route />` in `src/MainContent.tsx`
2. Add new section to the Primary Nav in `src/components/PrimaryNav`
3. Add a directory (upper camel case) in /packages/manager/src/features`
4. Add new feature components and corresponding tests

**"... change the styling of a specific feature component"**

1. Find where the styles are defined for the component you want to modify
   a. They are likely defined in the feature component's file, e.g. `src/features/<MyFeature>/<SomeComponent>.tsx`.
2. Avoid making changes in `src/index.css`, `src/foundations/themes/index.ts`, and unless you are intentionally making a global styling change.
3. Avoid making changes in `src/components/<ComponentName>` unless you are intentionally making a global styling change, or if the change cannot be made in the feature component file and the change can be controlled through props or composition.
