'use strict';

/**
 * @file API plugin generate-markdown
 * @author Yourtion Guo <yourtion@gmail.com>
 */

const fs = require('fs');
const path = require('path');
const utils = require('lei-utils');
const debug = require('../../debug').plugin;

module.exports = function generateMarkdown(data, dir) {

  function filePath(name) {
    const filename = name === 'Home' ? name : name.toLowerCase();
    const p = path.resolve(dir, filename + '.md');
    debug('filePath', p);
    return p;
  }

  function getGroupName(name) {
    return data.group[name] ? `${ data.group[name] } ( ${ name } )` : name;
  }

  const typeDoc = trimSpaces(typeDocs(data));
  const errorDoc = trimSpaces(errorDocs(data));

  fs.writeFileSync(filePath('types'), typeDoc);
  fs.writeFileSync(filePath('errors'), errorDoc);

  const list = schemaDocs(data);
  const indexDoc = [];
  indexDoc.push(`# ${ data.info.title }\n`);
  indexDoc.push(data.info.description + '\n');
  indexDoc.push(`测试服务器： ${ data.info.host }${ data.info.basePath }\n`);
  indexDoc.push(`生成时间： ${ data.info.version.toLocaleDateString() } ${ data.info.version.toLocaleTimeString() }\n`);
  indexDoc.push('文档列表：\n');
  const allInOneDoc = indexDoc.slice(0, indexDoc.length);
  const wikiDoc = indexDoc.slice(0, indexDoc.length);
  for (const item of list) {
    // console.log(trimSpaces(item.content));
    const titie = `# ${ getGroupName(item.name) } 相关文档\n\n`;
    fs.writeFileSync(filePath(item.name), titie + trimSpaces(item.content));
    indexDoc.push(`- [${ data.group[item.name] } ( ${ item.name } ) 相关文档](./${ item.name.toLowerCase() }.md)`);
    wikiDoc.push(`- [${ data.group[item.name] } ( ${ item.name } ) 相关文档](wiki/${ item.name.toLowerCase() })`);
    allInOneDoc.push(`- [${ data.group[item.name] } ( ${ item.name } ) 相关](#${ item.name.toLowerCase() })`);
  }
  fs.writeFileSync(filePath('index'), trimSpaces(indexDoc.join('\n')));
  fs.writeFileSync(filePath('Home'), trimSpaces(wikiDoc.join('\n')));
  allInOneDoc.push(`- [类型相关文档](#types)`);
  allInOneDoc.push(`- [错误信息文档](#errors)`);
  allInOneDoc.push('\n');
  for (const item of list) {
    // console.log(trimSpaces(item.content));
    allInOneDoc.push(`# <a id="${ item.name.toLowerCase() }">${ getGroupName(item.name) } 相关文档</a>\n\n`);
    allInOneDoc.push(item.content);
  }
  allInOneDoc.push(`# <a id="types">类型相关文档</a>\n\n`);
  allInOneDoc.push(typeDoc);
  allInOneDoc.push(`# <a id="errors">错误信息文档</a>\n\n`);
  allInOneDoc.push(errorDoc);
  fs.writeFileSync(filePath('API文档-' + data.info.title), trimSpaces(allInOneDoc.join('\n')));
};

function trimSpaces(text) {
  return text.replace(/\r\n/g, '\n').replace(/\n\n+/g, '\n\n').replace(/\n\s+\n/g, '\n\n');
}

function toString(str, defaultStr) {
  if (typeof str === 'undefined') return defaultStr || '';
  return String(str);
}

function stringOrEmpty(str) {
  return toString(str, '（无）');
}

function itemTF(obj) {
  return obj ? '是' : '否';
}

function typeDocs(data) {
  
  const defaultTypes = [];
  const customTypes = [];
  for (const name in data.types) {
    const info = data.types[name];
    if (info.isDefault) {
      defaultTypes.push(info);
    } else {
      customTypes.push(info);
    }
  }
  
  defaultTypes.sort((a, b) => {
    return a.name > b.name;
  });
  customTypes.sort((a, b) => {
    return a.name > b.name;
  });
  
  const list = [];
  list.push(`## 默认数据类型\n`);
  list.push(`类型 | 描述 | 检查 | 格式化 | 解析`);
  list.push(`------|----- |-----|-----|-----`);
  for (const item of defaultTypes) {
    list.push(`\`${ item.name }\` | ${ stringOrEmpty(item.description) } | ${ itemTF(item.checker) } ` +
        `| ${ itemTF(item.formatter) } | ${ itemTF(item.parser) }`.trim());
  }
  list.push(`\n## 自定义数据类型\n`);
  list.push(`类型 | 描述 | 检查 | 格式化 | 解析`);
  list.push(`------|----- |-----|-----|-----`);
  for (const item of customTypes) {
    list.push(`\`${ item.name }\` | ${ stringOrEmpty(item.description) } | ${ itemTF(item.checker) } ` +
        `| ${ itemTF(item.formatter) } | ${ itemTF(item.parser) }`.trim());
  }
  return list.join('\n') + '\n';
}

function errorDocs(data) {

  const errors = [];
  for (const name in data.errors) {
    errors.push(Object.assign({ name }, data.errors[name]));
  }

  errors.sort((a, b) => {
    return a.code < b.code;
  });

  const list = [];
  list.push('# 错误类型');
  list.push(`错误 | 错误码 | 描述 `);
  list.push(`------|----- |-----`);
  for (const item of errors) {
    list.push(`\`${ stringOrEmpty(item.name) }\` | ${ item.code } | ${ stringOrEmpty(item.desc) }`.trim());
  }
  return list.join('\n');
}

function schemaDocs(data) {

  const group = {};

  function add(name, content) {
    if (!Array.isArray(group[name])) group[name] = [];
    group[name].push(content.trim());
  }

  function paramsTable(item) {

    const list = [];
    list.push(`参数名 | 位置 | 类型 | 格式化 | 必填 | 说明`);
    list.push(`------|----- |-----|-------|------|-----`);
    for(const place of [ 'params', 'query', 'body' ]) {
      for (const name in item[place]) {
        const info = item[place][name];
        let required = '否';
        if (item.required.has(name)) {
          required = '是';
        } else {
          for (const names of item.requiredOneOf) {
            if (names.indexOf(name) !== -1) {
              // required = `\`${ names.join('`, `') }\` 其中一个`;
              required = '选填';
              break;
            }
          }
        }
        list.push(`
  \`${ stringOrEmpty(name) }\` | ${ place } | ${ stringOrEmpty(info.type) } | ${ info.format ? '是' : '否' } | ${ required } | ${ stringOrEmpty(info.comment) }
        `.trim());
      }
    }
    if(item.requiredOneOf.size > 0) {
      list.push('\n选填参数：\n');
      for (const names of item.requiredOneOf) {
        list.push(`- \`${ names.join('`, `') }\` 其中一个`);
      }
    }
    if (list.length === 2) return;
    return list.join('\n');
  }

  function formatExampleInput(data) {
    const ret = Object.assign({}, data);
    for (const name in ret) {
      if (name[0] === '$') {
        delete ret[name];
      }
    }
    return ret;
  }

  function examples(list) {
    return list.map(item => {
      return `
// ${ stringOrEmpty(item.name) } - ${ item.path } ${ item.headers ? '\nheaders = ' + utils.jsonStringify(item.headers, 2) : '' }
input = ${ utils.jsonStringify(formatExampleInput(item.input), 2) };
output = ${ utils.jsonStringify(item.output, 2) };
      `.trim();
    }).join('\n\n');
  }

  for (const key of Object.keys(data.schemas)) {
    const item = data.schemas[key];

    let line = `
## ${ stringOrEmpty(item.title) }

请求地址：**${ item.method.toUpperCase() }** \`${ item.path }\`
`;

    if(item.description) {
      line += '\n\n' + item.description.split('\n').map(it => it.trim()).join('\n') + '\n';
    }
    const paramsDoc = paramsTable(item);
    if (paramsDoc) {
      line += `
### 参数：
  
${ paramsDoc }
`;
    } else {
      line += '\n参数：无参数\n';
    }


    if (item.examples.length > 0) {
      line += `
### 使用示例：

\`\`\`javascript
${ examples(item.examples) }
\`\`\`
      `;
    }

    add(item.group, line.trim());
  }

  const list = [];
  for (const name in group) {
    list.push({
      name,
      content: group[name].join('\n\n'),
    });
  }

  return list;
}
