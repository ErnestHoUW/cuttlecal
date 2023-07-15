module.exports = {
    transform: {
      '^.+\\.jsx?$': 'babel-jest',
    },
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // mock static file such as .css for Jest 
    },
    transformIgnorePatterns: ['/node_modules/(?!qrcode.react|axios)'],
    testEnvironment: 'jsdom',
  };