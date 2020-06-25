import { Injectable } from '@angular/core';
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4core from "@amcharts/amcharts4/core";

@Injectable()
export class ChartService {
  valueAxis: any;
  valueAxis2: any;
  dateAxis: any;
  dateAxis2: any;

  constructor() {

  }

  public getDateAxis(chart, selectedItem) {

    this.dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    this.dateAxis.renderer.grid.template.location = 0;
    this.dateAxis.renderer.labels.template.fill = am4core.color("#e59165");
    this.dateAxis.groupData = true;
    this.dateAxis.renderer.grid.template.strokeOpacity = 0.07;

    this.dateAxis2 = chart.xAxes.push(new am4charts.DateAxis());
    this.dateAxis2.renderer.grid.template.location = 0;
    this.dateAxis2.renderer.labels.template.fill = am4core.color("#dfcc64");
    this.dateAxis2.groupData = true;
    this.dateAxis2.groupCount = 13;

    if (selectedItem === 'minute') {
      this.dateAxis.groupCount = 6 * 24 * 8;
      this.dateAxis2.groupCount = 6 * 24 * 8;
    } else if (this.selectedItem === 'hour') {
      this.dateAxis.groupCount = 24 * 31;
      this.dateAxis2.groupCount = 24 * 31;

    } else if (this.selectedItem === 'day') {
      this.dateAxis.groupCount = 31;
      this.dateAxis2.groupCount = 31;

    } else {
       this.dateAxis.groupCount = 365;
       this.dateAxis2.groupCount = 365;

    }
  }

  public getValueAxis(chart) {
    this.valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    this.valueAxis.tooltip.disabled = true;
    this.valueAxis.renderer.labels.template.fill = am4core.color("#e59165");
    this.valueAxis.renderer.minWidth = 60;
    this.valueAxis.renderer.grid.template.strokeOpacity = 0.07;

    this.valueAxis2 = chart.yAxes.push(new am4charts.ValueAxis());
    this.valueAxis2.tooltip.disabled = true;
    this.valueAxis2.renderer.labels.template.fill = am4core.color("#dfcc64");
    this.valueAxis2.renderer.minWidth = 60;
    this.valueAxis2.syncWithAxis = this.valueAxis;

  }

  public setSeries(chart) {

    const series = chart.series.push(new am4charts.LineSeries());

      series.name = chart.data.name;
      series.dataFields.dateX = "date";
      series.dataFields.valueY = "value";
      series.yAxis = this.valueAxis;
      series.xAxis = this.dateAxis;
      series.tooltipText = "{valueY.value} {unit}";
      series.fill = am4core.color("#e59165");
      series.stroke = am4core.color("#e59165");

    const series2 = chart.series.push(new am4charts.LineSeries());

      series2.name = chart.data.name;
      series2.dataFields.dateX = "date2";
      series2.dataFields.valueY = "value2";
      series2.yAxis = this.valueAxis2;
      series2.xAxis = this.dateAxis2;
      series2.tooltipText = "{valueY.value} {unit}";
      series2.fill = am4core.color("#e59165");
      series2.stroke = am4core.color("#e59165");
  }

  public chartAxis(chart) {
    chart.data.forEach((element) => {
      chart.cursor = new am4charts.XYCursor();
      chart.cursor.xAxis = this.dateAxis;

      let scrollbarX = new am4charts.XYChartScrollbar();
      chart.scrollbarX = scrollbarX;
      chart.legend = new am4charts.Legend();
      chart.legend.parent = chart.plotContainer;
      chart.legend.zIndex = 100;

      element.scrollbarX = scrollbarX;
    });
  }

}
