import ko from 'knockout';
import router from './router';
import NavBar from '../components/nav-bar/nav-bar';
import HomePage from '../components/home-page/home.html';
import CPPage from '../components/circular-plot-page/circular-plot-page';
import CircularPlot from '../components/circular-plot/circular-plot';
import AboutPage from '../components/about-page/about.html';

import 'bootstrap';
import 'kendo-ui-core';
import 'knockout-kendo';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/styles.css';
import 'kendo-ui-core/css/web/kendo.common-bootstrap.css';
import 'kendo-ui-core/css/web/kendo.bootstrap.css';

// Components can be packaged as modules, such as the following:
ko.components.register('nav-bar', NavBar);
ko.components.register('home-page', {
    template: HomePage
});
ko.components.register('circular-plot-page', CPPage);
ko.components.register('circular-plot', CircularPlot);

// ... or for template-only components, you can just point to a .html file directly:
ko.components.register('about-page', {
    template: AboutPage
});

// [Scaffolded component registrations will be inserted here. To retain this feature, don't remove this comment.]

ko.extenders.numeric = function (target, spec) {
    var precision = spec.precision;
    if (!precision) {
        precision = 0;
    }
    var defaultValue = spec.defaultValue;
    if (!defaultValue) {
        defaultValue = 1;
    }
    //create a writable computed observable to intercept writes to our observable
    var result = ko.pureComputed({
        read: target,  //always return the original observables value
        write: function (newValue) {
            if (!newValue) {
                newValue = "foo";
            }
            var current = target(),
                roundingMultiplier = Math.pow(10, precision),
                newValueAsNum = isNaN(newValue) ? defaultValue : parseFloat(+newValue),
                valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;

            //only write if it changed
            if (valueToWrite !== current) {
                target(valueToWrite);
            } else {
                //if the rounded value is the same, but a different value was written, force a notification for the current field
                if (newValue !== current) {
                    target.notifySubscribers(valueToWrite);
                }
            }
        }
    }).extend({notify: 'always'});

    //initialize with current value to make sure it is rounded appropriately
    result(target());

    //return the new computed observable
    return result;
};

// Start the application
ko.applyBindings({route: router.currentRoute});
