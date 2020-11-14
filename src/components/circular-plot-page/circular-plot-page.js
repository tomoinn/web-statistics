import ko from 'knockout';
import homeTemplate from './circular-plot-page.html';
import mapping from 'knockout-mapping';

function CircularPlotPage(route) {
    var self = this;
    this.configJSON = ko.pureComputed({
        read: function () {
            return mapping.toJSON({config: self.plotConfig, data: self.plotData});
        },
        write: function (value) {
            var json = JSON.parse(value);
            for (propertyName in self.plotConfig) {
                if (self.plotConfig.hasOwnProperty(propertyName)) {
                    self.plotConfig[propertyName](json.config[propertyName]);
                }
            }
            self.dataAsString(json.data.join(", "));
        },
        owner: self
    });
    this.colorPalette = [
        "#ffffff", "#000000", "#d6ecff", "#4e5b6f", "#7fd13b", "#ea157a", "#feb80a", "#00addc", "#738ac8", "#1ab39f",
        "#f2f2f2", "#7f7f7f", "#a7d6ff", "#d9dde4", "#e5f5d7", "#fad0e4", "#fef0cd", "#c5f2ff", "#e2e7f4", "#c9f7f1",
        "#d8d8d8", "#595959", "#60b5ff", "#b3bcca", "#cbecb0", "#f6a1c9", "#fee29c", "#8be6ff", "#c7d0e9", "#94efe3",
        "#bfbfbf", "#3f3f3f", "#007dea", "#8d9baf", "#b2e389", "#f272af", "#fed46b", "#51d9ff", "#aab8de", "#5fe7d5",
        "#a5a5a5", "#262626", "#003e75", "#3a4453", "#5ea226", "#af0f5b", "#c58c00", "#0081a5", "#425ea9", "#138677",
        "#7f7f7f", "#0c0c0c", "#00192e", "#272d37", "#3f6c19", "#750a3d", "#835d00", "#00566e", "#2c3f71", "#0c594f"
    ];
    this.message = ko.observable('Welcome to webStats!');
    this.dataAsString = ko.observable(null);

    this.plotData = ko.computed(function () {
        console.log(self.dataAsString());
        if (self.dataAsString()) {
            return self.dataAsString().split(",").map(parseFloat).filter(function (value) {
                return !Number.isNaN(value);
            });
        }
        return [];
    });
    this.plotConfig = {
        lengthOfDay: ko.observable(24).extend({numeric: {precision: 2, defaultValue: 24}}), //
        mainAxisRadius: ko.observable(200).extend({numeric: {}}), //
        mainAxisWidth: ko.observable(2).extend({numeric: {}}), //
        mainAxisColour: ko.observable('#333333'), //
        axisTickWidth: ko.observable(1).extend({numeric: {}}),//
        axisTickColour: ko.observable('#333333'),//
        axisTickLength: ko.observable(6).extend({numeric: {}}),//
        binTickWidth: ko.observable(1).extend({numeric: {}}),//
        binTickColour: ko.observable('#777777'),//
        binTickSize: ko.observable(4).extend({numeric: {}}),//
        binSize: ko.observable(0.25).extend({numeric: {precision: 2, defaultValue: 0.25}}),//
        blobColour: ko.observable('#d9edf7'),//
        modalBlobColour: ko.observable('#fcf8e3'),//
        meanBlobColour: ko.observable('#dff0d8'),//
        meanBlobSize: ko.observable(20).extend({numeric: {}}),
        magnitudeBlobColour: ko.observable('#f2dede'),//
        magnitudeBlobSize: ko.observable(15).extend({numeric: {}}),
        magnitudeLineWidth: ko.observable(2).extend({numeric: {}}),
        blobLineWidth: ko.observable(2).extend({numeric: {}}),
        blobSize: ko.observable(10).extend({numeric: {}}),
        blobSep: ko.observable(5).extend({numeric: {}}),
        canvasSize: ko.observable(500).extend({numeric: {}})
    };
    this.plotStats = mapping.fromJS({
        circularMean: null,
        vectorMagnitude: null,
        dataPointCount: null
    });
}

CircularPlotPage.prototype.doSomething = function () {
    this.plotConfig.lengthOfDay(20);
    this.message('You invoked doSomething() on the viewmodel.');
};

export default {viewModel: CircularPlotPage, template: homeTemplate};
