import assert from 'assert';
import YAML from 'yaml';
import { position } from "unist-util-position"
// import { unified } from 'unified'
// import rehypeParse from 'rehype-parse'
// import remarkStringify from 'remark-stringify'
import {fromHtml} from 'hast-util-from-html'

function processMultipleLines(text) {
  if (text) {
    const lines = text.split(/\n/)
    if (lines.length == 1 || lines[0].startsWith('<')) return text
    return `<details><summary>${lines[0]}</summary><div>${lines.slice(1).join(lines[1].startsWith('<')?'\n':'<br/>')}</div></details>`
  }
  return ""
}

function processTest(test, options) {
  const test_list = test.map((item) => {
    const procedure = item.procedure?`<b>テスト手順:</b><br/>${processMultipleLines(item.procedure)}<br/>`:''
    const expects = item.expects?`<b>期待される結果:</b><br/>${processMultipleLines(item.expects)}<br/>`:''
    const comments = item.comments?`<b>備考:</b><br/>${processMultipleLines(item.comments)}`:''
    return `<tr><td>${item.id || ""}</td><td>${processMultipleLines(item.spec)}</td><td>${statusClass(item.status)}</td><td>${procedure + expects + comments}</td></tr>\n`
  })
  return `<table class="test-spec"><thead><tr><td>ID</td><td>要件</td><td>状態</td><td>テスト手順など</td></tr></thead>\n<tbody>\n${test_list.join('\n')}</tbody></table>`
}

const statusClassMap = {
  '仕様待ち': 'waiting',
  '未実装': 'need-implement',
  '未テスト': 'need-test',
  'テスト不要': 'no-test',
  '実装不要': 'no-implement',
  'OK': 'ok',
  'NG': 'ng'
}
function statusClass(status) {
  const statusClassValue = statusClassMap[status]
  if (! statusClassValue) {
    throw new Error(`test status ${status} is not valid.`)
  }
  console.log(`status:${status} statusClassValue:${statusClassValue}`)
  return `<div class="${statusClassValue}">${status}</div>`
}

const testJson = {
    type: "mdxJsxFlowElement",
    name: "table",
    properties: { className: ["test-spec"] },
    children: [
        {
            type: "mdxJsxFlowElement",
            name: "thead",
            properties: {},
            children: [
                {
                    type: "mdxJsxFlowElement",
                    name: "tr",
                    properties: {},
                    children: [
                        {
                            type: "mdxJsxFlowElement",
                            name: "td",
                            properties: {},
                            children: [
                                {
                                    type: "text",
                                    value: "ID",
                                    position: {
                                        start: { line: 1, column: 41, offset: 40 },
                                        end: { line: 1, column: 43, offset: 42 },
                                    },
                                },
                            ],
                            position: {
                                start: { line: 1, column: 37, offset: 36 },
                                end: { line: 1, column: 48, offset: 47 },
                            },
                        },
                        {
                            type: "mdxJsxFlowElement",
                            name: "td",
                            properties: {},
                            children: [
                                {
                                    type: "text",
                                    value: "要件",
                                    position: {
                                        start: { line: 1, column: 52, offset: 51 },
                                        end: { line: 1, column: 54, offset: 53 },
                                    },
                                },
                            ],
                            position: {
                                start: { line: 1, column: 48, offset: 47 },
                                end: { line: 1, column: 59, offset: 58 },
                            },
                        },
                        {
                            type: "mdxJsxFlowElement",
                            name: "td",
                            properties: {},
                            children: [
                                {
                                    type: "text",
                                    value: "状態",
                                    position: {
                                        start: { line: 1, column: 63, offset: 62 },
                                        end: { line: 1, column: 65, offset: 64 },
                                    },
                                },
                            ],
                            position: {
                                start: { line: 1, column: 59, offset: 58 },
                                end: { line: 1, column: 70, offset: 69 },
                            },
                        },
                        {
                            type: "mdxJsxFlowElement",
                            name: "td",
                            properties: {},
                            children: [
                                {
                                    type: "text",
                                    value: "テスト手順など",
                                    position: {
                                        start: { line: 1, column: 74, offset: 73 },
                                        end: { line: 1, column: 81, offset: 80 },
                                    },
                                },
                            ],
                            position: {
                                start: { line: 1, column: 70, offset: 69 },
                                end: { line: 1, column: 86, offset: 85 },
                            },
                        },
                    ],
                    position: {
                        start: { line: 1, column: 33, offset: 32 },
                        end: { line: 1, column: 91, offset: 90 },
                    },
                },
            ],
            position: {
                start: { line: 1, column: 26, offset: 25 },
                end: { line: 1, column: 99, offset: 98 },
            },
        },
        {
            type: "text",
            value: "\n",
            position: {
                start: { line: 1, column: 99, offset: 98 },
                end: { line: 2, column: 1, offset: 99 },
            },
        },
        {
            type: "mdxJsxFlowElement",
            name: "tbody",
            properties: {},
            children: [
                {
                    type: "text",
                    value: "\n",
                    position: {
                        start: { line: 2, column: 8, offset: 106 },
                        end: { line: 3, column: 1, offset: 107 },
                    },
                },
                {
                    type: "mdxJsxFlowElement",
                    name: "tr",
                    properties: {},
                    children: [
                        {
                            type: "mdxJsxFlowElement",
                            name: "td",
                            properties: {},
                            children: [
                                {
                                    type: "text",
                                    value: "jma-adess-NOWC-sobo",
                                    position: {
                                        start: { line: 3, column: 9, offset: 115 },
                                        end: { line: 3, column: 28, offset: 134 },
                                    },
                                },
                            ],
                            position: {
                                start: { line: 3, column: 5, offset: 111 },
                                end: { line: 3, column: 33, offset: 139 },
                            },
                        },
                        {
                            type: "mdxJsxFlowElement",
                            name: "td",
                            properties: {},
                            children: [
                                {
                                    type: "text",
                                    value: "PNGタイルが作成され、コンテンツサービスに登録する。",
                                    position: {
                                        start: { line: 3, column: 37, offset: 143 },
                                        end: { line: 3, column: 64, offset: 170 },
                                    },
                                },
                            ],
                            position: {
                                start: { line: 3, column: 33, offset: 139 },
                                end: { line: 3, column: 69, offset: 175 },
                            },
                        },
                        {
                            type: "mdxJsxFlowElement",
                            name: "td",
                            properties: {},
                            children: [
                                {
                                    type: "mdxJsxFlowElement",
                                    name: "div",
                                    properties: { className: ["ok"] },
                                    children: [
                                        {
                                            type: "text",
                                            value: "OK",
                                            position: {
                                                start: { line: 3, column: 89, offset: 195 },
                                                end: { line: 3, column: 91, offset: 197 },
                                            },
                                        },
                                    ],
                                    position: {
                                        start: { line: 3, column: 73, offset: 179 },
                                        end: { line: 3, column: 97, offset: 203 },
                                    },
                                },
                            ],
                            position: {
                                start: { line: 3, column: 69, offset: 175 },
                                end: { line: 3, column: 102, offset: 208 },
                            },
                        },
                        {
                            type: "mdxJsxFlowElement",
                            name: "td",
                            properties: {},
                            children: [
                                {
                                    type: "mdxJsxFlowElement",
                                    name: "b",
                                    properties: {},
                                    children: [
                                        {
                                            type: "text",
                                            value: "テスト手順:",
                                            position: {
                                                start: { line: 3, column: 109, offset: 215 },
                                                end: { line: 3, column: 115, offset: 221 },
                                            },
                                        },
                                    ],
                                    position: {
                                        start: { line: 3, column: 106, offset: 212 },
                                        end: { line: 3, column: 119, offset: 225 },
                                    },
                                },
                                {
                                    type: "mdxJsxFlowElement",
                                    name: "br",
                                    properties: {},
                                    children: [],
                                    position: {
                                        start: { line: 3, column: 119, offset: 225 },
                                        end: { line: 3, column: 124, offset: 230 },
                                    },
                                },
                                {
                                    type: "text",
                                    value: "テスト対象のyaml、file、categoryを指定して、sh $DIR/$｛SOBODEV｝/work/do_curl.sh $FILE $EXT $CATEGORY を実行",
                                    position: {
                                        start: { line: 3, column: 124, offset: 230 },
                                        end: { line: 3, column: 213, offset: 319 },
                                    },
                                },
                                {
                                    type: "code",
                                    lang: "sh",
                                    meta: null,
                                    value: "test",
                                    position: {
                                        start: { line: 6, column: 1, offset: 33 },
                                        end: { line: 8, column: 4, offset: 47 },
                                    },
                                },
                                {
                                    type: "mdxJsxFlowElement",
                                    name: "br",
                                    properties: {},
                                    children: [],
                                    position: {
                                        start: { line: 3, column: 213, offset: 319 },
                                        end: { line: 3, column: 218, offset: 324 },
                                    },
                                },
                                {
                                    type: "mdxJsxFlowElement",
                                    name: "h1",
                                    properties: {},
                                    children: [
                                        {
                                            type: "text",
                                            value: "期待される結果:",
                                            position: {
                                                start: { line: 3, column: 221, offset: 327 },
                                                end: { line: 3, column: 229, offset: 335 },
                                            },
                                        },
                                    ],
                                    position: {
                                        start: { line: 3, column: 218, offset: 324 },
                                        end: { line: 3, column: 233, offset: 339 },
                                    },
                                },
                                {
                                    type: "mdxJsxFlowElement",
                                    name: "br",
                                    properties: {},
                                    children: [],
                                    position: {
                                        start: { line: 3, column: 233, offset: 339 },
                                        end: { line: 3, column: 238, offset: 344 },
                                    },
                                },
                                {
                                    type: "mdxJsxFlowElement",
                                    name: "details",
                                    properties: {},
                                    children: [
                                        {
                                            type: "mdxJsxFlowElement",
                                            name: "summary",
                                            properties: {},
                                            children: [
                                                {
                                                    type: "text",
                                                    value: "コンテンツサービスにPNGタイルが登録されていることを確認する。",
                                                    position: {
                                                        start: { line: 3, column: 256, offset: 362 },
                                                        end: { line: 3, column: 288, offset: 394 },
                                                    },
                                                },
                                            ],
                                            position: {
                                                start: { line: 3, column: 247, offset: 353 },
                                                end: { line: 3, column: 298, offset: 404 },
                                            },
                                        },
                                        {
                                            type: "mdxJsxFlowElement",
                                            name: "div",
                                            properties: {},
                                            children: [
                                                {
                                                    type: "text",
                                                    value: "・指定したズームレベルのPNGタイルが作成されていることを確認する。",
                                                    position: {
                                                        start: { line: 3, column: 303, offset: 409 },
                                                        end: { line: 3, column: 337, offset: 443 },
                                                    },
                                                },
                                                {
                                                    type: "mdxJsxFlowElement",
                                                    name: "br",
                                                    properties: {},
                                                    children: [],
                                                    position: {
                                                        start: { line: 3, column: 337, offset: 443 },
                                                        end: { line: 3, column: 342, offset: 448 },
                                                    },
                                                },
                                            ],
                                            position: {
                                                start: { line: 3, column: 298, offset: 404 },
                                                end: { line: 3, column: 348, offset: 454 },
                                            },
                                        },
                                    ],
                                    position: {
                                        start: { line: 3, column: 238, offset: 344 },
                                        end: { line: 3, column: 358, offset: 464 },
                                    },
                                },
                                {
                                    type: "mdxJsxFlowElement",
                                    name: "br",
                                    properties: {},
                                    children: [],
                                    position: {
                                        start: { line: 3, column: 358, offset: 464 },
                                        end: { line: 3, column: 363, offset: 469 },
                                    },
                                },
                            ],
                            position: {
                                start: { line: 3, column: 102, offset: 208 },
                                end: { line: 3, column: 368, offset: 474 },
                            },
                        },
                    ],
                    position: {
                        start: { line: 3, column: 1, offset: 107 },
                        end: { line: 3, column: 373, offset: 479 },
                    },
                },
                {
                    type: "text",
                    value: "\n",
                    position: {
                        start: { line: 3, column: 373, offset: 479 },
                        end: { line: 4, column: 1, offset: 480 },
                    },
                },
            ],
            position: {
                start: { line: 2, column: 1, offset: 99 },
                end: { line: 4, column: 9, offset: 488 },
            },
        },
    ],
    position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 4, column: 17, offset: 496 } },
}


const plugin = (options) => {
  const transformer = async (ast, vfile) => {
      assert(ast.type == 'root')
      assert(Array.isArray(ast.children))
      ast.children = ast.children.map((node) => {
        if (node.type == 'code' && node.lang == 'yaml' && node.meta && node.meta.includes('format_as_test_table')) {
          try {
            const result = fromHtml(processTest(YAML.parse(node.value), node.meta), {fragment: true}).children[0]
            return result
          } catch (e) {
            throw new Error(`error occur in yaml test specification file:${vfile.path} line:${node.position.start.line} error:${e}`)
          }
        }
        return node
      })
    }
    return transformer;
  };

export default plugin;
