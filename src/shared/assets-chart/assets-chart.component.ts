import {Component, NgZone, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { get, each, map, filter } from 'lodash';
import { ChartService } from '../../services/chart.service';
import { EventsService } from '../../services/events.service';
import * as moment from 'moment';

@Component({
  selector: 'app-assets-chart',
  templateUrl: './assets-chart.component.html',
  styleUrls: ['./assets-chart.component.scss']
})

export class AssetschartComponent implements OnDestroy {

  public isChecked = false;
  private chart: am4charts.XYChart;
  public lastValue: any;
  public selectedItem = 'month';
  public chartnewData: any;
  public measName: any;

  @Input() data: any[];
  @Output() selectedValue: EventEmitter<any> = new EventEmitter();

  constructor(private zone: NgZone, private chartService: ChartService, public events: EventsService) {
    events.listen('asset:Data', async (response) => {
      await this.getData(response);
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

  public async getData(response) {

    console.log('data', response);

    /*const data = [];
    each(response, function (chartResult) {
      const data1 = JSON.parse(chartResult);
      data.push({ date: data1.meas_time, value: data1.meas_num_v, unit: 'kwh'});
    });
*/
    // Create Chart

    this.chart = am4core.create("chartdiv", am4charts.XYChart);
    this.chart.paddingRight = 40;
    this.chart.data = response;

    // Set the xAxes and yAxes

    await this.chartService.getDateAxis(this.chart);
    await this.chartService.getValueAxis(this.chart);
    await this.chartService.setSeries(this.chart, this.measName);
    await this.chartService.chartAxis(this.chart);
    await this.chartService.renderChart(this.chart);

   // console.log(this.chartData);


    this.chartnewData = response;

    this.chart.exporting.menu = new am4core.ExportMenu();
    var self = this;
   /* document.getElementById("chkStack").addEventListener("change", function () {
      if (self.isChecked) {
        this.chart.leftAxesContainer.layout = "vertical";
        this.chartnewData.forEach((element) => {
          element.valueAxis.marginBottom = 20;
        });
      }
      else {
        this.chart.leftAxesContainer.layout = "horizontal";
      }
    });

    document.getElementById("previous").addEventListener("click", function () {
      if (this.selectedItem === "minute") {
        var last = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 7);
        var newData = this.chartnewData.filter(x => new Date(x.date).getTime() >= last && x.date.getTime() <= this.lastValue);
        this.lastValue = last;
        this.chartnewData.forEach((element) => {
          element.dateAxis.groupCount = 6 * 24 * 7;
        });
        this.chart.data = newData;
      }
      else if (this.selectedItem === "hour") {
        var last = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 30);
        var newData = this.chartnewData.filter(x => new Date(x.date).getTime() >= last && x.date.getTime() <= this.lastValue);
        this.lastValue = last;
        this.chartnewData.forEach((element) => {
          element.dateAxis.groupCount = 24 * 31;
        });
        this.chart.data = newData;
      }
      else if (this.selectedItem === "day") {
        var last = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 30);
        var newData = this.chartnewData.filter(x => x.date >= last && new Date(x.date).getTime() <= this.lastValue);
        this.lastValue = last;
        this.chartnewData.forEach((element) => {
          element.dateAxis.groupCount = 30 * 2;
        });
        this.chart.data = newData;
      }
    });
    document.getElementById("next").addEventListener("click", function () {
      if (this.selectedItem === "minute") {
        var last = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() + 7);
        var newData = this.chartnewData.filter(x => x.date.getTime() >= last && new Date(x.date).getTime() <= new Date(last).setDate(new Date(last).getDate() + 7));
        this.lastValue = last;
        this.chartnewData.forEach((element) => {
          element.dateAxis.groupCount = 6 * 24 * 7;
        });
        this.chart.data = newData;
      }
      else if (this.selectedItem === "hour") {
        var last = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() + 30);
        var newData = this.chartnewData.filter(x => x.date.getTime() >= last && new Date(x.date).getTime() <= new Date(last).setDate(new Date(last).getDate() + 7));
        this.lastValue = last;
        this.chartnewData.forEach((element) => {
          element.dateAxis.groupCount = 24 * 31;
        });
        this.chart.data = newData;
      }
      else if (this.selectedItem === "day") {
        var last = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() + 30);
        var newData = this.chartnewData.filter(x => x.date >= last && new Date(x.date).getTime() <= new Date(last).setDate(new Date(last).getDate() + 30));
        this.lastValue = last;
        this.chartnewData.forEach((element) => {
          element.dateAxis.groupCount = 30 * 2;
        });
        this.chart.data = newData;
      }
    });

    document.getElementById("minute").addEventListener("click", function () {
      this.selectedItem = "minute";
      var last = new Date().setDate(new Date().getDate() - 8);
      this.lastValue = last;
      var newData = this.chartnewData.filter(x => new Date(x.date).getTime() >= last);
      console.log('newData', newData);

      this.chartnewData.forEach((element) => {
        element.dateAxis.groupCount = 6 * 24 * 8;
      });

      this.chart.data = newData;
    });
    document.getElementById("hour").addEventListener("click", function () {
      this.selectedItem = "hour";
      var last = new Date().setDate(new Date().getDate() - 31);
      this.lastValue = last;
      var newData = this.chartnewData.filter(x => new Date(x.date).getTime() >= last);
      console.log('newData', newData);

      this.chartnewData.forEach((element) => {
        element.dateAxis.groupCount = 24 * 31;
      });
      this.chart.data = newData;
    });

    document.getElementById("month").addEventListener("click", function () {
      this.selectedItem = "month";
      var last = new Date().setDate(new Date().getDate() - 365);
      this.lastValue = last;
      var newData = this.chartnewData.filter(x => new Date(x.date).getTime() >= last);
      this.chartnewData.forEach((element) => {
        element.dateAxis.groupCount = 31;
      });
      this.chart.data = newData;

    });
    var inputFieldFormat = "yyyy-MM-dd";
    this.chartnewData.forEach((element) => {
      element.dateAxis.events.on("selectionextremeschanged", function () {
        updateFieldsZoom();
      });
      element.dateAxis.events.on("extremeschanged", updateFieldsZoom);
      function updateFieldsZoom() {
        var minZoomed = element.dateAxis.getTimeminZoomed + am4core.time.getDuration(element.dateAxis.mainBaseInterval.timeUnit, element.dateAxis.mainBaseInterval.count) * 0.5;
        document.getElementById("fromfield").innerText = this.chart.dateFormatter.format(minZoomed, inputFieldFormat);
        document.getElementById("tofield").innerText = this.chart.dateFormatter.format(new Date(element.dateAxis.maxZoomed), inputFieldFormat);
      }
    });
    console.log('this.this.chart', this.chart);*/
  }

  public getEvent(value) {
    let days = 365;

    switch (value) {
      default:
        days = 365;
        this.setRange(value, days);
        return 'month';
      case 'month':
        days = 365;
        this.setRange(value, days);
        return;
      case 'day':
        days = 31;
        this.setRange(value, days);
        return;
      case 'hour':
        days = 31;
        this.setRange(value, days);
        return;
      case 'minute':
        days = 8;
        this.setRange(value, days);
        return;
      case 'previous':
        this.setPreviousRange();
        return;
      case 'next':
        this.setNextRange();
        return;
    }
  }


  public setRange(value, days) {
      this.selectedItem = value;

      const first = moment().subtract('days', days).format('YYYY-MM-DD');
      const last = moment().format('YYYY-MM-DD');

      const setDateRange = [];
      this.lastValue = first;

      setDateRange.push({first: first, last: last});

      this.events.emit('onClick:Event', setDateRange);
      this.selectedValue.emit(this.selectedItem);

      if (this.selectedItem === 'minute') {
        this.chartnewData.forEach((element) => {
          element.dateAxis.groupCount = 6 * 24 * 8;
        });
      } else if (this.selectedItem === 'hour') {
        this.chartnewData.forEach((element) => {
          element.dateAxis.groupCount = 24 * 31;
        });
      } else if (this.selectedItem === 'day') {
        this.chartnewData.forEach((element) => {
          element.dateAxis.groupCount = 31;
        });
      } else {
        this.chartnewData.forEach((element) => {
          element.dateAxis.groupCount = 365;
        });
      }

      this.chart.data = this.chartnewData;
  }

  public setPreviousRange() {

    let first;

    if (this.selectedItem === 'minute') {
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 7);
    } else if (this.selectedItem === 'hour' || this.selectedItem === 'day') {
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 30);
    } else {
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 365);
    }

    first = moment(first).format('YYYY-MM-DD');

    const setDateRange = [];
    setDateRange.push({first: first, last: this.lastValue});

    this.lastValue = first;

    this.events.emit('onClick:Event', setDateRange);
    this.selectedValue.emit(this.selectedItem);

    if (this.selectedItem === 'minute') {
      this.chartnewData.forEach((element) => {
        element.dateAxis.groupCount = 6 * 24 * 7;
      });
    } else if (this.selectedItem === 'hour') {
      this.chartnewData.forEach((element) => {
        element.dateAxis.groupCount = 24 * 31;
      });
    } else if (this.selectedItem === 'day') {
      this.chartnewData.forEach((element) => {
        element.dateAxis.groupCount = 30 * 2;
      });
    } else {
      this.chartnewData.forEach((element) => {
        element.dateAxis.groupCount = 365;
      });
    }

    this.chart.data = this.chartnewData;

  }

  public setNextRange() {

    let first;

    if (this.selectedItem === 'minute') {

      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() + 7);
      this.lastValue = new Date(first).setDate(new Date(first).getDate() + 7);
      this.lastValue = moment(this.lastValue).format('YYYY-MM-DD');

    } else if (this.selectedItem === 'hour' || this.selectedItem === 'day') {

      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() + 30);
      this.lastValue = new Date(first).setDate(new Date(first).getDate() + 30);
      this.lastValue = moment(this.lastValue).format('YYYY-MM-DD');

    } else {

      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() + 365);
      this.lastValue = new Date(first).setDate(new Date(first).getDate() + 365);
      this.lastValue = moment(this.lastValue).format('YYYY-MM-DD');
    }

    first = moment(first).format('YYYY-MM-DD');

    const setDateRange = [];
    setDateRange.push({first: first, last: this.lastValue});

    this.lastValue = first;

    this.selectedValue.emit(this.selectedItem);

    this.events.emit('onClick:Event', setDateRange);

    console.log('this.selectedItem', this.selectedItem);

    if (this.selectedItem === 'minute') {
      this.chartnewData.forEach((element) => {
        element.dateAxis.groupCount = 6 * 24 * 7;
      });
    } else if (this.selectedItem === 'hour') {
      this.chartnewData.forEach((element) => {
        element.dateAxis.groupCount = 24 * 31;
      });
    } else if (this.selectedItem === 'day') {
      this.chartnewData.forEach((element) => {
        element.dateAxis.groupCount = 30 * 2;
      });
    } else {
      this.chartnewData.forEach((element) => {
        element.dateAxis.groupCount = 365;
      });
    }

    this.chart.data = this.chartnewData;

  }

  public ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });

    this.events.dispose('asset:Data');
  }
}
