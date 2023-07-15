"use strict";

var _react = _interopRequireDefault(require("react"));
var _react2 = require("@testing-library/react");
var _msw = require("msw");
var _node = require("msw/node");
var _ColourChangeScreen = _interopRequireDefault(require("./ColourChangeScreen"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const generateRandomRGBColors = n => {
  let colors = [];
  for (let i = 0; i < n; i++) {
    colors.push([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)]);
  }
  return colors;
};
const server = (0, _node.setupServer)(_msw.rest.get('/test-endpoint', (req, res, ctx) => {
  return res(ctx.json(generateRandomRGBColors(1000)));
}));
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
test('sends correct API request', async () => {
  (0, _react2.render)( /*#__PURE__*/(0, _jsxRuntime.jsx)(_ColourChangeScreen.default, {
    apiUrl: "/test-endpoint"
  }));
  await (0, _react2.waitFor)(() => expect(_react2.screen.getByRole('img')).toBeInTheDocument());
});