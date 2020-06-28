import { AfterViewInit, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../services/api.service';
import { EventsService } from '../services/events.service';
import { isEmpty } from 'lodash';

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
  public last = '2020-06-01';
  public selectedItem = 'month';
  public dateRange: any[];
  public measName = [];
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

        if (!changeInRange) {
          checked = true;
        }

        const setRange = this.dateRange ? this.dateRange : [{first: this.first, last: this.last}];
        this.measName = label;

        this.data = await this.api.post('SolarSightWS/generic/pg/selectFrom',
          {
            "keySpace": "iot",
            "tableName": "asset_meas_by_min_hist",
            "allCols": true,
            "cols": ["site_ref_key", "asset_ref_key", "meas_name", "meas_date"],
            "andConditions": [
              {"col": "asset_ref_key", "operator": "IN", "values": ["TEPSOL_SITE_001_110101"]},
              {"col": "meas_name", "operator": "IN", "values": [this.measName]},
              {"col": "meas_date", "operator": ">=", "value": setRange[0].first},
              {"col": "meas_date", "operator": "<=", "value": setRange[0].last}
            ],
            "orderBy": "meas_date",
            "orderType": "ASC"
          }, this.accessToken);

        this.data.setRange = setRange;
        this.data.checked = checked;

        if(!isEmpty(this.data.result)) {
          this.events.emit('asset:Data', this.data);
        } else {
          alert('No Data for the current range');
        }
      }
    } catch (error) {
      console.log('Error getting response', error);
    }
  }

  public getRangeChangeEvent(selectedItem) {
    this.selectedItem = selectedItem;
    this.getData(true, this.measName);
    checked = false;
  }

  public getDateRange(dateRange) {
    this.dateRange = dateRange;
  }

}
