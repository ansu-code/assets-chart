import {Component, NgZone, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
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

export class AssetschartComponent implements OnDestroy {

  public isChecked = false;
  private chart: am4charts.XYChart;
  public lastValue: any;
  public selectedItem = 'month';
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

    let data = [];

    each(response.result, function (chartResult) {
      const data1 = JSON.parse(chartResult);
      data.push({ date: data1.meas_time, value: data1.meas_num_v, unit: 'kwh', name: data1.meas_name});
      console.log('data', data);
    });

    this.data = Object.values(data.reduce((setData, { name, value, date, unit }) => {
      setData[name] = setData[name] || { data: [] };
      setData[name].data.push({ value, date, unit, name });
      return setData;
    }, {}));

    this.range = response.setRange;

    await this.createChart(this.data);

  }

  public async createChart(data) {

    // Create Chart
    let chart = am4core.create("chartdiv", am4charts.XYChart);
    chart.paddingRight = 40;

    each(data, function (element1) {

      chart.data = element1.data;

      console.log('element', chart.data);

      let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.grid.template.location = 0;
      dateAxis.renderer.labels.template.fill = am4core.color("#e59165");
      dateAxis.groupData = true;
      dateAxis.renderer.grid.template.strokeOpacity = 0.07;

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.tooltip.disabled = true;
      valueAxis.renderer.labels.template.fill = am4core.color("#e59165");
      valueAxis.renderer.minWidth = 60;
      valueAxis.renderer.grid.template.strokeOpacity = 0.07;

      const series = chart.series.push(new am4charts.LineSeries());

      series.name = 'name';
      series.dataFields.dateX = "date";
      series.dataFields.valueY = "value";
      series.yAxis = valueAxis;
      series.xAxis = dateAxis;
      series.tooltipText = "{valueY.value} {unit}";
      series.fill = am4core.color("#e59165");
      series.stroke = am4core.color("#e59165");

    });

    chart.exporting.menu = new am4core.ExportMenu();

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
