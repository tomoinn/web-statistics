// require.js looks for the following global when initializing
var require = {
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
        "kendo": "bower_modules/kendo-ui-core/js/kendo.ui.core.min",
        "kendobindings": "bower_modules/knockout-kendo/build/knockout-kendo.min"
    },
    shim: {
        "bootstrap": {deps: ["jquery"]},
        "kendo": {deps: ["jquery"]},
        "kendobindings": {deps: ["jquery", "kendo", "knockout"]}
    }
};
