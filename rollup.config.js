import { copyFileSync, readFileSync } from 'node:fs';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const replacer = replace({
  preventAssignment: true,
  values: { __VERSION__: pkg.version },
});

const banner = `
/**
 *  ${pkg.name} - v${pkg.version}
 *  @author ${pkg.author.name}
 *  @license ${pkg.license}
 *  @url ${pkg.homepage}
 */`;

function copyToDist() {
    return {
        closeBundle: () => {
            copyFileSync('./LICENSE.txt', './dist/LICENSE.txt');
            console.log(`[Y]: copied license to dist/`);
            copyFileSync('./package.json', './dist/package.json');
            console.log(`[Y]: copied package.json to dist/`);
            copyFileSync('./source/interface.ts', './dist/viteshell.d.ts');
            console.log(`[Y]: copied typings to dist/`);
        },
    };
}

export default [
    {
        input: 'out/index.js',
        output: {
            name: 'ViteShell',
            file: pkg.browser,
            format: 'umd',
            banner,
        },
        plugins: [
            replacer,
            commonjs(),
            resolve(),
            babel({ babelHelpers: 'bundled' }),
            terser(),
        ],
    },
    {
        input: 'out/index.js',
        output: {
            file: pkg.module,
            format: 'esm',
            banner,
        },
        plugins: [
            replacer, 
            commonjs(),
            resolve(),
            terser(), 
            copyToDist()
        ],
    },
];