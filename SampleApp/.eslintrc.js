module.exports = {
  root: true,
  env: {
    "browser": true,
    "jest": true,
  },
  parser: 'babel-eslint',
  plugins: [
    'flowtype',
    "react",
    "react-native",
  ],
  extends: [
    'airbnb',
    "plugin:flowtype/recommended"
  ],
  rules: {
    "class-methods-use-this": 0,
    "global-require": 0,
    "import/prefer-default-export": 0,
    "max-len": [
      2,
      150
    ],
    "no-restricted-syntax": ["error", "LabeledStatement", "WithStatement"],
    "object-curly-newline": 0,
    "prefer-object-spread": 0,
    "react/destructuring-assignment": [
      "error",
      "always",
      {
        "ignoreClassFields": true
      }
    ],
    "react/jsx-filename-extension": [
      1,
      {
        "extensions": [".js", ".jsx"]
      }
    ],
    "react/jsx-closing-bracket-location": [  // enforce the closing bracket location for JSX multiline elements
      2,
      {
        "selfClosing": "line-aligned",
        "nonEmpty": "after-props"
      }
    ],
    "react/jsx-first-prop-new-line": 0,
    "react/jsx-no-bind": 0,
    "react/prop-types": 0,
    "react/sort-comp": 0,
    "react/state-in-constructor": 0,
  }
};
