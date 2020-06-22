import {Component, OnInit, AfterViewInit, NgZone, OnDestroy, Input} from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { get, each, map, filter } from 'lodash';
import { ChartService } from '../../services/chart.service';
import { EventsService } from '../../services/events.service';

@Component({
  selector: 'app-assetschart',
  templateUrl: './assets-chart.component.html',
  styleUrls: ['./assets-chart.component.scss']
})

export class AssetschartComponent implements OnDestroy {
  isChecked: boolean = false;
  private chart: am4charts.XYChart;

  @Input() response: any[];
  @Input() measName: any;

  constructor(private zone: NgZone, private chartService: ChartService, public events: EventsService) {
    events.listen('asset:Data', async (response) => {
      console.log('response', response);
      this.response = response;
      await this.getData();
    });
  }

  /*public async getAllData() {

    // get the selected response

    /!*this.response = [
      {date: '2019-02-05T10:00:01+00:00', value: 3.26, unit: 'kwh'},
      {date: '2019-08-07T10:00:01+00:00', value: 17.26, unit: 'kwh'},
      {date: '2020-05-07T10:00:01+00:00', value: 37.26, unit: 'kwh'},
      {date: '2020-10-07T10:00:01+00:00', value: 97.26, unit: 'kwh'}
    ];*!/
  }*/

  public async getData() {

    // Create Chart

    let chart = am4core.create("chartdiv", am4charts.XYChart);
    chart.paddingRight = 40;
    chart.data = this.response;

    // Set the xAxes and yAxes

    await this.chartService.getDateAxis(chart);
    await this.chartService.getValueAxis(chart);
    await this.chartService.setSeries(chart, this.measName);
    await this.chartService.chartAxis(chart);
    await this.chartService.renderChart(chart);

   // console.log(this.chartData);


    let chartnewData = this.response;

    chart.exporting.menu = new am4core.ExportMenu();
    var self = this;
    document.getElementById("chkStack").addEventListener("change", function () {
      if (self.isChecked) {
        chart.leftAxesContainer.layout = "vertical";
        chartnewData.forEach((element) => {
          element.valueAxis.marginBottom = 20;
        });
      }
      else {
        chart.leftAxesContainer.layout = "horizontal";
      }
    });

    var lastValue = 0;
    var selectedItem = "month";

    document.getElementById("previous").addEventListener("click", function () {
      if (selectedItem === "minute") {
        var last = new Date(lastValue).setDate(new Date(lastValue).getDate() - 7);
        var newData = chartnewData.filter(x => new Date(x.date).getTime() >= last && x.date.getTime() <= lastValue);
        lastValue = last;
        chartnewData.forEach((element) => {
          element.dateAxis.groupCount = 6 * 24 * 7;
        });
        chart.data = newData;
      }
      else if (selectedItem === "hour") {
        var last = new Date(lastValue).setDate(new Date(lastValue).getDate() - 30);
        var newData = chartnewData.filter(x => new Date(x.date).getTime() >= last && x.date.getTime() <= lastValue);
        lastValue = last;
        chartnewData.forEach((element) => {
          element.dateAxis.groupCount = 24 * 31;
        });
        chart.data = newData;
      }
      else if (selectedItem === "day") {
        var last = new Date(lastValue).setDate(new Date(lastValue).getDate() - 30);
        var newData = chartnewData.filter(x => x.date >= last && new Date(x.date).getTime() <= lastValue);
        lastValue = last;
        chartnewData.forEach((element) => {
          element.dateAxis.groupCount = 30 * 2;
        });
        chart.data = newData;
      }
    });
    document.getElementById("next").addEventListener("click", function () {
      if (selectedItem === "minute") {
        var last = new Date(lastValue).setDate(new Date(lastValue).getDate() + 7);
        var newData = chartnewData.filter(x => x.date.getTime() >= last && new Date(x.date).getTime() <= new Date(last).setDate(new Date(last).getDate() + 7));
        lastValue = last;
        chartnewData.forEach((element) => {
          element.dateAxis.groupCount = 6 * 24 * 7;
        });
        chart.data = newData;
      }
      else if (selectedItem === "hour") {
        var last = new Date(lastValue).setDate(new Date(lastValue).getDate() + 30);
        var newData = chartnewData.filter(x => x.date.getTime() >= last && new Date(x.date).getTime() <= new Date(last).setDate(new Date(last).getDate() + 7));
        lastValue = last;
        chartnewData.forEach((element) => {
          element.dateAxis.groupCount = 24 * 31;
        });
        chart.data = newData;
      }
      else if (selectedItem === "day") {
        var last = new Date(lastValue).setDate(new Date(lastValue).getDate() + 30);
        var newData = chartnewData.filter(x => x.date >= last && new Date(x.date).getTime() <= new Date(last).setDate(new Date(last).getDate() + 30));
        lastValue = last;
        chartnewData.forEach((element) => {
          element.dateAxis.groupCount = 30 * 2;
        });
        chart.data = newData;
      }
    });
    document.getElementById("minute").addEventListener("click", function () {
      selectedItem = "minute";
      var last = new Date().setDate(new Date().getDate() - 8);
      lastValue = last;
      var newData = chartnewData.filter(x => new Date(x.date).getTime() >= last);
      chartnewData.forEach((element) => {
        element.dateAxis.groupCount = 6 * 24 * 8;
      });
      chart.data = newData;
    });
    document.getElementById("hour").addEventListener("click", function () {
      selectedItem = "hour";
      var last = new Date().setDate(new Date().getDate() - 31);
      lastValue = last;
      var newData = chartnewData.filter(x => new Date(x.date).getTime() >= last);
      chartnewData.forEach((element) => {
        element.dateAxis.groupCount = 24 * 31;
      });
      chart.data = newData;
    });
    document.getElementById("day").addEventListener("click", function () {
      selectedItem = "day";
      var last = new Date().setDate(new Date().getDate() - 31);
      lastValue = last;
      var newData = chartnewData.filter(x => new Date(x.date).getTime() >= last);
      chartnewData.forEach((element) => {
        element.dateAxis.groupCount = 24 * 31;
      });

      chart.data = newData;
    });
    document.getElementById("month").addEventListener("click", function () {
      selectedItem = "month";
      var last = new Date().setDate(new Date().getDate() - 365);
      lastValue = last;
      var newData = chartnewData.filter(x => new Date(x.date).getTime() >= last);
      chartnewData.forEach((element) => {
        element.dateAxis.groupCount = 31;
      });
      chart.data = newData;
    });
    var inputFieldFormat = "yyyy-MM-dd";
    chartnewData.forEach((element) => {
      element.dateAxis.events.on("selectionextremeschanged", function () {
        updateFieldsZoom();
      });
      element.dateAxis.events.on("extremeschanged", updateFieldsZoom);
      function updateFieldsZoom() {
        var minZoomed = element.dateAxis.getTimeminZoomed + am4core.time.getDuration(element.dateAxis.mainBaseInterval.timeUnit, element.dateAxis.mainBaseInterval.count) * 0.5;
        document.getElementById("fromfield").innerText = chart.dateFormatter.format(minZoomed, inputFieldFormat);
        document.getElementById("tofield").innerText = chart.dateFormatter.format(new Date(element.dateAxis.maxZoomed), inputFieldFormat);
      }
    });
    this.chart = chart;
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });

    this.events.dispose('asset:Data');
  }
}
