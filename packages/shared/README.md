# Shared Feature Component Library

`@linode/shared` contains definitions for React-based feature components and hooks that are used frequently across Akamai Connected Cloud Manager.

In contrast to the other libraries, [`@linode/ui`](../ui/) and [`@linode/utilities`](../utilities/) in this repository, components and hooks in this package make use of [`@linode/api-v4`](../api-v4/), [`@linode/queries`](../queries/) and other dependencies to implement common, opinionated and complex components to enable a seamless experience for users as they navigate between features of the app.

## Components

All components defined in this library must conform to the [CDS 2.0 design system](https://github.com/linode/design-language-system) and be built using base components from [`@linode/ui`](../ui/).

Interfaces must be documented using the [TSDoc](https://tsdoc.org/) comment standard. This repository also includes support for Storybook stories and Vitest unit tests, which may be included as necessary to improve component quality and reliability.

## Hooks

The hooks defined in this library are intended to provide functionality that is too complex or not "pure" enough to be placed in `@linode/utilities`. These hooks are used to implement feature-specific logic and are designed for use within React components.