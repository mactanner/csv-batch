'use strict';

const {assert} = require('chai');
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const https = require('https');

const csvBatch = require('../index');

describe('readable stream', () => {
  it('file system', () => {
    const fileStream = fs.createReadStream(path.join(__dirname, 'files', 'readable-stream-fs.csv'));
    return csvBatch(fileStream).then(results => {
      assert.equal(results.totalRecords, 2);
      assert.deepEqual(results.data, [
        {
          A: '1',
          B: '2',
          C: '3'
        },
        {
          A: '4',
          B: '5',
          C: '6'
        }
      ]);
      assert.isEmpty(results.errors);
    });
  });

  it('zlib', () => {
    const zlibStream = fs.createReadStream(path.join(__dirname, 'files', 'readable-stream-zlib.csv.gz'));
    const unzip = zlib.createGunzip();
    return csvBatch(zlibStream.pipe(unzip)).then(results => {
      assert.equal(results.totalRecords, 2);
      assert.deepEqual(results.data, [
        {
          A: '1',
          B: '2',
          C: '3'
        },
        {
          A: '4',
          B: '5',
          C: '6'
        }
      ]);
      assert.isEmpty(results.errors);
    });
  });

  it('https', () => {
    return new Promise(resolve => {
      https.get('https://people.sc.fsu.edu/~jburkardt/data/csv/hw_25000.csv', res => {
        resolve(res);
      });
    })
      .then(csvBatch)
      .then(results => {
        assert.equal(results.totalRecords, 25000);
        assert.equal(results.data.length, 25000);
        assert.isEmpty(results.errors);
      });
  });
});
