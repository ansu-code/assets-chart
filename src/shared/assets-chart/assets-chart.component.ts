import {Component, NgZone, OnDestroy, Input, Output, EventEmitter, AfterViewInit} from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { ChartService } from '../../services/chart.service';
import { EventsService } from '../../services/events.service';
import * as moment from 'moment';
import { isEmpty, each, map, chain, unionBy, flatten, uniq} from 'lodash';
import {element} from "protractor";

@Component({
  selector: 'app-assets-chart',
  templateUrl: './assets-chart.component.html',
  styleUrls: ['./assets-chart.component.scss']
})

export class AssetschartComponent implements OnDestroy, AfterViewInit {

  public isChecked = false;
  private chart: am4charts.XYChart;
  public lastValue: any;
  public selectedItem = 'month';
  public range: any;
  public dateAxis: any;
  public valueAxis: any;
  public series: any;

  @Input() data: any[];
  @Output() dateRange: EventEmitter<any> = new EventEmitter();
  @Output() rangeChangeEvent: EventEmitter<any> = new EventEmitter();

  constructor(private zone: NgZone, private chartService: ChartService, public events: EventsService) {
    events.listen('asset:Data', async (response) => {
    //  await this.getData(response);
      this.addSeries();
    });
  }

  public async ngAfterViewInit() {
    this.chart = am4core.create("chartdiv", am4charts.XYChart);
// Increase contrast by taking evey second color
    this.chart.colors.step = 2;
    this.chart.data = this.generateChartData();
    this.chart.legend = new am4charts.Legend();
    this.chart.cursor = new am4charts.XYCursor();
  }
  public createAxisAndSeries(field, name, opposite, bullet) {
    console.log('adding '+name);

    this.dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
    this.dateAxis.renderer.minGridDistance = 50;
    this.valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());

    this.series = this.chart.series.push(new am4charts.LineSeries());
    this.series.dataFields.valueY = field;
    this.series.dataFields.dateX = "date";
    this.series.strokeWidth = 2;
    this.series.yAxis = this.valueAxis;
    this.series.xAxis = this.dateAxis;
    this.series.name = name;
    this.series.tooltipText = "{name}: [bold]{valueY}[/]";
    this.series.tensionX = 0.8;

    let interfaceColors = new am4core.InterfaceColorSet();
    if (this.chart.className) {
      console.log('The chart object exists and is a ' + this.chart.className + ' chart');
    } else {
      console.error('No wonder it does not work, the chart object does not exist');
    }
  }

  public async getData(response) {

    let data = [];

    each(response.result, function (chartResult) {
      const data1 = JSON.parse(chartResult);
      data.push({ date: data1.meas_time, value: data1.meas_num_v, unit: 'kwh', name: data1.meas_name});
      console.log('data', data);
    });

    /* this.data = Object.values(data.reduce((setData, { name, value, date, unit }) => {
       setData[name] = setData[name] || { data: [] };
       setData[name].data.push({ value, date, unit, name });
       return setData;
     }, {}));*/

    this.range = response.setRange;
    this.chart.data = data;

  }

  // generate some random data, quite different range
  public generateChartData() {
    const chartData = [
      {date: '2019-02-05T10:00:01+00:00', value: 1602, value1: 1893},
      {date: '2019-04-05T10:00:01+00:00', value: 2602, value1: 2893},
      {date: '2019-05-05T10:00:01+00:00', value: 3602, value1: 3893},
      {date: '2019-07-05T10:00:01+00:00', value: 4602, value1: 4893},
      {date: '2019-08-05T10:00:01+00:00', value: 5602, value1: 5893},
      {date: '2019-09-05T10:00:01+00:00', value: 7602, value1: 6893},
      {date: '2019-10-05T10:00:01+00:00', value: 9602, value1: 7893},
      {date: '2019-12-05T10:00:01+00:00', value: 11602, value1: 9893},
    ];

    console.log('chartData', chartData);

    return chartData;
  }

  public addAxisAndSeries(name) {
    if (name==="Visits") {
      this.createAxisAndSeries("value", "Value", false, "circle");
    } else if (name==="Views") {
      this.createAxisAndSeries("value1", "Value1", true, "triangle");
    }
  }
  public addSeries() {
    this.addAxisAndSeries("Visits");
    this.addAxisAndSeries("Views");
  }

  public getEvent(value) {

    switch (value) {
      default:
        this.setRange(value);
        return;
      case 'previous':
        this.setPreviousRange();
        return;
      case 'next':
        this.setNextRange();
        return;
    }
  }

  public setRange(value) {
    this.selectedItem = value;
    console.log('selectedItem', this.selectedItem);

    this.lastValue = this.range[0].first;
    let first;

    if (this.selectedItem === 'minute') {
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 8);
    } else if (this.selectedItem === 'hour' || this.selectedItem === 'day') {
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 31);
    } else {
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 365);
    }

    first = moment(first).format('YYYY-MM-DD');

    const setDateRange = [];
    setDateRange.push({first: first, last: this.lastValue});

    this.lastValue = first;

    this.dateRange.emit(setDateRange);
    this.rangeChangeEvent.emit(this.selectedItem);

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

    this.dateRange.emit(setDateRange);
    this.rangeChangeEvent.emit(this.selectedItem);

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

    this.dateRange.emit(setDateRange);
    this.rangeChangeEvent.emit(this.selectedItem);

    console.log('this.selectedItem', this.selectedItem);
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
