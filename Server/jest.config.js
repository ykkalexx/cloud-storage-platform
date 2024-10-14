module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^models/(.*)$": "<rootDir>/src/models/$1", // Update <rootDir>/src/models/ to match the actual path in your project
  },
};
