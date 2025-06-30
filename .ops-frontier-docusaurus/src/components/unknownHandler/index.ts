import type { Element } from "hast";
import type { Text } from 'hast';
 
const own = {}.hasOwnProperty;

// To avoid that any "element" type node is converted to <div> element
// by [defaultUnknownHandler of mdast-util-to-hast](https://github.com/syntax-tree/mdast-util-to-hast/blob/f511a93817b131fb73419bf7d24d73a5b8b0f0c2/lib/state.js#L404-L420),
// we need to define our own unknownHandler which does not convert "element" type node.
function unknownHandler(state, node) {
  if (node.type === "element") {
    return node;
  }
  const data = node.data || {};
  const result: Element | Text =
    "value" in node &&
    !(own.call(data, "hProperties") || own.call(data, "hChildren"))
      ? { type: "text", value: node.value }
      : {
          type: "element",
          tagName: "div",
          properties: {},
          children: state.all(node),
        };

  state.patch(node, result);
  return state.applyData(node, result);
}

export default unknownHandler;
