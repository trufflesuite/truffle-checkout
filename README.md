# Truffle Checkout

Truffle Checkout is a command line tool to make developing Truffle more easily. It will create a workspace with which to develop Truffle and manage individual modules on specific branches.

## Install

```
$ npm install -g truffle-checkout
```

## Usage

Note: make sure you've removed any globally installed truffle packages, or the `npm link` will fail.

```
# Download, checkout, link, and `npm install` all of the truffle modules
$ tc init

# Install a specific version of a package with
$ tc truffle:develop truffle-contract:my-branch

# Checkout :org/:branch in all modules; useful for reviewing cross-cutting changes
$ tc workon :org :branch

# List all modules and their status
$ tc list

# Build symlinks between all packages. Run this in case of repair.
$ tc link
```

## Start Here

```
$ mkdir truffle && cd truffle
$ tc init
```

By default `tc` will clone and install `truffle`, then clone, install and link all dependencies of `truffle` that exist within the `trufflesuite` Github organization into a single workspace.

## Branch Selectors

You can specify optional branch selectors when installing packages with Truffle Checkout.

There are two types of selectors: recursive selectors and one-off selectors. Examples:

1. Recursive selector. This will install `truffle` package and clone/install all relevant dependencies, switching both `truffle` and all dependencies to the `develop` branch.

    ```
    tc use truffle:develop
    ```

2. One-off selector. This will install the `truffle-contract` package and clone/all all relevant dependencies. Here, `truffle-contract` will be switched to the `json-schema` branch, but its dependencies will either be left alone (if already installed), or will default to the main branch of their repository, usually `master`.

    ```
    tc use truffle-contract@json-schema
    ```

You can also mix selectors. For instance, the following will install `truffle` and all of its dependencies at the `develop` branch, but leave `truffle-contract` at the `json-schema` branch:

```
tc use truffle:develop truffle-contract@json-schema
```

## Reviewing Cross-Cutting Changes

Imagine that someone sends a pull request to 3 separate truffle modules. You'll need to check out each branch in turn to set up your local environment in order to review their changes.

Assuming that all of the branches have the same name, you can use

```
tc switch <org> <branch>
```

which will `git remote add`, `git fetch`, `git checkout`, `git pull`, and `git branch` for each module (if necessary/available).
