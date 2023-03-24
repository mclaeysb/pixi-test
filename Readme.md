# Interactive Thin Plate Spline warping - A test with PIXI

This is a simple test to create a Thin Plate Spline warping of images.

## Getting started

Start an http server and open `index.html`

Drag the five blue and red dots. 

Click the `Georeference` button. The image will be reprojected such that what's under a red dot will end up under it's corresponding blue dot.

## Code used

This test project uses the [Pixi](https://pixijs.download/) library which is a WebGL framework: it gives you access to the power of the WebGL but without having to set up complex things like 'shaders'.

It also uses the [ThinPlateSplineJS](https://github.com/tilemapjp/ThinPlateSplineJS) library to compute the Thin Plate Spline. This library is a port of gdal, and was one of the only JS implementations of a Thin Plate Spline available at the time. See [tps.js](./tps.js).

This code is a remix of an exiting [CodePen](https://codepen.io/jaank/pen/OoywwX).

## Improvement

This has stayed a test, but futher improvements could include:

- Manually adding GCPs, e.g. by clicking on the screen.
- Live reprojecting adding points (or dragging points, if fast enough) // This was not working because on every successive reprojections were building on each other instead of starting from the start.