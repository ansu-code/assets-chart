import { Component, NgZone, OnDestroy, Input, Output, EventEmitter, AfterViewInit} from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { EventsService } from '../../services/events.service';
import * as moment from 'moment';
import { each , orderBy, findIndex, isEmpty } from 'lodash';

let data = [];
let index = 0;
let label = '';

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
  public groupNameArr = [];

  @Input() data: any[];
  @Output() dateRange: EventEmitter<any> = new EventEmitter();
  @Output() rangeChangeEvent: EventEmitter<any> = new EventEmitter();
  @Output() timeEvent: EventEmitter<any> = new EventEmitter();
  @Output() groupName: EventEmitter<any> = new EventEmitter();

  constructor(private zone: NgZone, public events: EventsService) {
    events.listen('asset:Data', async (response) => {
      await this.getData(response);
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
    this.chart.legend.parent = this.chart.plotContainer;
    this.chart.legend.zIndex = 100;

  }

  public createAxisAndSeries(date, field, name) {

    // Create axes and series

    if (!this.changeInRange) {
      this.dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
      this.valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
      this.series = this.chart.series.push(new am4charts.LineSeries());
      this.series.name = name;
    }

    this.dateAxis.renderer.minGridDistance = 50;
    this.dateAxis.renderer.grid.template.location = 0;
    this.dateAxis.renderer.grid.template.strokeOpacity = 0.07;
    this.dateAxis.groupCount = true;

    this.valueAxis.renderer.minWidth = 60;
    this.valueAxis.renderer.grid.template.strokeOpacity = 0.07;

    // Create series

    this.series.dataFields.valueY = field;
    this.series.dataFields.dateX = date;
    this.series.strokeWidth = 2;
    this.series.yAxis = this.valueAxis;
    this.series.xAxis = this.dateAxis;
    this.series.tooltipText = "{name}: [bold]{valueY}[/]";
    this.series.tensionX = 0.8;
  }

  public async getData(response) {
    this.changeInRange = response.changeInRange;
    console.log('changeInRange', this.changeInRange);

    if (!this.changeInRange) {
      await this.getCheckBoxData(response);
    } else {
      await this.getRangeData(response);
    }
  }

  public async getCheckBoxData(response) {

    if (response.checked) {
      this.changeInRange = false;
      index += 1;

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

      this.lastValue = response.last;
      this.index = index;
      label = response.groupName;
      this.groupNameArr.push(label);

    } else {

      // filter the unchecked group name arrays

      data = data.filter(function (e) {
        const name = e[`name${index}`];
        return name !== label;
      });

      this.resetChartValues();

    }

    if (!isEmpty(data)) {

      // sort array by date asc
      const sortedData = orderBy(data, [`date${index}`], 'asc');

      // Set chart Data
      this.chart.data = sortedData;
      this.addSeries();
    }

  }

  public async getRangeData(response) {
    console.log('no data');

    if (!isEmpty(response.result)) {
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

      const sortedData = orderBy(data, [`date${index}`], 'asc');

      this.chart.data = sortedData;

      this.resetChartValues();
      this.addSeries();

    } else {
      console.log('no data');
      this.resetChartValues();
    }

  }

  public addAxisAndSeries(i) {
    // Create axes and series
    this.createAxisAndSeries([`date${i}`], [`value${i}`], label);
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

    this.timeEvent.emit(this.changeInRange);
    this.selectedItem = value;

    let first;
    const setDateRange = [];

    if (this.selectedItem === 'minute') {
      this.dateAxis.groupCount = 60 * 24 * 8;
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 8);

    } else if (this.selectedItem === 'hour' || this.selectedItem === 'day') {
      this.dateAxis.groupCount = this.selectedItem === 'hour' ? 24 * 31 : 31;
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 31);

    } else {
      this.dateAxis.groupCount = 13;
      first = new Date(this.lastValue).setDate(new Date(this.lastValue).getDate() - 365);
    }

    first = moment(first).format('YYYY-MM-DD');
    setDateRange.push({first: first, last: this.lastValue});

    // Zoom Chart according to the range

    this.dateAxis.zoomToDates(first, this.lastValue);
    this.chart.cursor.xAxis = this.dateAxis;

    this.addSeries();

    this.lastValue = first;

    this.groupName.emit(this.groupNameArr);
    this.dateRange.emit(setDateRange);
    this.rangeChangeEvent.emit(this.selectedItem);

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

    this.groupName.emit(this.groupNameArr);
    this.dateRange.emit(setDateRange);
    this.rangeChangeEvent.emit(this.selectedItem);
  }

  public setNextRange() {

    this.timeEvent.emit(this.changeInRange);

    console.log('changeInRange', this.changeInRange);

    let first;
    const setDateRange = [];

    if (this.selectedItem === 'minute') {

      this.dateAxis.groupCount = 6 * 24 * 7;
      first = moment(this.lastValue).add(1, 'week').format('YYYY-MM-DD');
      this.lastValue = moment(first).add(1, 'week').format('YYYY-MM-DD');

    } else if (this.selectedItem === 'hour' || this.selectedItem === 'day') {
      this.dateAxis.groupCount = this.selectedItem === 'hour' ? 24 * 30 : 30;
      first = moment(this.lastValue).add(1, 'months').format('YYYY-MM-DD');
      this.lastValue = moment(first).add(1, 'months').format('YYYY-MM-DD');

    } else {

      this.dateAxis.groupCount = 13;
      first = moment(this.lastValue).add(1, 'year').format('YYYY-MM-DD');
      this.lastValue = moment(first).add(1, 'year').format('YYYY-MM-DD');
    }

    console.log('first', first);
    console.log('firstlast', this.lastValue);
    setDateRange.push({first: first, last: this.lastValue});

    this.lastValue = first;

    this.groupName.emit(this.groupNameArr);
    this.dateRange.emit(setDateRange);
    this.rangeChangeEvent.emit(this.selectedItem);

  }

  // Reset Chart Values

  public resetChartValues() {
    this.valueAxis.disabled = true;
    this.dateAxis.disabled = true;
    this.series.disabled = true;
    this.series.name = '';
    this.series.strokeWidth = 0;
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
