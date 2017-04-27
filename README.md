# content-tiles

A library to generate tiled content in a way that preserves aspect ratios. Works with any content
as long as you provide a width and height.

Very deeply inspired by [automatic-image grid](https://github.com/beije/automatic-image-grid) by [beije](https://github.com/beije) on github.

## Installation

Install via npm:

```bash
npm install content-tiles
```

Or download the package and include the file at the end of your page:

```html
<script src="dist/content-tiles.min.js"></script>
```

## Usage

Once the DOM has been loaded you can initialise the library by calling `init()`.

```javascript
ContentTiles.init({
  // parameters (see below)
});
```

### Parameters

These can be passed to the `init()` method as a hash.

* `spacing` - width of the border between content items in px (default: 0)
* `containerClass` - CSS class of the container (default: `content-grid`)
* `innerClasses` - CSS classes on elements inside the items that should also be explicitly resized e.g. overlays (default: `[]`)
* `itemClass` - CSS class of items in the container (default: `content-item`)
* `rowHeight` - ideal height of rows of content in px (default: `400`)

The `spacing` and `target-height` can also be set as data attributes on the container.

```html
<div class="content-tiles spaced-tiles" data-row-height="200" data-spacing="20">
```

## Example

Check out the [examples page](https://iain8.github.io/content-tiles).

## Roadmap

* Add a `redraw()` method that removes content from rows and then recalculates the tiling 
(useful for screen size or orientation changes)
* Move away from using data-attrs to improve performance
* IE8 support could be added by moving away from `getElementsByClassName()`
