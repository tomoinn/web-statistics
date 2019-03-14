// require.js looks for the following global when initializing
require = {
    baseUrl: ".",
    paths: {
        "bootstrap": "bower_modules/components-bootstrap/js/bootstrap.min",
        "crossroads": "bower_modules/crossroads/dist/crossroads.min",
        "hasher": "bower_modules/hasher/dist/js/hasher.min",
        "jquery": "bower_modules/jquery/dist/jquery",
        "knockout": "bower_modules/knockout/dist/knockout",

        "knockout-mapping": "bower_modules/knockout-mapping/knockout.mapping",
        "signals": "bower_modules/js-signals/dist/signals.min",
        "text": "bower_modules/requirejs-text/text",
        "colour": "bower_modules/tinycolor/tinycolor",
        "knockout-kendo": "bower_modules/knockout-kendo/build/knockout-kendo.min",
        "kendo": "https://kendo.cdn.telerik.com/2018.1.221/js/kendo.all.min"
    },
    shim: {
        "bootstrap": {deps: ["jquery"]},
        "knockout-kendo": {deps: ["jquery", "kendo", "knockout"]}
    }
};
