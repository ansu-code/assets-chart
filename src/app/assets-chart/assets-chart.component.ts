import { Component, OnInit, AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { get, each } from 'lodash';

@Component({
  selector: 'app-assetschart',
  templateUrl: './assets-chart.component.html',
  styleUrls: ['./assets-chart.component.scss']
})
export class AssetschartComponent implements OnInit, AfterViewInit, OnDestroy {
  isChecked: boolean = false;
  private chart: am4charts.XYChart;
  private accessToken: any;
  private response: any;

  constructor(private zone: NgZone, private http: HttpClient, private api: ApiService) { }

  public ngOnInit() {

  }

  public async ngAfterViewInit() {

      await this.getData();

      var data = [];

      const result = get(this.response, 'result', []);

      each(result, function (chartResult) {
          console.log('chartResult', chartResult);
      });

    //  this.zone.runOutsideAngular(() => {
      let chart = am4core.create("chartdiv", am4charts.XYChart);
      chart.paddingRight = 40;

      /*var value = 50;
      var value2 = 50;
      for (let i = -365; i < 0; i++) {
        for (let j = 0; j < 24; j++) {
          for (let k = 0; k < 60; k += 10) {
            let date = new Date();

            date.setDate(i);
            date.setHours(j, k, 0, 0);
            value -= Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
            if (value < 0) {
              value = Math.round(Math.random() * 10);
            }
            value2 -= Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
            if (value2 < 0) {
              value2 = Math.round(Math.random() * 10);
            }
            data.push({ date: date, value: data2.meas_num_v, unit: 'kwh', value2: value2, unit2: 'mwh' });
          }
        }
      }*/

      chart.data = data;

      var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.grid.template.location = 0;
      dateAxis.renderer.labels.template.fill = am4core.color("#e59165");
      dateAxis.groupData = true;
      dateAxis.groupCount = 13;

      var dateAxis2 = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis2.renderer.grid.template.location = 0;
      dateAxis2.renderer.labels.template.fill = am4core.color("#dfcc64");
      dateAxis2.groupData = true;
      dateAxis2.groupCount = 13;

      var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.tooltip.disabled = true;
      valueAxis.renderer.labels.template.fill = am4core.color("#e59165");
      valueAxis.renderer.minWidth = 60;

      var valueAxis2 = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis2.tooltip.disabled = true;
      valueAxis2.renderer.labels.template.fill = am4core.color("#dfcc64");
      valueAxis2.renderer.minWidth = 60;
      valueAxis2.syncWithAxis = valueAxis;

      var series = chart.series.push(new am4charts.LineSeries());
      series.name = "Measure1";
      series.dataFields.dateX = "date";
      series.dataFields.valueY = "value";
      series.tooltipText = "{valueY.value} {unit}";
      series.fill = am4core.color("#e59165");
      series.stroke = am4core.color("#e59165");
      series.tensionX = 0.8;

      var series2 = chart.series.push(new am4charts.LineSeries());
      series2.name = "Measure2";
      series2.dataFields.dateX = "date";
      series2.dataFields.valueY = "value2";
      series2.yAxis = valueAxis2;
      series2.xAxis = dateAxis2;
      series2.tooltipText = "{valueY.value} {unit2}";
      series2.fill = am4core.color("#dfcc64");
      series2.stroke = am4core.color("#dfcc64");
      series2.tensionX = 0.8;

      chart.cursor = new am4charts.XYCursor();
      chart.cursor.xAxis = dateAxis2;

      var scrollbarX = new am4charts.XYChartScrollbar();
      chart.scrollbarX = scrollbarX;
      chart.legend = new am4charts.Legend();
      chart.legend.parent = chart.plotContainer;
      chart.legend.zIndex = 100;

      valueAxis2.renderer.grid.template.strokeOpacity = 0.07;
      dateAxis2.renderer.grid.template.strokeOpacity = 0.07;
      dateAxis.renderer.grid.template.strokeOpacity = 0.07;
      valueAxis.renderer.grid.template.strokeOpacity = 0.07;
      dateAxis2.renderer.labels.template.disabled = true;
      chart.exporting.menu = new am4core.ExportMenu();

      var self = this;
      document.getElementById("chkStack").addEventListener("change", function () {
        if (self.isChecked) {
          chart.leftAxesContainer.layout = "vertical";
          valueAxis.marginBottom = 20;
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
          var newData = data.filter(x => x.date.getTime() >= last && x.date.getTime() <= lastValue);
          lastValue = last;
          dateAxis.groupCount = 6 * 24 * 7;
          dateAxis2.groupCount = 6 * 24 * 7;
          chart.data = newData;
        }
        else if (selectedItem === "hour") {
          var last = new Date(lastValue).setDate(new Date(lastValue).getDate() - 30);
          var newData = data.filter(x => x.date.getTime() >= last && x.date.getTime() <= lastValue);
          lastValue = last;
          dateAxis.groupCount = 24 * 31;
          dateAxis2.groupCount = 24 * 31;
          chart.data = newData;
        }
        else if (selectedItem === "day") {
          var last = new Date(lastValue).setDate(new Date(lastValue).getDate() - 30);
          var newData = data.filter(x => x.date >= last && x.date.getTime() <= lastValue);
          lastValue = last;
          dateAxis.groupCount = 30 * 2;
          dateAxis2.groupCount = 30 * 2;
          chart.data = newData;
        }
      });
      document.getElementById("next").addEventListener("click", function () {
        if (selectedItem === "minute") {
          var last = new Date(lastValue).setDate(new Date(lastValue).getDate() + 7);
          var newData = data.filter(x => x.date.getTime() >= last && x.date.getTime() <= new Date(last).setDate(new Date(last).getDate() + 7));
          lastValue = last;
          dateAxis.groupCount = 6 * 24 * 7;
          dateAxis2.groupCount = 6 * 24 * 7;
          chart.data = newData;
        }
        else if (selectedItem === "hour") {
          var last = new Date(lastValue).setDate(new Date(lastValue).getDate() + 30);
          var newData = data.filter(x => x.date.getTime() >= last && x.date.getTime() <= new Date(last).setDate(new Date(last).getDate() + 7));
          lastValue = last;
          dateAxis.groupCount = 24 * 31;
          dateAxis2.groupCount = 24 * 31;
          chart.data = newData;
        }
        else if (selectedItem === "day") {
          var last = new Date(lastValue).setDate(new Date(lastValue).getDate() + 30);
          var newData = data.filter(x => x.date >= last && x.date.getTime() <= new Date(last).setDate(new Date(last).getDate() + 30));
          lastValue = last;
          dateAxis.groupCount = 30 * 2;
          dateAxis2.groupCount = 30 * 2;
          chart.data = newData;
        }
      });
      document.getElementById("minute").addEventListener("click", function () {
        selectedItem = "minute";
        var last = new Date().setDate(new Date().getDate() - 8);
        lastValue = last;
        var newData = data.filter(x => x.date.getTime() >= last);
        dateAxis.groupCount = 6 * 24 * 8;
        dateAxis2.groupCount = 6 * 24 * 8;
        chart.data = newData;
      });
      document.getElementById("hour").addEventListener("click", function () {
        selectedItem = "hour";
        var last = new Date().setDate(new Date().getDate() - 31);
        lastValue = last;
        var newData = data.filter(x => x.date.getTime() >= last);
        dateAxis.groupCount = 24 * 31;
        dateAxis2.groupCount = 24 * 31;
        chart.data = newData;
      });
      document.getElementById("day").addEventListener("click", function () {
        selectedItem = "day";
        var last = new Date().setDate(new Date().getDate() - 31);
        lastValue = last;
        var newData = data.filter(x => x.date.getTime() >= last);
        dateAxis.groupCount = 31;
        dateAxis2.groupCount = 31;
        chart.data = newData;
      });
      document.getElementById("month").addEventListener("click", function () {
        selectedItem = "month";
        var last = new Date().setDate(new Date().getDate() - 365);
        lastValue = last;
        var newData = data.filter(x => x.date.getTime() >= last);
        dateAxis.groupCount = 13;
        dateAxis2.groupCount = 13;
        chart.data = newData;
      });
      var inputFieldFormat = "yyyy-MM-dd";
      dateAxis.events.on("selectionextremeschanged", function () {
        updateFieldsZoom();
      });

      dateAxis.events.on("extremeschanged", updateFieldsZoom);

      function updateFieldsZoom() {
        var minZoomed = dateAxis.minZoomed + am4core.time.getDuration(dateAxis.mainBaseInterval.timeUnit, dateAxis.mainBaseInterval.count) * 0.5;
        document.getElementById("fromfield").innerText = chart.dateFormatter.format(minZoomed, inputFieldFormat);
        document.getElementById("tofield").innerText = chart.dateFormatter.format(new Date(dateAxis.maxZoomed), inputFieldFormat);
      }

      this.chart = chart;
//    });
  }

  public async getData() {
    const response = await this.api.post('ipredictapi/oidc/login',
      {
        "partyId":"TEPSOL",
        "username":"tepsoladmin1",
        "passwd":"activate"
      });

    this.accessToken = response.result.access_token;

    this.response = await this.api.post('SolarSightWS/generic/pg/selectFrom',
      {
        "keySpace": "iot",
        "tableName": "asset_meas_by_min_hist",
        "allCols": true,
        "cols": ["site_ref_key", "asset_ref_key", "meas_name", "meas_date"],
        "andConditions": [
          {"col": "party_id", "operator": "=", "value": "TEPSOL"},
          {"col": "site_ref_key", "operator": "IN", "values": ["TEPSOL_SITE_001"]},
          {"col": "asset_ref_key", "operator": "IN", "values": ["TEPSOL_SITE_001_110101"]},
          {"col": "meas_name", "operator": "IN", "values": ["COUNT_KWH_HR"]},
          {"col": "meas_date", "operator": ">=", "value": "2020-06-01"},
          {"col": "meas_date", "operator": "<=", "value": "2020-06-07"}
        ],
        "orderBy": "meas_date",
        "orderType": "ASC"
      }, this.accessToken);

  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }
}
