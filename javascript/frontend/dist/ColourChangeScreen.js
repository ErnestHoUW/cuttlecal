"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _qrcode = _interopRequireDefault(require("qrcode.react"));
var _axios = _interopRequireDefault(require("axios"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const ColorChangeScreen = ({
  apiUrl
}) => {
  const [colorList, setColorList] = (0, _react.useState)([]); // Store the color list
  const [currentColor, setCurrentColor] = (0, _react.useState)([255, 255, 255]); // Initial color is white
  const [pointer, setPointer] = (0, _react.useState)(0); // Pointer for color cycling

  (0, _react.useEffect)(() => {
    // Fetch colors from API
    _axios.default.get(apiUrl).then(res => {
      setColorList(res.data);
    }).catch(err => {
      console.log(err);

      // On API failure, use default color sequence
      setColorList([[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 0, 0], [0, 255, 0], [0, 0, 255]]);
    });

    // Start color cycling
    const intervalId = setInterval(() => {
      setPointer(pointer => (pointer + 1) % colorList.length);
    }, 50);

    // Clear interval on cleanup
    return () => clearInterval(intervalId);
  }, [colorList.length]);
  (0, _react.useEffect)(() => {
    if (colorList.length > 0) {
      setCurrentColor(colorList[pointer]);
    }
  }, [pointer, colorList]);
  let rgbColor = `rgb(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]})`;
  let qrValue = JSON.stringify(currentColor);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
    style: {
      backgroundColor: rgbColor,
      height: '100vh',
      width: '100%'
    },
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_qrcode.default, {
      value: qrValue,
      size: 128,
      level: "H",
      includeMargin: false,
      bgColor: "#FFFFFF",
      style: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
    })
  });
};
ColorChangeScreen.propTypes = {
  apiUrl: _propTypes.default.string.isRequired
};
var _default = ColorChangeScreen;
exports.default = _default;