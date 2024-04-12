const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

// TODO:  Local source plugins link

// const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
// const path = require('path');
// const fs = require('fs');

// // Simplify the process of getting directories within 'plugins'
// function getPluginDirectories(pluginsPath) {
//   return fs.readdirSync(pluginsPath).filter(pluginDir => {
//     const fullPath = path.join(pluginsPath, pluginDir);
//     return fs.statSync(fullPath).isDirectory();
//   }).map(dir => path.join(pluginsPath, dir));
// }

// // Define plugins directory path
// const pluginsPath = path.resolve(__dirname, '../plugins');
// const pluginDirectories = getPluginDirectories(pluginsPath);

// // Create the custom configuration
// const customConfig = {
//   resolver: {
//     extraNodeModules: pluginDirectories.reduce((acc, dir) => {
//       const moduleName = path.basename(dir); // Assuming directory name is the module name
//       acc[moduleName] = dir;
//       return acc;
//     }, {}),
//   },
//   watchFolders: pluginDirectories,
// };

// // Merge the custom configuration with the default configuration
// module.exports = mergeConfig(getDefaultConfig(__dirname), customConfig);
