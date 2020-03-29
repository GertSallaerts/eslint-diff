#!/usr/bin/env node

const parseArgs = require('minimist');
const flatten = require('lodash/flatten');
const uniq = require('lodash/uniq');
const Git = require('nodegit');
const glob = require('glob');
const spawn = require('cross-spawn');
const Path = require('path');

const {
    git = 'HEAD',
    _: eslintGlobs,
    ...eslintConfig
} = parseArgs(process.argv.slice(2));

const CWD = process.cwd();

const ESLINT_CLI = Path.resolve(CWD + '/node_modules/.bin/eslint');
const ESLINT_OPTIONS = flatten(Object.keys(eslintConfig).map(key => {
    const value = eslintConfig[key];

    if (value === true)
        return [ `--${key}` ];
    else
        return [ `--${key}`, value ];
}));

async function getChangedFiles(fromHash) {
    const repo = await Git.Repository.open(CWD);
    const from = await repo.getReferenceCommit(fromHash).then(c => c.getTree());
    const diff = await Git.Diff.treeToWorkdirWithIndex(repo, from);
    const status = await repo.getStatus();
    const patches = await diff.patches();

    const changes = uniq(flatten([
        // new, untracked files
        status.filter(c => c.isNew()).map(c => c.path()),

        // changes in tracked files
        flatten(patches.map(p => ([
            p.newFile().path(),
            p.oldFile().path()
        ]))),
    ]));

    return changes.map(file => Path.resolve(CWD, file));
}

function getWatchedFiles(eslintGlobs) {
    return uniq(flatten(eslintGlobs.map(g => glob.sync(g, { realpath: true }))));
}

function getFilesIntersection(watched, changed) {
    return changed.filter(c => watched.some(w => c.indexOf(w) === 0));
}

Promise.all([
    getWatchedFiles(eslintGlobs),
    getChangedFiles(git),
])
    .then(([ watched, changed ]) => getFilesIntersection(watched, changed))
    .then(files => {
        if (!files.length) {
            console.log('No files changed.');
            process.exit(0);
        }

        return spawn.sync(ESLINT_CLI, [
            ...ESLINT_OPTIONS,
            ...files
        ], { stdio: 'inherit' })
    })
    .then(result => process.exit(result.status))
    .catch(err => console.log(err) || process.exit(1));
