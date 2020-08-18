import { Component, NgZone, OnDestroy, Input, Output, EventEmitter, AfterViewInit} from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { InsightsEventsService } from '../../app/solar/services/insights.events.service';

import * as moment from 'moment';
import { each , orderBy, findIndex, isEmpty } from 'lodash';

let data = [];
let index = 0;
let label;

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
  public dateAxis: any;
  public valueAxis: any;
  public series: any;
  public index: any;
  public changeInRange: any;
  public createNewAxis = false;

  @Input() data: any[];
  @Output() dateRange: EventEmitter<any> = new EventEmitter();
  @Output() rangeChangeEvent: EventEmitter<any> = new EventEmitter();
  @Output() timeEvent: EventEmitter<any> = new EventEmitter();

  constructor(private zone: NgZone, public events: InsightsEventsService) {
    events.listen('asset:Data', async (response) => {
      console.log('response', response);
      if (!isEmpty(response)) {
        await this.getData(response);
      } else {
        data = [];
        this.resetChartValues();
      }
    });
  }

  public async ngAfterViewInit() {

    // Create Chart

    this.chart = am4core.create("chartdiv", am4charts.XYChart);
    let scrollbarX = new am4charts.XYChartScrollbar();

    this.chart.colors.step = 2;
    this.chart.legend = new am4charts.Legend();
    this.chart.cursor = new am4charts.XYCursor();
    this.chart.scrollbarX = scrollbarX;
 //   this.chart.legend.parent = this.chart.plotContainer;
 //   this.chart.legend.zIndex = 100;

  }

  public createAxisAndSeries(date, field, name) {


    // Create axes and series
   // console.log('yAxes', this.chart.yAxes.length);
        console.log('name', name);

    if (!this.changeInRange || this.createNewAxis) {
      console.log('createNewAxis', name);

      this.dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
      this.valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
      this.series = this.chart.series.push(new am4charts.LineSeries());
      this.series.name = name;
      this.createNewAxis = false;
     }

    console.log('selectedItem', this.selectedItem);

    this.dateAxis.renderer.minGridDistance = 50;
    this.dateAxis.renderer.grid.template.location = 0;

    this.dateAxis.renderer.grid.template.strokeOpacity = 0.07;
    this.dateAxis.groupData = true;

    if (this.selectedItem === 'month') {
      this.dateAxis.groupCount = 13;
    }

    this.valueAxis.renderer.minWidth = 60;
    this.valueAxis.renderer.grid.template.strokeOpacity = 0.07;
    this.valueAxis.strictMinMax = true;

    // Create series

    this.series.dataFields.valueY = field;
    // this.series.groupFields.valueY = 'sum';
    this.series.dataFields.dateX = date;
    this.series.strokeWidth = 2;
    this.series.yAxis = this.valueAxis;

    this.series.xAxis = this.dateAxis;
    this.series.tooltipText = "{name}: [bold]{valueY}[/]";
    this.series.tensionX = 0.8;

  }

  public async getData(response) {
    this.changeInRange = response.changeInRange;
    label = response.groupName;

    if (!this.changeInRange) {
      await this.getCheckBoxData(response);
    } else {
      await this.getRangeData(response);
    }
  }

  public async getCheckBoxData(response) {

    if (response.checked) {
      this.changeInRange = false;
      index = response.index;

      // Response from API

      each(response.result, function (chartResult) {
        const data1 = JSON.parse(chartResult);
        data.push({
          [`date${index}`]: data1.meas_time,
          [`value${index}`]: data1.meas_num_v,
          [`unit${index}`]: 'kwh',
          [`name${index}`]: data1.meas_name
        });
      });

      data = data.filter(function (e) {
        const value = e[`value${index}`];
        return value !== 0;
      });

      this.lastValue = response.last;
      this.index = index;
      console.log('response', response);

      if (!isEmpty(data)) {

        // sort array by date asc
        const sortedData = orderBy(data, [`date${index}`], 'asc');

        // Set chart Data
        this.chart.data = sortedData;
        this.addSeries();
      }
    } else {

      // filter the unchecked group name arrays
    //  this.chart.series.removeIndex(response.index - 1);

     // console.log('response', this.valueAxis[`${response.index}`]);

    //  this.valueAxis[`${response.index}`].disabled = true;

      // this.dateAxis.disabled = true;
      data = data.filter(function (e) {
        const name = e[`name${response.index}`];
        return name !== label.toString();
      });


      if (index > 1) {
        index -= 1;
        this.chart.series.removeIndex(index).dispose();
      } else {
        this.chart.series.clear();
        this.chart.yAxes.clear();
        this.chart.xAxes.clear();
       // this.addSeries();
      }

      // this.removeSeries();

      this.chart.data = data;

    }

  }

  public async getRangeData(response) {

    console.log('im in');

      data = [];
      let result = [];

      // Response from API

      each(response.result, function (chartResult) {
        const data1 = JSON.parse(chartResult);
        result.push({date: data1.meas_time, value: data1.meas_num_v, unit: 'kwh', name: data1.meas_name});
      });

      // Split the array in group name wise

      const element: any[] = Object.values(result.reduce((setData, {name, value, date, unit}) => {
        setData[name] = setData[name] || {name, data: []};
        setData[name].data.push({value, date, unit, name});
        return setData;
      }, {}));

      // Form the data structure to send the data to chart

      for (let i = 0; i < element.length; i++) {
        element[i].data.map(item => {
          data.push({
            [`date${i + 1}`]: item.date,
            [`value${i + 1}`]: item.value,
            [`unit${i + 1}`]: item.unit,
            [`name${i + 1}`]: item.name
          });
        });

      }

      data = data.filter(function (e) {
        const value = e[`value${index}`];
        return value !== 0;
      });

      console.log('data', data);

      const sortedData = orderBy(data, [`date${index}`], 'asc');

      this.chart.data = sortedData;
      this.addSeries();

  }

  public addAxisAndSeries(i) {

    this.createAxisAndSeries([`date${i}`], [`value${i}`], label);

    if (this.chart.yAxes.length === 0 && this.chart.xAxes.length === 0) {
     // if (label.length > 1) {
        for (let j = 1; j <= label.length; j++) {
          this.createNewAxis = true;
          this.createAxisAndSeries([`date${j}`], [`value${j}`], label[j-1]);
        }
     // }
    }

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
    console.log('im in setRange');

    this.dateAxis.groupCount = 0;

    this.timeEvent.emit(this.changeInRange);
    this.selectedItem = value;

    console.log('im in selectedItem', this.selectedItem);

    let first;
    const setDateRange = [];

    if (this.selectedItem === 'minute') {
     /* console.log('minute');
      first = '2019-08-01';
      this.lastValue = '2019-08-10';*/
      this.dateAxis.groupCount = 60 * 24 * 8;
      first = moment(this.lastValue).subtract(8, 'days').format('YYYY-MM-DD');

    } else if (this.selectedItem === 'hour' || this.selectedItem === 'day') {
      /*first = '2019-08-01';
      this.lastValue = '2019-09-10';*/
      this.dateAxis.groupCount = this.selectedItem === 'hour' ? 24 * 31 : 31;
      first = moment(this.lastValue).subtract(31, 'days').format('YYYY-MM-DD');

    } else {

      this.dateAxis.groupCount = 13;
      /*first = '2019-08-01';
      this.lastValue = '2020-07-23';*/
      first = moment(this.lastValue).subtract(1, 'year').format('YYYY-MM-DD');
    }

    setDateRange.push({first: first, last: this.lastValue});

    // Zoom Chart according to the range

    // this.dateAxis.zoomToDates(first, this.lastValue);
    if (!isEmpty(data)) {
      this.chart.cursor.xAxis = this.dateAxis;
    }

    // this.addSeries();

    this.lastValue = first;
    this.dateRange.emit(setDateRange);
    this.rangeChangeEvent.emit({ month: this.selectedItem, value: ''});

  }

  public setPreviousRange() {

    this.timeEvent.emit(this.changeInRange);

    let first;
    const setDateRange = [];

    if (this.selectedItem === 'minute') {
      this.dateAxis.groupCount = 60 * 24 * 7;
      first = moment(this.lastValue).subtract(1, 'week').format('YYYY-MM-DD');
    } else if (this.selectedItem === 'hour' || this.selectedItem === 'day') {
      this.dateAxis.groupCount = this.selectedItem === 'hour' ? 24 * 30 : 30;
      first = moment(this.lastValue).subtract(1, 'months').format('YYYY-MM-DD');
    } else {
      this.dateAxis.groupCount = 13;
      first = moment(this.lastValue).subtract(1, 'year').format('YYYY-MM-DD');
    }

    setDateRange.push({first: first, last: this.lastValue});

    this.lastValue = first;

    this.dateRange.emit(setDateRange);
    this.rangeChangeEvent.emit({ month: this.selectedItem, value: 'previous'});
  }

  public setNextRange() {

    this.dateAxis.groupData = true;

    this.timeEvent.emit(this.changeInRange);

    console.log('changeInRange', this.changeInRange);

    let first;
    const setDateRange = [];

    if (this.selectedItem === 'minute') {

      this.dateAxis.groupCount = 60 * 24 * 7;
      first = moment(this.lastValue).add(1, 'week').format('YYYY-MM-DD');
      this.lastValue = moment(first).add(1, 'week').format('YYYY-MM-DD');

    } else if (this.selectedItem === 'hour' || this.selectedItem === 'day') {
      this.dateAxis.groupCount = this.selectedItem === 'hour' ? 24 * 30 : 30;
      first = moment(this.lastValue).add(1, 'months').format('YYYY-MM-DD');
      this.lastValue = moment(first).add(1, 'months').format('YYYY-MM-DD');

    } else {
      /*this.dateAxis.gridIntervals = [
        {timeUnit: "year", count: 1}];*/
       this.dateAxis.groupCount = 13;
      first = moment(this.lastValue).add(1, 'year').format('YYYY-MM-DD');
      this.lastValue = moment(first).add(1, 'year').format('YYYY-MM-DD');
    }

    console.log('first', first);
    console.log('firstlast', this.lastValue);
    setDateRange.push({first: first, last: this.lastValue});

    this.lastValue = first;

    this.dateRange.emit(setDateRange);
    this.rangeChangeEvent.emit({ month: this.selectedItem, value: 'next'});

  }

  // Reset Chart Values

  public resetChartValues() {

    // this.chart.validateData();
    this.valueAxis.disabled = true;
    this.dateAxis.disabled = true;
    this.series.disabled = true;
    this.series.name = '';
    this.series.strokeWidth = 0;
    this.valueAxis.strictMinMax = true;

    console.log('this.chart.series', this.chart);
    // this.chart.series.removeIndex(index);
    const getIndex = this.chart.yAxes.length;

    if (isEmpty(data)) {
      this.chart.series.clear();
      this.chart.yAxes.clear();
      this.chart.xAxes.clear();
      /* this.chart.yAxes.removeIndex( 1);
       this.chart.xAxes.removeIndex( 0);
       this.chart.xAxes.removeIndex( 1);*/
      console.log('this.chart.yaxes', this.chart.yAxes.length);

    }
  }

  public removeSeries() {
    this.chart.series.clear();
    this.chart.yAxes.clear();
    this.chart.xAxes.clear();
    this.addSeries();
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

