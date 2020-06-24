import {Component, NgZone, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { get, each, map, filter, isEmpty } from 'lodash';
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
  public range: any;

  @Input() data: any[];
  @Output() dateRange: EventEmitter<any> = new EventEmitter();
  @Output() rangeChangeEvent: EventEmitter<any> = new EventEmitter();

  constructor(private zone: NgZone, private chartService: ChartService, public events: EventsService) {
    events.listen('asset:Data', async (response) => {
      await this.getData(response);
    });
  }

  public async getData(response) {

    console.log('data', response);

    if (!isEmpty(response.result)) {
      const data = [];
      each(response.result, function (chartResult) {
        const data1 = JSON.parse(chartResult);
        data.push({ date: data1.meas_time, value: data1.meas_num_v, unit: 'kwh', name: data1.meas_name});
      });

      this.range = response.setRange;
      await this.createChart(data);
    } else {
        alert('There is no data');
    }
  }

  public async createChart(data) {
    // Create Chart

    this.chart = am4core.create("chartdiv", am4charts.XYChart);
    this.chart.paddingRight = 40;
    this.chart.data = data;

    // Set the xAxes and yAxes

    await this.chartService.getDateAxis(this.chart);
    await this.chartService.getValueAxis(this.chart);
    await this.chartService.setSeries(this.chart);
    await this.chartService.chartAxis(this.chart);
    await this.chartService.renderChart(this.chart);

    // console.log(this.chartData);


    this.chartnewData = data;
    this.chart.exporting.menu = new am4core.ExportMenu();
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

    this.dateRange.emit(setDateRange);
    this.rangeChangeEvent.emit(this.selectedItem);

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

    this.dateRange.emit(setDateRange);
    this.rangeChangeEvent.emit(this.selectedItem);

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
