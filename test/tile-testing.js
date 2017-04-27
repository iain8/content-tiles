const assert = require('chai').assert;
const jsdom = require('jsdom');
const contentTiles = require('../src/content-tiles');

const { JSDOM } = jsdom;
const { document } = (new JSDOM('<!DOCTYPE html>')).window;

function makeElement(width, height) {
  const el = document.createElement('div');

  el.setAttribute('data-width', width);
  el.setAttribute('data-height', height);

  return el;
}

describe('content tiles tests', function() {
  describe('#getTotalWidth()', function() {
    it('calculates total width of a row', function() {
      const testData = [
        makeElement(100, 100),
        makeElement(100, 100),
        makeElement(100, 100),
        makeElement(100, 100),
      ];

      const width = contentTiles.getTotalWidth(testData);

      assert.equal(width, 400);
    });

    it('handles an empty row', function() {
      const testData = [];

      const width = contentTiles.getTotalWidth(testData);

      assert.equal(width, 0);
    });
  });

  describe('#shrinkElement()', function() {
    it('shrinks an element to a smaller size', function() {
      const shrunkenEl = contentTiles.shrinkElement(makeElement(800, 600));

      assert.equal(parseInt(shrunkenEl.getAttribute('data-width')), 798);
      assert.equal(parseInt(shrunkenEl.getAttribute('data-height')), 599);
    });

    it('does nothing to a 0x0 element', function() {
      const shrunkenEl = contentTiles.shrinkElement(makeElement(0, 0));

      assert.equal(parseInt(shrunkenEl.getAttribute('data-width')), 0);
      assert.equal(parseInt(shrunkenEl.getAttribute('data-height')), 0);
    });
  });

  describe('#buildRows()', function() {
    it('builds rows from a list of elements', function() {
      const testData = [
        makeElement(100, 100),
        makeElement(100, 100),
        makeElement(100, 100),
        makeElement(100, 100),
      ];

      const rows = contentTiles.buildRows(testData, 200);

      assert.lengthOf(rows, 2);
      assert.lengthOf(rows[0], 2);
    });

    it('handles when max width is less than element size', function() {
      const testData = [
        makeElement(100, 100),
        makeElement(100, 100),
        makeElement(100, 100),
        makeElement(100, 100),
      ];

      const rows = contentTiles.buildRows(testData, 50);

      assert.lengthOf(rows, 4);
      assert.lengthOf(rows[0], 1);
    });
  });

  describe('#fitImagesInRow()', function() {
    it('fits larger images into a smaller row', function() {
      const testData = [
        makeElement(100, 100),
        makeElement(100, 100),
        makeElement(100, 100),
        makeElement(100, 100),
      ];

      const row = contentTiles.fitImagesInRow(testData, 300);

      row.forEach(e => {
        assert.equal(e.getAttribute('data-width'), 75);
      });
    });

    it('fits smaller images into a larger row', function() {
      const testData = [
        makeElement(100, 100),
        makeElement(100, 100),
        makeElement(100, 100),
      ];

      const row = contentTiles.fitImagesInRow(testData, 500);

      row.forEach(e => {
        assert.equal(e.getAttribute('data-width'), 100);
      });
    });

    it('reduces images in a row of width 0 to width 0', function() {
      const testData = [
        makeElement(100, 100),
        makeElement(100, 100),
        makeElement(100, 100),
      ];

      const row = contentTiles.fitImagesInRow(testData, 0);

      row.forEach(e => {
        assert.equal(e.getAttribute('data-width'), 0);
      });
    });
  });
});
