# eslint-diff

Run eslint only on files present in a diff set

## Install

Wraps around the eslint in your project so make sure to have `eslint` installed as well.

```
npm install eslint @gertt/eslint-diff
```

## Usage

Instead of executing `eslint`, you can run `eslint-diff` with all the same arguments. There is one extra `git` option besides the options supported by `eslint`.

The `git` option lets you specify the commit against which the working directory is compared to generate a list of changes. It defaults to `HEAD`.

If you pass any files, dirs or glob patterns to eslint, changes that are not included in those arguments will not be linted either.

```
# Simply lint all new and changed files since the last commit in your current branch
eslint-diff

# Lint againt changes between master and your working directory
eslint-diff --git master

# Lint againt changes between a specific commit and your working directory
eslint-diff --git 77c1c1f28437c25cf4370fa9cda344930152972e

# Lint against changes in the src folder
eslint-diff src

# You can pass regular eslint options as well
eslint-diff src --fix
```


