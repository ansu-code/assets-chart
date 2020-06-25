import { Injectable } from '@angular/core';
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4core from "@amcharts/amcharts4/core";

@Injectable()
export class ChartService {
  constructor() {

  }

  public getDateAxis(chart, selectedItem) {

    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.labels.template.fill = am4core.color("#e59165");
    dateAxis.groupData = true;

    if (selectedItem === 'minute') {
        dateAxis.groupCount = 6 * 24 * 8;
    } else if (selectedItem === 'hour') {
        dateAxis.groupCount = 24 * 31;
    } else if (selectedItem === 'day') {
        dateAxis.groupCount = 31;
    } else {
        dateAxis.groupCount = 365;
    }

    chart.dateAxis = dateAxis;
  }

  public getValueAxis(chart) {
    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.tooltip.disabled = true;
    valueAxis.renderer.labels.template.fill = am4core.color("#e59165");
    valueAxis.renderer.minWidth = 60;
    chart.valueAxis = valueAxis;

  }

  public setSeries(chart) {

    const series = chart.series.push(new am4charts.LineSeries());

    let i = 1;
    chart.data.forEach((element) => {
      series.name = element.name;
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

}
