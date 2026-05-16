const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Exclude temp dirs that cause ENOENT watcher crashes
config.resolver.blockList = [
  /.*@firebase\+database.*_tmp_\d+.*/,
  /.*firebase[/\\]database.*_tmp_\d+.*/,
  /.*node_modules[/\\]\.vite[/\\].*/,
];

module.exports = config;
