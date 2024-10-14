module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^models/(.*)$": "<rootDir>/src/models/$1", // Maps model imports correctly
    "^websockets/(.*)$": "<rootDir>/src/websockets/$1", // Maps websockets directory
    "^services/(.*)$": "<rootDir>/src/services/$1", // Maps services directory (this is the missing part)
  },
};
