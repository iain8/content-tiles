# content-tiles

A library to generate tiled content in a way that preserves aspect ratios. Works with any content
as long as you provide a width and height.

Very deeply inspired by [automatic-image grid](https://github.com/beije/automatic-image-grid) by [beije](https://github.com/beije) on github.

## Installation

TODO

## Usage

Once the DOM has been loaded you can initialise the library by calling `init()`.

``` javascript
ContentGrid.init({
  // parameters (see below)
});
```

### Parameters

* `borderWidth` - width of the border between content items in px (default: `10`)
* `containerClass` - CSS class of the container (default: `content-grid`)
* `innerClasses` - CSS classes on elements inside the items that should also be explicitly 
resized e.g. overlays (default: `[]`)
* `itemClass` - CSS class of items in the container (default: `content-item`)
* `targetHeight` - ideal height of rows of content in px (default: `400`)

## Example

// TODO

## Roadmap

* Work on multiple containers (currently only the first matching the class name is used)
* Add a `redraw()` method that removes content from rows and then recalculates the tiling 
(useful for screen size or orientation changes)
* Move away from using data-attrs to improve performance
* IE8 support could be added by moving away from `getElementsByClassName()`
