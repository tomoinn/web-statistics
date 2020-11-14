/**
 * Created by tom on 28/06/16.
 */

import ko from 'knockout';
import templateMarkup from './circular-plot.html';
import jquery from 'jquery';
import tinycolour from 'colour';

/**
 * New circular plot
 * @param element - the DOM element within which this component is contained.
 * @param params - must comtain at least 'config' and 'data' objects.
 * @constructor
 */
function CircularPlot(element, params) {
    var self = this;
    self.canvas = jquery(element).find("#chart-canvas").get(0);
    var listener = function () {
        updateChart(self.canvas, ko.toJS(params.config), ko.toJS(params.data), params.stats);
    };
    self.subscriptions = [];
    self.subscriptions.push(ko.computed(function () {
        return ko.toJSON(params.config)
    }).subscribe(listener));
    self.subscriptions.push(params.data.subscribe(listener));
    self.canvasSize = params.config.canvasSize();
    listener();
}

/**
 * Teardown logic, remove subscriptions to data and config.
 */
CircularPlot.prototype.dispose = function () {
    var self = this;
    self.subscriptions.forEach(function (subscription) {
        subscription.dispose();
    });
    //console.log("Unsubscribing...");
};

/**
 * Update the chart.
 * @param canvas the Canvas object
 * @param extraConfig overrides default config values
 * @param data an array of floating point numbers
 * @param stats an observable object, with observable floating point values 'circularMean', 'vectorMagnitude' and
 * 'dataPointCount' which will be written to when the chart updates.
 */
function updateChart(canvas, extraConfig, data, stats) {

    var ctx = canvas.getContext("2d");

    var config = jquery.extend({
        lengthOfDay: 24,
        mainAxisRadius: 200,
        mainAxisWidth: 2,
        mainAxisColour: '#333333',
        axisTickWidth: 1,
        axisTickColour: '#333333',
        axisTickLength: 6,
        binTickWidth: 1,
        binTickColour: '#777777',
        binTickSize: 4,
        binSize: 0.25,
        blobColour: '#d9edf7',
        modalBlobColour: '#fcf8e3',
        meanBlobColour: '#dff0d8',
        meanBlobSize: 20,
        magnitudeBlobColour: '#f2dede',
        magnitudeBlobSize: 15,
        magnitudeLineWidth: 2,
        blobLineWidth: 2,
        blobSize: 10,
        blobSep: 5,
        canvasSize: 500
    }, extraConfig);

    //console.log(config, data);

    var hourToRadians = function (hour) {
        return Math.PI * 2 * hour / config.lengthOfDay;
    };

    function radiansToHours(radians) {
        return radians / (Math.PI * 2) * config.lengthOfDay;
    }

    var polarToCart = function (hour, offset) {
        var radians = hourToRadians(hour) - Math.PI / 2;
        var radius = config.mainAxisRadius + offset;
        var sin = Math.sin(radians);
        var cos = Math.cos(radians);
        return {
            x: radius * cos,
            y: radius * sin
        }
    };

    var circularMean = function (sumOfSin, sumOfCos) {
        var mean = Math.atan(sumOfSin / sumOfCos);
        if (sumOfCos < 0) {
            mean += Math.PI;
        } else if (sumOfSin < 0 && sumOfCos > 0) {
            mean += Math.PI * 2;
        }
        return mean;
    };

    /**
     * Draw a blob
     * @param coordinates {x, y} coordinates for the blob centre
     * @param radius radius in pixels
     * @param colour colour to use
     */
    var drawBlob = function (coordinates, radius, colour) {
        if (!colour) {
            colour = config.blobColour;
        }
        ctx.save();
        ctx.strokeStyle = tinycolour(colour).darken(50).toHexString();
        ctx.fillStyle = tinycolour(colour).toHexString();
        ctx.lineWidth = config.blobLineWidth;
        ctx.beginPath();
        ctx.arc(coordinates.x, coordinates.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    };

    /**
     * Draw the axis
     */
    var initCanvas = function () {
        canvas.width = config.canvasSize;
        canvas.height = config.canvasSize;
        ctx.translate(config.canvasSize / 2, config.canvasSize / 2);
        ctx.save();
        ctx.strokeStyle = config.mainAxisColour;
        ctx.lineWidth = config.mainAxisWidth;
        ctx.beginPath();
        ctx.arc(0, 0, config.mainAxisRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
        ctx.strokeStyle = config.axisTickColour;
        ctx.lineWidth = config.axisTickWidth;
        for (var hour = 0; hour < config.lengthOfDay; hour++) {
            var from = polarToCart(hour, config.mainAxisWidth / 2);
            var to = polarToCart(hour, config.mainAxisWidth / 2 + config.axisTickLength);
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
            ctx.closePath();
        }
        ctx.strokeStyle = config.binTickColour;
        ctx.lineWidth = config.binTickWidth;
        for (var binHour = 0; binHour < config.lengthOfDay; binHour += config.binSize) {
            var tickFrom = polarToCart(binHour, -config.mainAxisWidth / 2);
            var tickTo = polarToCart(binHour, -(config.binTickSize + config.mainAxisWidth / 2));
            ctx.beginPath();
            ctx.moveTo(tickFrom.x, tickFrom.y);
            ctx.lineTo(tickTo.x, tickTo.y);
            ctx.stroke();
            ctx.closePath();
        }
        ctx.restore();
    };

    var hist = new Array(config.lengthOfDay / config.binSize).fill(0);
    var validDataPoints = 0;
    var sumOfSin = 0.0;
    var sumOfCos = 0.0;
    var maxCount = 0;
    var allCoords = [];

    data.forEach(function (value) {
        if (!Number.isNaN(value)) {
            allCoords.push(polarToCart(value % config.lengthOfDay, 0));
            validDataPoints++;
            var bin = Math.floor((value / config.binSize) % (config.lengthOfDay / config.binSize));
            hist[bin]++;
            maxCount = Math.max(maxCount, hist[bin]);
            sumOfSin += Math.sin(hourToRadians(value));
            sumOfCos += Math.cos(hourToRadians(value));
        }
    });

    initCanvas();

    //console.log(hist);

    hist.forEach(function (binCount, binIndex) {
        var colour = config.blobColour;
        if (binCount == maxCount) {
            colour = config.modalBlobColour;
        }
        var binHour = (binIndex + 0.5) * config.binSize;
        for (var count = 0; count < binCount; count++) {
            drawBlob(polarToCart(binHour, -(count * (config.blobSize + config.blobSep)
                                            + config.blobSep + config.blobSize / 2)), config.blobSize / 2, colour);
        }
    });

    // Show stats if we have some data points
    if (validDataPoints > 0) {
        var meanHour = radiansToHours(circularMean(sumOfSin, sumOfCos));
        var magnitude = Math.sqrt(Math.pow(sumOfSin / validDataPoints, 2) + Math.pow(sumOfCos / validDataPoints, 2));
        //console.log("Magnitude is ", magnitude);
        var meanPoint = polarToCart(meanHour, 0);
        var magnitudePoint = polarToCart(meanHour, -(1 - magnitude) * config.mainAxisRadius);
        ctx.save();
        ctx.strokeStyle = tinycolour(config.magnitudeBlobColour).darken(50).toHexString();
        ctx.lineWidth = config.magnitudeLineWidth;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(magnitudePoint.x, magnitudePoint.y);
        ctx.stroke();
        ctx.closePath();
        ctx.strokeStyle = config.mainAxisColour;
        ctx.beginPath();
        ctx.moveTo(magnitudePoint.x, magnitudePoint.y);
        ctx.lineTo(meanPoint.x, meanPoint.y);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
        drawBlob(meanPoint, config.meanBlobSize / 2, config.meanBlobColour);
        drawBlob(magnitudePoint, config.magnitudeBlobSize / 2, config.magnitudeBlobColour);
        stats.circularMean(meanHour);
        stats.vectorMagnitude(magnitude);
        stats.dataPointCount(validDataPoints);
    }


}

export default {
    // Pass in a createView function so our constructor has access to the DOM element, this is
    // then used to find the Canvas element so we can draw stuff into it.
    viewModel: {
        createViewModel: function (params, componentInfo) {
            return new CircularPlot(componentInfo.element, params);
        }
    },
    template: templateMarkup
};
