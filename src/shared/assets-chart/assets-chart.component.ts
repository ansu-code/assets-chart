import {Component, OnInit, AfterViewInit, NgZone, OnDestroy, Input} from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { get, each, map, filter } from 'lodash';

@Component({
  selector: 'app-assetschart',
  templateUrl: './assets-chart.component.html',
  styleUrls: ['./assets-chart.component.scss']
})

export class AssetschartComponent implements OnInit, AfterViewInit, OnDestroy {
  isChecked: boolean = false;
  private chart: am4charts.XYChart;
  private chartData: any;
  private data: any;

  @Input() response: any;
  @Input() measName: any;

  constructor(private zone: NgZone) { }
  public ngOnInit() {
    console.log('response', this.response);
  }

  public async getAllData() {

    this.response = [
      {date: '2019-02-05T10:00:01+00:00', value: 3.26, unit: 'kwh'},
      {date: '2019-08-07T10:00:01+00:00', value: 17.26, unit: 'kwh'},
      {date: '2020-05-07T10:00:01+00:00', value: 37.26, unit: 'kwh'},
      {date: '2020-10-07T10:00:01+00:00', value: 97.26, unit: 'kwh'}
    ];
  }

  public getDateAxis(chart) {
    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.labels.template.fill = am4core.color("#e59165");
    dateAxis.groupData = true;
    dateAxis.groupCount = 13;

    chart.data.forEach((element) => {
      element.dateAxis = dateAxis;
    });
  }

  public getValueAxis(chart) {
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.tooltip.disabled = true;
    valueAxis.renderer.labels.template.fill = am4core.color("#e59165");
    valueAxis.renderer.minWidth = 60;

    chart.data.forEach((element) => {
      element.valueAxis = valueAxis;
    });
  }

  public setSeries(chart, name) {

    let series = chart.series.push(new am4charts.LineSeries());

    series.name = name;

    let i = 1;
    chart.data.forEach((element) => {

      series.dataFields.dateX = "date";
      series.dataFields.valueY = "value";
      series.yAxis = element.valueAxis;
      series.xAxis = element.dateAxis;
      series.tooltipText = "{valueY.value} {unit}";
      series.fill = am4core.color("#e59165");
      series.stroke = am4core.color("#e59165");
      element.series = series;
      i++;
    });
  }

  public chartAxis(chart) {
    chart.data.forEach((element) => {
      chart.cursor = new am4charts.XYCursor();
      chart.cursor.xAxis = element.dateAxis;

      let scrollbarX = new am4charts.XYChartScrollbar();
      chart.scrollbarX = scrollbarX;
      chart.legend = new am4charts.Legend();
      chart.legend.parent = chart.plotContainer;
      chart.legend.zIndex = 100;

      element.scrollbarX = scrollbarX;
    });
  }

  public renderChart(chart) {
    chart.data.forEach((element) => {
      element.valueAxis.renderer.grid.template.strokeOpacity = 0.07;
      element.dateAxis.renderer.grid.template.strokeOpacity = 0.07;
    });
  }

  public async ngAfterViewInit() {

    await this.getAllData();

    let chart = am4core.create("chartdiv", am4charts.XYChart);
    chart.paddingRight = 40;

      chart.data = this.response;
       this.getDateAxis(chart);
       this.getValueAxis(chart);
       this.setSeries(chart, this.measName);
       this.chartAxis(chart);
       this.renderChart(chart);

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
//    });
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }
}
