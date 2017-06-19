# Truffle Checkout

Truffle Checkout is a command line tool to make developing Truffle more easily. It will create a workspace with which to develop Truffle and manage individual modules on specific branches.

## Install

```
$ npm install -g truffle-checkout
```

## Usage

```
$ tc [optional selectors]
```

By default `tc` will clone and install `truffle`, then clone, install and link all dependencies of `truffle` that exist within the `trufflesuite` Github organization into a single workspace. 

## Branch Selectors

You can specify optional branch selectors when installing packages with Truffle Checkout.

There are two types of selectors: recursive selectors and one-off selectors. Examples:

1. Recursive selector. This will install `truffle` package and clone/install all relevant dependencies, switching both `truffle` and all dependencies to the `develop` branch.

    ```
    tc truffle:develop
    ```

2. One-off selector. This will install the `truffle-contract` package and clone/all all relevant dependencies. Here, `truffle-contract` will be switched to the `json-schema` branch, but its dependencies will either be left alone (if already installed), or will default to the main branch of their repository, usually `master`.  

    ```
    tc truffle-contract@json-schema
    ```
    
You can also mix selectors. For instance, the following will install `truffle` and all of its dependencies at the `develop` branch, but leave `truffle-contract` at the `json-schema` branch:

```
tc truffle:develop truffle-contract@json-schema
```
