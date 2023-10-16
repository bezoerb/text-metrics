const process = require('node:process');

const {NODE_ENV} = process.env;

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: ['> 5%'],
          node: '10',
        },
        exclude: ['transform-async-to-generator', 'transform-regenerator'],
        modules: false,
        loose: true,
      },
    ],
  ],
  plugins: [
    // Don't use `loose` mode here - need to copy symbols when spreading
    '@babel/proposal-object-rest-spread',
    NODE_ENV === 'test' && '@babel/transform-modules-commonjs',
  ].filter(Boolean),
};
