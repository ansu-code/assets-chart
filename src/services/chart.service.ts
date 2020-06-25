import { Injectable } from '@angular/core';
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4core from "@amcharts/amcharts4/core";

@Injectable()
export class ChartService {
  valueAxis: any;
  dateAxis: any;

  constructor() {

  }

  public getDateAxis(chart, selectedItem) {

    this.dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    this.dateAxis.renderer.grid.template.location = 0;
    this.dateAxis.renderer.labels.template.fill = am4core.color("#e59165");
    this.dateAxis.groupData = true;
    this.dateAxis.renderer.grid.template.strokeOpacity = 0.07;

    if (selectedItem === 'minute') {
      this.dateAxis.groupCount = 6 * 24 * 8;
    } else if (this.selectedItem === 'hour') {
      this.dateAxis.groupCount = 24 * 31;
    } else if (this.selectedItem === 'day') {
      this.dateAxis.groupCount = 31;
    } else {
        this.dateAxis.groupCount = 365;
    }
  }

  public getValueAxis(chart) {
    this.valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    this.valueAxis.tooltip.disabled = true;
    this.valueAxis.renderer.labels.template.fill = am4core.color("#e59165");
    this.valueAxis.renderer.minWidth = 60;
    this.valueAxis.renderer.grid.template.strokeOpacity = 0.07;

  }

  public setSeries(chart) {

    const series = chart.series.push(new am4charts.LineSeries());

    let i = 0;
    chart.data.forEach((element) => {
      series.name = element.name;
      series.dataFields.dateX = "date";
      series.dataFields.valueY = "value";
      series.yAxis = this.valueAxis;
      series.xAxis = this.dateAxis;
      series.tooltipText = "{valueY.value} {unit}";
      series.fill = am4core.color("#e59165");
      series.stroke = am4core.color("#e59165");
      i++;
    });
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
