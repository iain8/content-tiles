// TODO: tests
// TODO: npm
// TODO: think my doc comments are effed up

(function() {
  /**
   * Get an attribute as an integer
   * 
   * @param {*} el Element on which to get attribute
   * @param {*} attr Attribute name
   * 
   * @return int Integer value of attribute
   */
  function getAttrAsInt(el, attr) {
    return parseInt(el.getAttribute(attr));
  };

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
  };

  var ContentTiles = {
    // width of border around elements (px)
    borderWidth: 10,

    // container of content rows
    container: null,

    // class on container element
    containerClass: 'content-grid',

    // row data
    data: [],

    // inner classes also to be resized e.g. image, overlay
    innerClasses: [],

    // class of content element
    itemClass: 'content-item',

    // maximum width of this.container (px)
    maxWidth: 0,

    // target row height (px)
    targetHeight: 400,

    /**
     * Initialise the content grid and draw it
     * 
     * @param options array Initialisation options for plugin
     */
    init: function(options) {
      // set up instance vars
      var opts = options || {};

      this.borderWidth = opts.borderWidth || this.borderWidth;
      this.containerClass = opts.containerClass || this.containerClass;
      this.innerClasses = opts.innerClasses || this.innerClasses;
      this.itemClass = opts.itemClass || this.itemClass;
      this.targetHeight = opts.targetHeight || this.targetHeight;

      this.container = document.getElementsByClassName(this.containerClass)[0];
      this.maxWidth = this.container.offsetWidth;
      this.targetHeight = getAttrAsInt(this.container, 'data-row-height');

      var content = this.container.getElementsByClassName('content-item');
      var dataLength = content.length;

      // calculate width and set initial dimensions
      for (var i = 0; i < dataLength; ++i) {
        var width = getAttrAsInt(content[i], 'data-width');
        var height = getAttrAsInt(content[i], 'data-height');

        content[i].setAttribute('data-width', width * (this.targetHeight / height));
        content[i].setAttribute('data-height', this.targetHeight);

        this.data.push(content[i]);
      }

      this.populate();
    },

    /**
     * Populate content and adjust rows to fit
     */
    populate: function() {
      var rows = this.buildRows();
      var rowCount = rows.length;

      for (var i = 0; i < rowCount; ++i) {
        rows[i] = this.fitImagesInRow(rows[i]);

        var difference = this.maxWidth - this.getTotalWidth(rows[i]);
        var imageCount = rows[i].length;

        if (imageCount > 1 && difference < this.borderWidth) {
          var offset = difference / imageCount;

          rows[i].forEach(function (el) {
            el.setAttribute('data-width', getAttrAsFloat(el, 'data-width') + offset);
          });

          var lastEl = rows[i][imageCount - 1];
          lastEl.setAttribute('data-width', getAttrAsFloat(lastEl, 'data-width') + (this.maxWidth - this.getTotalWidth(rows[i])));
        }
      }

      this.render(rows);
    },

    /**
     * Build rows from content items
     * 
     * @return array Content organised into rows
     */
    buildRows: function () {
      var currentRow = 0;
      var currentWidth = 0;
      var rows = [];
      var maxWidth = this.maxWidth;
      var dataLength = this.data.length;

      for (var i = 0; i < dataLength; ++i) {
        if (currentWidth >= maxWidth) {
          ++currentRow;
          currentWidth = 0;
        }

        if (!rows[currentRow]) {
          rows[currentRow] = [];
        }

        rows[currentRow].push(this.data[i]);

        currentWidth += getAttrAsFloat(this.data[i], 'data-width');
      }

      return rows;
    },

    /**
     * Fit the images into a row
     * 
     * @param array row
     * @return array Row
     */
    fitImagesInRow: function (row) {
      var rowCount = row.length;

      while (this.getTotalWidth(row) > this.maxWidth) {
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
    getTotalWidth: function(row) {
      var width = 0;
      var rowLength = row.length;

      for (var i = 0; i < row.length; ++i) {
        width += getAttrAsFloat(row[i], 'data-width');
      }

      return width + ((row.length - 1) * this.borderWidth);
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
    render: function (rows) {
      Array.prototype.forEach.call(document.getElementsByClassName(this.itemClass), function(el) {
        el.parentNode.removeChild(el);
      });

      var rowsLength = rows.length;
      var fragment = document.createDocumentFragment();

      for (var i = 0; i < rowsLength; ++i) {
        var newRow = document.createElement('div');

        if (newRow.classList) {
          newRow.classList.add('row')
        } else {
          newRow.className = 'row';
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

      this.container.appendChild(fragment);
    },
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ContentTiles;
  } else {
    if (typeof define === 'function' && define.amd) {
      define([], function() {
        return ContentTiles;
      });
    } else {
      window.ContentGrid = ContentTiles;
    }
  }
})();
