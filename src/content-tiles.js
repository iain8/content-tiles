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
   * @param {*} el Element on which to get attribute
   * @param {*} attr Attribute name
   *
   * @return int Integer value of attribute
   */
  function getAttrAsInt(el, attr) {
    return parseInt(el.getAttribute(attr), 10);
  }

  /**
   * Get an attribute as a float
   *
   * @param {*} el Element on which to get attribute
   * @param {*} attr Attribute name
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
    targetHeight: 400,

    /**
     * Initialise the content grid and draw it
     *
     * @param options array Initialisation options for plugin
     */
    init: function (options) {
      // set up instance vars
      var opts = options || {};

      this.spacing = opts.spacing || this.spacing;
      this.containerClass = opts.containerClass || this.containerClass;
      this.innerClasses = opts.innerClasses || this.innerClasses;
      this.itemClass = opts.itemClass || this.itemClass;

      // TODO: this is just getting overwritten right now
      this.targetHeight = opts.rowHeight || this.targetHeight;

      var containers = document.getElementsByClassName(this.containerClass);

      // exit if container not found TODO: no longer necessary?
      if (containers.length === 0) {
        return;
      }

      for (var i = 0; i < containers.length; ++i) {
        var container = containers[i];
        var data = [];
        var maxWidth = container.offsetWidth;

        // TODO: make non-instance these two
        this.targetHeight = getAttrAsInt(container, 'data-row-height') || this.rowHeight;
        this.spacing = getAttrAsInt(container, 'data-spacing') || this.spacing;

        var content = container.getElementsByClassName('content-item');
        var dataLength = content.length;

        // calculate width and set initial dimensions
        for (var j = 0; j < dataLength; ++j) {
          var width = getAttrAsInt(content[j], 'data-width');
          var height = getAttrAsInt(content[j], 'data-height');

          content[j].setAttribute('data-width', width * (this.targetHeight / height));
          content[j].setAttribute('data-height', this.targetHeight);

          data.push(content[j]);
        }

        var rows = this.populate(container, data, maxWidth);

        this.render(container, rows);
      }
    },

    /**
     * Populate content and adjust rows to fit
     */
    populate: function (container, data, maxWidth) {
      var rows = this.buildRows(data, maxWidth);
      var rowCount = rows.length;

      for (var i = 0; i < rowCount; ++i) {
        rows[i] = this.fitImagesInRow(rows[i], maxWidth);

        var difference = maxWidth - this.getTotalWidth(rows[i]);
        var imageCount = rows[i].length;

        if (imageCount > 1 && difference < this.spacing) {
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
     * @return array Content organised into rows
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
     * @param array row
     * @return array Row
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
     * @param array row A row of items
     *
     * @return int Width
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
     * Reduce the size of an element by the given amount
     * 
     * @param $el jQuery element
     * @param amount int
     * 
     * @return jQuery element
     */
    shrinkElement: function (el) {
      var height = getAttrAsFloat(el, 'data-height');
      var width = getAttrAsFloat(el, 'data-width');

      var newHeight = height - 1;

      el.setAttribute('data-width', width * (newHeight / height));
      el.setAttribute('data-height', newHeight);

      return el;
    },

    /**
     * Possibly redundant render function!
     */
    render: function (container, rows) {
      Array.prototype.forEach.call(container.getElementsByClassName(this.itemClass), function (el) {
        //
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
    window.ContentGrid = ContentTiles;
  }
})();
