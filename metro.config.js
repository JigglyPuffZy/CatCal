const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const nodeModules = path.resolve(projectRoot, "node_modules");

const baseConfig = getDefaultConfig(projectRoot);

baseConfig.watchFolders = [projectRoot];

const config = withNativeWind(baseConfig, { input: "./global.css" });

// Re-apply after NativeWind wrapper — OneDrive paths can break hoisted resolution.
config.resolver.nodeModulesPaths = [nodeModules];
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  "react-native-worklets": path.join(nodeModules, "react-native-worklets"),
};

module.exports = config;
