// const { createDefaultPreset } = require("ts-jest");

import { createDefaultPreset } from 'ts-jest';

const tsJestTransformCfg = createDefaultPreset({
    tsconfig: 'tsconfig.test.json',
}).transform;

/** @type {import("jest").Config} **/
export default {
    roots: ['<rootDir>/src'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    testEnvironment: 'node',
    transform: {
        ...tsJestTransformCfg,
    },
};
