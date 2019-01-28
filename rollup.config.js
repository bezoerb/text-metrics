import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import {terser} from 'rollup-plugin-terser';

import pkg from './package.json';

export default [
  // CommonJS
  {
    input: 'src/index.js',
    output: {file: 'lib/text-metrics.js', format: 'cjs', indent: false},
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    plugins: [babel()],
  },

  // ES
  {
    input: 'src/index.js',
    output: {file: 'es/text-metrics.js', format: 'es', indent: false},
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    plugins: [babel()],
  },

  // ES for Browsers
  {
    input: 'src/index.js',
    output: {file: 'es/text-metrics.mjs', format: 'es', indent: false},
    plugins: [
      nodeResolve({
        jsnext: true,
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },

  // UMD Development
  {
    input: 'src/index.js',
    output: {
      file: 'dist/text-metrics.js',
      format: 'umd',
      name: 'textMetrics',
      indent: false,
    },
    plugins: [
      nodeResolve({
        jsnext: true,
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
    ],
  },

  // UMD Production
  {
    input: 'src/index.js',
    output: {
      file: 'dist/text-metrics.min.js',
      format: 'umd',
      name: 'textMetrics',
      indent: false,
    },
    plugins: [
      nodeResolve({
        jsnext: true,
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },

  // UMD Development (compatibility)
  {
    input: 'src/index.compat.js',
    output: {
      file: 'dist/text-metrics.compat.js',
      format: 'umd',
      name: 'textMetrics',
      indent: false,
    },
    plugins: [
      nodeResolve({
        jsnext: true,
        main: true,
        browser: true,
      }),
      commonjs({include: 'node_modules/**'}),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [
          [
            '@babel/env',
            {
              targets: {
                ie: '11',
              },
              modules: false,
              useBuiltIns: 'usage', //enables babel and import babel into your inputFile.js
            },
          ],
        ],
        plugins: ['@babel/proposal-object-rest-spread'],
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
    ],
  },

  // UMD Production (compatibility)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/text-metrics.compat.min.js',
      format: 'umd',
      name: 'textMetrics',
      indent: false,
    },
    plugins: [
      nodeResolve({
        jsnext: true,
        main: true,
        browser: true,
      }),
      commonjs({include: 'node_modules/**'}),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [
          [
            '@babel/env',
            {
              targets: {
                ie: '11',
              },
              modules: false,
              useBuiltIns: 'usage', //enables babel and import babel into your inputFile.js
            },
          ],
        ],
        plugins: ['@babel/proposal-object-rest-spread'],
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },
];
