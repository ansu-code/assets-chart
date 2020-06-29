import { AfterViewInit, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../services/api.service';
import { EventsService } from '../services/events.service';
import { isEmpty } from 'lodash';

let checked = false;
let setRange: any;

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
  public last = new Date();
  public selectedItem = 'month';
  public dateRange: any[];
  public label: any;
  public groupNameArr = [];
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

  public async getData(event, name, changeInRange = true) {

    try {

      this.label = name;

      if (event) {

        if (!changeInRange) {
          checked = true;
        }

        this.data = await this.api.post('SolarSightWS/generic/pg/selectFrom',
          {
            "keySpace": "iot",
            "tableName": "asset_meas_by_min_hist",
            "allCols": true,
            "cols": ["site_ref_key", "asset_ref_key", "meas_name", "meas_date"],
            "andConditions": [
              {"col": "asset_ref_key", "operator": "IN", "values": ["TEPSOL_SITE_001_110101"]},
              {"col": "meas_name", "operator": "IN", "values": [this.label]},
              {"col": "meas_date", "operator": ">=", "value": this.first},
              {"col": "meas_date", "operator": "<=", "value": this.last}
            ],
            "orderBy": "meas_date",
            "orderType": "ASC"
          }, this.accessToken);

      } else {
        checked = false;
      }

      this.data.setRange = this.first;
      this.data.checked = checked;
      this.data.label = this.label;

      if(!isEmpty(this.data.result)) {
        this.events.emit('asset:Data', this.data);
      } else {
        alert('No Data for the current range');
      }

    } catch (error) {
      console.log('Error getting response', error);
    }
  }

  public getRangeChangeEvent(selectedItem) {
    this.selectedItem = selectedItem;
    this.getData(true, this.label);
    checked = false;
  }

  public getDateRange(dateRange) {
    this.dateRange = dateRange;
    console.log('dateRange', this.dateRange);
    this.first = this.dateRange[0].first;
    this.last = this.dateRange[0].last;

    console.log('this.first', this.first);
    console.log('this.last', this.last);

  }

  public getGroupName(groupName) {
    this.label = JSON.stringify(groupName);
  }

}
