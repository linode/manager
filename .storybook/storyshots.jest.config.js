  module.exports = {
    "rootDir": "../",
    "collectCoverageFrom": [
      "src/**/*.{js,jsx,ts,tsx}"
    ],

    "setupFiles": [
      "<rootDir>/config/polyfills.js"
    ],
    "setupFilesAfterEnv": ["<rootDir>/config/testSetup.js"],
    "testMatch": [
      "<rootDir>/src/**/__tests__/**/*.ts?(x)",
      "<rootDir>/src/**/?(*.)(spec|test).ts?(x)"
    ],
    "testEnvironment": "jest-environment-jsdom",
    "testURL": "http://manager-storybook",
    "transform": {
      "^.+\\.tsx?$": "<rootDir>/config/jest/typescriptTransform.js",
      "^.+\\.css$": "<rootDir>/config/jest/cssTransform.js",
      "^(?!.*\\.(js|jsx|mjs|css|json)$)": "<rootDir>/config/jest/fileTransform.js"
    },
    "transformIgnorePatterns": [
      "[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|ts|tsx)$"
    ],
    "moduleNameMapper": {
      "\\.svg$": "<rootDir>/src/components/NullComponent",
      "^react-native$": "react-native-web",
      "^src/(.*)": "<rootDir>/src/$1"
    },
    "moduleFileExtensions": [
      "mjs",
      "web.ts",
      "ts",
      "web.tsx",
      "tsx",
      "web.js",
      "js",
      "web.jsx",
      "jsx",
      "json",
      "node"
    ],
    "globals": {
      "ts-jest": {
        "tsConfigFile": "tsconfig.test.json"
      }
    }
  };
