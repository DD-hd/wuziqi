'use strict';

/**
 * @file API 文档生成
 * @author Yourtion Guo <yourtion@gmail.com>
 */
const path = require('path');
const apiService = require('../src/api');

const DOC_PATH = path.resolve(__dirname, '../docs');
apiService.genDocs(DOC_PATH);

require('../src/index');

process.exit(0);
