/**
 * content-tiles.js
 * 
 * A library for arranging content into a neat grid without losing your aspect ratios
 *
 */

(function () {
  /**
   * Get an attribute as an integer
   *
   * @param {Object} el Element on which to get attribute
   * @param {string} attr Attribute name
   *
   * @return int Integer value of attribute
   */
  function getAttrAsInt(el, attr) {
    return parseInt(el.getAttribute(attr), 10);
  }

  /**
   * Get an attribute as a float
   *
   * @param {Object} el Element on which to get attribute
   * @param {string} attr Attribute name
   *
   * @return float Float value of attribute
   */
  function getAttrAsFloat(el, attr) {
    return parseFloat(el.getAttribute(attr));
  }

  var ContentTiles = {
    // width of border around elements (px)
    spacing: 0,

    // class on container element
    containerClass: 'content-tiles',

    // inner classes also to be resized e.g. image, overlay
    innerClasses: [],

    // class of content element
    itemClass: 'content-item',

    // class of the rows in which content will be arranged
    rowClass: 'content-row',

    // target row height (px)
    rowHeight: 400,

    /**
     * Initialise the content grid and draw it
     *
     * @param {Object} options Initialisation options for plugin
     */
    init: function (options) {
      // set up instance vars
      var opts = options || {};

      this.spacing = opts.spacing || this.spacing;
      this.containerClass = opts.containerClass || this.containerClass;
      this.innerClasses = opts.innerClasses || this.innerClasses;
      this.itemClass = opts.itemClass || this.itemClass;
      this.rowHeight = opts.rowHeight || this.rowHeight;

      var containers = document.getElementsByClassName(this.containerClass);

      // exit if container not found TODO: no longer necessary?
      if (containers.length === 0) {
        return;
      }

      for (var i = 0; i < containers.length; ++i) {
        var container = containers[i];
        var data = [];
        var maxWidth = container.offsetWidth;
        var rowHeight = getAttrAsInt(container, 'data-row-height') || this.rowHeight;
        var spacing = getAttrAsInt(container, 'data-spacing') || this.spacing;

        var content = container.getElementsByClassName('content-item');
        var dataLength = content.length;

        // calculate width and set initial dimensions
        for (var j = 0; j < dataLength; ++j) {
          var width = getAttrAsInt(content[j], 'data-width');
          var height = getAttrAsInt(content[j], 'data-height');

          content[j].setAttribute('data-width', width * (rowHeight / height));
          content[j].setAttribute('data-height', rowHeight);

          data.push(content[j]);
        }

        var rows = this.populate(container, data, maxWidth, spacing);

        this.render(container, rows);
      }
    },

    /**
     * Populate rows of content items
     * 
     * @param {Object} container
     * @param {array} data asdadasd 
     */
    populate: function (container, data, maxWidth, spacing) {
      var rows = this.buildRows(data, maxWidth);
      var rowCount = rows.length;

      for (var i = 0; i < rowCount; ++i) {
        rows[i] = this.fitImagesInRow(rows[i], maxWidth);

        var difference = maxWidth - this.getTotalWidth(rows[i]);
        var imageCount = rows[i].length;

        if (imageCount > 1 && difference < spacing) {
          var offset = difference / imageCount;
          var rowsCount = rows[i].length;

          for (var j = 0; j < rowsCount; ++j) {
            rows[i][j].setAttribute('data-width', getAttrAsFloat(rows[i][j], 'data-width') + offset);
          }

          var lastEl = rows[i][imageCount - 1];
          lastEl.setAttribute('data-width', getAttrAsFloat(lastEl, 'data-width') + (maxWidth - this.getTotalWidth(rows[i])));
        }
      }

      return rows;
    },

    /**
     * Build rows from content items
     *
     * @param {array} data Array of content items
     * @param {number} maxWidth Maximum width of a row
     * 
     * @return {array} Content organised into rows
     */
    buildRows: function (data, maxWidth) {
      var currentRow = 0;
      var currentWidth = 0;
      var rows = [];
      var dataLength = data.length;

      for (var i = 0; i < dataLength; ++i) {
        if (currentWidth >= maxWidth) {
          ++currentRow;
          currentWidth = 0;
        }

        if (!rows[currentRow]) {
          rows[currentRow] = [];
        }

        rows[currentRow].push(data[i]);

        currentWidth += getAttrAsFloat(data[i], 'data-width');
      }

      return rows;
    },

    /**
     * Fit the images into a row
     * 
     * @param {array} row A row of content items
     * @param {number} maxWidth Max width of a row
     * 
     * @return {array} Row of content items
     */
    fitImagesInRow: function (row, maxWidth) {
      var rowCount = row.length;

      while (this.getTotalWidth(row) > maxWidth) {
        for (var i = 0; i < rowCount; ++i) {
          row[i] = this.shrinkElement(row[i]);
        }
      }

      return row;
    },

    /**
     * Calculate the total width of a row of items
     *
     * @param {array} row A row of content items
     *
     * @return {number} Width of row
     */
    getTotalWidth: function (row) {
      var width = 0;
      var rowLength = row.length;

      for (var i = 0; i < rowLength; ++i) {
        width += getAttrAsFloat(row[i], 'data-width');
      }

      return width + ((row.length - 1) * this.spacing);
    },

    /**
     * Reduce the future size of an element by the given amount
     * 
     * @param {Object} el DOM element
     * 
     * @return {Object} Shrunken DOM element
     */
    shrinkElement: function (el) {
      var height = getAttrAsFloat(el, 'data-height');
      var width = getAttrAsFloat(el, 'data-width');

      if (height > 1) {
        var newHeight = height - 1;

        el.setAttribute('data-width', width * (newHeight / height));
        el.setAttribute('data-height', newHeight);
      } else {
        el.setAttribute('data-width', 0);
        el.setAttribute('data-height', 0);
      }

      return el;
    },

    /**
     * Remove the existing items and add the new rows to the DOM
     * 
     * @param {Object} container The containing div
     * @param {array} rows Rows of content items
     */
    render: function (container, rows) {
      Array.prototype.forEach.call(container.getElementsByClassName(this.itemClass), function (el) {
        el.parentNode.removeChild(el);
      });

      var rowsLength = rows.length;
      var fragment = document.createDocumentFragment();

      for (var i = 0; i < rowsLength; ++i) {
        var newRow = document.createElement('div');

        if (newRow.classList) {
          newRow.classList.add(this.rowClass)
        } else {
          newRow.className = this.rowClass;
        }

        var rowLength = rows[i].length;
        
        for (var j = 0; j < rowLength; ++j) {
          var el = rows[i][j];
          var height = getAttrAsInt(el, 'data-height') + 'px';
          var width = getAttrAsInt(el, 'data-width') + 'px';

          el.style.width = width;
          el.style.height = height;

          var innerClassesLength = this.innerClasses.length;

          for (var k = 0; k < innerClassesLength; ++k) {
            el.getElementsByClassName(this.innerClasses[k])[0].style.height = height;
          }

          newRow.appendChild(el);
        }

        fragment.appendChild(newRow);
      }

      container.appendChild(fragment);
    },
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ContentTiles;
  } else if (typeof define === 'function' && define.amd) {
    define([], function () {
      return ContentTiles;
    });
  } else {
    window.ContentTiles = ContentTiles;
  }
})();
