"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.single = exports.sequential = exports.reduce = exports.parallel = exports.mapRequestResolvers = exports.empty = void 0;
var RequestBlock_ = _interopRequireWildcard(require("./internal/blockedRequests.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * @since 2.0.0
 */

/**
 * @since 2.0.0
 * @category constructors
 */
const single = exports.single = RequestBlock_.single;
/**
 * @since 2.0.0
 * @category constructors
 */
const empty = exports.empty = RequestBlock_.empty;
/**
 * @since 2.0.0
 * @category constructors
 */
const mapRequestResolvers = exports.mapRequestResolvers = RequestBlock_.mapRequestResolvers;
/**
 * @since 2.0.0
 * @category constructors
 */
const parallel = exports.parallel = RequestBlock_.par;
/**
 * @since 2.0.0
 * @category constructors
 */
const reduce = exports.reduce = RequestBlock_.reduce;
/**
 * @since 2.0.0
 * @category constructors
 */
const sequential = exports.sequential = RequestBlock_.seq;
//# sourceMappingURL=RequestBlock.js.map