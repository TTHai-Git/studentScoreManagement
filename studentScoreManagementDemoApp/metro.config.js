// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// // Thêm cấu hình tùy chỉnh của bạn ở đây nếu cần thiết
// config.transformer = {
//   ...config.transformer,
//   babelTransformerPath: require.resolve('react-native-babel-transformer')
// };

// config.resolver = {
//   ...config.resolver,
//   sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'] // Add other extensions if necessary
// };

module.exports = config;
