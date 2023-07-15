"use strict";

var _react = require("@testing-library/react");
var _msw = require("msw");
var _node = require("msw/node");
var _ColourChangeScreen = _interopRequireDefault(require("./ColourChangeScreen"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const generateRandomRGBColours = n => {
  let colors = [];
  for (let i = 0; i < n; i++) {
    colors.push([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)]);
  }
  return colors;
};
const server = (0, _node.setupServer)(_msw.rest.get('/test-endpoint', (req, res, ctx) => {
  return res(ctx.json(generateRandomRGBColours(1000)));
}));
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
test('sends correct API request', async () => {
  (0, _react.render)( /*#__PURE__*/React.createElement(_ColourChangeScreen.default, {
    apiUrl: "/test-endpoint"
  }));
  await (0, _react.waitFor)(() => expect(_react.screen.getByRole('img')).toBeInTheDocument());
});