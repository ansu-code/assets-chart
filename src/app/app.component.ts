import { AfterViewInit, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../services/api.service';
import { EventsService } from '../services/events.service';
import { get, each, map, filter, merge, isEmpty } from 'lodash';

let checked = false;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'assets-ui';
  private accessToken: any;
  public data: any;
  public first = '2019-06-01';
  public last = '2019-09-01';
  public selectedItem = 'month';
  public dateRange: any[];
  public measName = [];
  public index = 0;
  public changeInRange: boolean = false;
  public checkBoxValues = [
    {
      name: 'COUNT_KWH_HR'
    },
    {
      name: 'AC_VOL_YB'
    }
  ];

  constructor(private http: HttpClient, private api: ApiService, public events: EventsService) {
  }

  public async ngAfterViewInit() {
    const response = await this.api.post('ipredictapi/oidc/login',
      {
        "partyId": "TEPSOL",
        "username": "tepsoladmin1",
        "passwd": "activate"
      });

    this.accessToken = response.result.access_token;
  }

  public async getData(event, label, changeInRange = true) {

    try {

      if (event) {

        this.measName = label;

        if (!changeInRange) {
          checked = true;
        }

        const setRange = this.dateRange ? this.dateRange : [{first: this.first, last: this.last}];

        console.log(' setRange',  setRange);

        this.data = await this.api.post('SolarSightWS/generic/pg/selectFrom',
          {
            "keySpace": "iot",
            "tableName": "asset_meas_by_min_hist",
            "allCols": true,
            "cols": ["site_ref_key", "asset_ref_key", "meas_name", "meas_date"],
            "andConditions": [
              {"col": "asset_ref_key", "operator": "IN", "values": ["TEPSOL_SITE_001_110101"]},
              {"col": "meas_name", "operator": "IN", "values": [this.measName]},
              {"col": "meas_date", "operator": ">=", "value": this.first},
              {"col": "meas_date", "operator": "<=", "value": this.last}
            ],
            "orderBy": "meas_date",
            "orderType": "ASC"
          }, this.accessToken);

        this.data.setRange = setRange;
        this.data.measName = this.measName;
        this.data.checked = checked;
        this.data.changeInRange = changeInRange;

        console.log(' this.data',  this.data);

        if(!isEmpty(this.data.result)) {
          this.events.emit('asset:Data', this.data);
        } else {
          alert('No Data for the current range');
        }

      } /*else {
        this.index -= 1;
      }*/
    } catch (error) {
      console.log('Error getting response', error);
    }
  }

  public getRangeChangeEvent(selectedItem) {
    this.selectedItem = selectedItem;
    this.getData(true, this.measName);
  }

  public getDateRange(dateRange) {
    this.dateRange = dateRange;
  }

  public getTimeEvent(changeInRange) {
    this.changeInRange = changeInRange;
    console.log('this.changeInRange', this.changeInRange);
  }
}
