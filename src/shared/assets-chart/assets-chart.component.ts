import {Component, NgZone, OnDestroy, Input, Output, EventEmitter, AfterViewInit} from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { ChartService } from '../../services/chart.service';
import { EventsService } from '../../services/events.service';
import * as moment from 'moment';
import { each } from 'lodash';

const data = [];
let index = 0;
let measName = '';

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
  public index: any;
  public changeInRange = false;

  @Input() data: any[];
  @Output() dateRange: EventEmitter<any> = new EventEmitter();
  @Output() rangeChangeEvent: EventEmitter<any> = new EventEmitter();
  @Output() timeEvent: EventEmitter<any> = new EventEmitter();

  constructor(private zone: NgZone, private chartService: ChartService, public events: EventsService) {
    events.listen('asset:Data', async (response) => {
      await this.getData(response);
    });
  }

  public async ngAfterViewInit() {
    this.chart = am4core.create("chartdiv", am4charts.XYChart);
    let scrollbarX = new am4charts.XYChartScrollbar();

    this.chart.colors.step = 2;
    this.chart.legend = new am4charts.Legend();
    this.chart.cursor = new am4charts.XYCursor();
    this.chart.scrollbarX = scrollbarX;
    this.chart.legend.parent = this.chart.plotContainer;
    this.chart.legend.zIndex = 100;

  }

  public createAxisAndSeries(date, field, name) {

    this.dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
    this.dateAxis.renderer.minGridDistance = 50;
    this.dateAxis.renderer.grid.template.location = 0;
    this.dateAxis.renderer.grid.template.strokeOpacity = 0.07;

    this.valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
    this.valueAxis.renderer.minWidth = 60;
    this.valueAxis.renderer.grid.template.strokeOpacity = 0.07;

    this.series = this.chart.series.push(new am4charts.LineSeries());
    this.series.dataFields.valueY = field;
    this.series.dataFields.dateX = date;
    this.series.strokeWidth = 2;
    this.series.yAxis = this.valueAxis;
    this.series.xAxis = this.dateAxis;
    this.series.name = name;
    this.series.tooltipText = "{name}: [bold]{valueY}[/]";
    this.series.tensionX = 0.8;
  }

  public async getData(response) {

    if (response.checked) {
      this.changeInRange = false;
      index += 1;
    }

    each(response.result, function (chartResult) {
      const data1 = JSON.parse(chartResult);
      console.log('index', index);
      measName = data1.meas_name;
      data.push({ [`date${index}`]: data1.meas_time, [`value${index}`]: data1.meas_num_v, [`unit${index}`]: 'kwh', [`name${index}`]: data1.meas_name});
    });

    this.range = response.setRange;
    this.index = index;
    this.chart.data = data;

    if (!this.changeInRange) {
      this.addSeries();
    }

  }

  public addAxisAndSeries(i) {
    this.createAxisAndSeries([`date${i}`], [`value${i}`], measName);
  }

  public addSeries() {
      this.addAxisAndSeries(this.index);
  }

  public getEvent(value) {
    this.changeInRange = true;

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
    this.lastValue = this.range[0].first;

    let first;
    const setDateRange = [];

    if (this.selectedItem === 'minute') {
      this.dateAxis.groupCount = 60 * 24 * 8;
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 8);

    } else if (this.selectedItem === 'hour' || this.selectedItem === 'day') {
      this.dateAxis.groupCount = this.selectedItem === 'hour' ? 24 * 31 : 30;
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 31);

    } else {
      this.dateAxis.groupCount = 13;
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 365);
    }

    first = moment(first).format('YYYY-MM-DD');
    setDateRange.push({first: first, last: this.lastValue});

    this.lastValue = first;
    this.dateRange.emit(setDateRange);
    this.rangeChangeEvent.emit(this.selectedItem);


  }

  public setPreviousRange() {

    this.lastValue = this.range[0].first;

    let first;
    const setDateRange = [];

    if (this.selectedItem === 'minute') {
      this.dateAxis.groupCount = 60 * 24 * 7;
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 7);
    } else if (this.selectedItem === 'hour' || this.selectedItem === 'day') {
      this.dateAxis.groupCount = this.selectedItem === 'hour' ? 24 * 30 : 30;
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 30);
    } else {
      this.dateAxis.groupCount = 13;
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 365);
    }

    first = moment(first).format('YYYY-MM-DD');
    setDateRange.push({first: first, last: this.lastValue});

    this.lastValue = first;
    this.dateRange.emit(setDateRange);
    this.rangeChangeEvent.emit(this.selectedItem);
  }

  public setNextRange() {

    this.lastValue = this.range[0].first;

    let first;
    const setDateRange = [];

    if (this.selectedItem === 'minute') {

      this.dateAxis.groupCount = 6 * 24 * 7;
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() + 7);
      this.lastValue = new Date(first).setDate(new Date(first).getDate() + 7);
      this.lastValue = moment(this.lastValue).format('YYYY-MM-DD');

    } else if (this.selectedItem === 'hour' || this.selectedItem === 'day') {

      this.dateAxis.groupCount = this.selectedItem === 'hour' ? 24 * 30 : 30;
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() + 30);
      this.lastValue = new Date(first).setDate(new Date(first).getDate() + 30);
      this.lastValue = moment(this.lastValue).format('YYYY-MM-DD');

    } else {

      this.dateAxis.groupCount = 13;
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() + 365);
      this.lastValue = new Date(first).setDate(new Date(first).getDate() + 365);
      this.lastValue = moment(this.lastValue).format('YYYY-MM-DD');
    }

    first = moment(first).format('YYYY-MM-DD');
    setDateRange.push({first: first, last: this.lastValue});

    this.lastValue = first;
    this.dateRange.emit(setDateRange);
    this.rangeChangeEvent.emit(this.selectedItem);

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
