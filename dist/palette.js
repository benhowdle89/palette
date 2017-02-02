(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Palette = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var prefixes = ['webkit'];

var targetSelector = 'data-palette-target';
var targetOutput = 'data-palette-output';

var Palette = function () {
    function Palette(target) {
        _classCallCheck(this, Palette);

        this.target = target;
        this.output = this.target.parentElement ? this.target.parentElement.querySelector('[' + targetOutput + ']') : null;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.imageDimensions = {
            width: 0,
            height: 0
        };
        this.imageData = [];
        this.readImage();
    }

    _createClass(Palette, [{
        key: 'readImage',
        value: function readImage() {
            this.imageDimensions.width = this.target.width * 0.1;
            this.imageDimensions.height = this.target.height * 0.1;
            this.render();
        }
    }, {
        key: 'getImageData',
        value: function getImageData() {
            var imageData = this.ctx.getImageData(0, 0, this.imageDimensions.width, this.imageDimensions.height).data;
            this.imageData = Array.from(imageData);
        }
    }, {
        key: 'getChunkedImageData',
        value: function getChunkedImageData() {
            var perChunk = 4;

            var chunked = this.imageData.reduce(function (ar, it, i) {
                var ix = Math.floor(i / perChunk);
                if (!ar[ix]) {
                    ar[ix] = [];
                }
                ar[ix].push(it);
                return ar;
            }, []);

            var filtered = chunked.filter(function (rgba) {
                return rgba.slice(0, 2).every(function (val) {
                    return val < 250;
                }) && rgba.slice(0, 2).every(function (val) {
                    return val > 0;
                });
            });

            return filtered;
        }
    }, {
        key: 'getUniqValues',
        value: function getUniqValues(chunked) {
            return chunked.reduce(function (accum, current) {
                var key = current.join('|');
                if (!accum[key]) {
                    accum[key] = 1;
                    return accum;
                }
                accum[key] = ++accum[key];
                return accum;
            }, {});
        }
    }, {
        key: 'renderPalette',
        value: function renderPalette() {
            var top = null;
            var chunked = this.getChunkedImageData();
            var uniq = this.getUniqValues(chunked);
            var sortable = [];
            for (var rgba in uniq) {
                sortable.push([rgba, uniq[rgba]]);
            }
            var sorted = sortable.sort(function (a, b) {
                return a[1] - b[1];
            }).reverse().map(function (s) {
                var rgba = s[0].split('|');
                return {
                    r: rgba[0],
                    g: rgba[1],
                    b: rgba[2],
                    occurs: s[1]
                };
            }).slice(0, 5);
            return sorted;
        }
    }, {
        key: 'buildPaletteOutput',
        value: function buildPaletteOutput(rendered) {
            var outputNodeType = this.output.nodeName.toLowerCase();
            var frag = document.createDocumentFragment();
            rendered.forEach(function (r) {
                var childElement = outputNodeType == 'ul' ? document.createElement('li') : document.createElement('span');
                childElement.style.backgroundColor = 'rgb(' + r.r + ', ' + r.g + ', ' + r.b + ')';
                childElement.classList.add('palette-output');
                frag.appendChild(childElement);
            });
            this.output.appendChild(frag);
        }
    }, {
        key: 'render',
        value: function render() {
            this.canvas.width = this.imageDimensions.width;
            this.canvas.height = this.imageDimensions.height;
            this.ctx.drawImage(this.target, 0, 0, this.imageDimensions.width, this.imageDimensions.height);
            this.getImageData();
            var rendered = this.renderPalette();
            if (!this.output) {
                return console.log(rendered);
            }
            return this.buildPaletteOutput(rendered);
        }
    }]);

    return Palette;
}();

module.exports = function () {
    var targets = document.querySelectorAll('[' + targetSelector + ']');
    Array.from(targets).map(function (t) {
        return new Palette(t);
    });
};

},{}]},{},[1])(1)
});