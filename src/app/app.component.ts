import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../services/api.service';
import { EventsService } from '../services/events.service';
import { get, each, map, filter } from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'assets-ui';
  private accessToken: any;
  public data: any;
  public measName: any;
  public first = '2019-06-01';
  public last = '2019-08-07';
  public selectedItem = 'month';
  public dateRange: any[];

  constructor(private http: HttpClient, private api: ApiService, public events: EventsService) {
  }

  public async ngAfterViewInit() {
    const response = await this.api.post('ipredictapi/oidc/login',
      {
        "partyId":"TEPSOL",
        "username":"tepsoladmin1",
        "passwd":"activate"
      });

    this.accessToken = response.result.access_token;
  }

  public async getData(event, label) {

    try {
      if (event) {

        console.log('this.accessToken', this.accessToken);

        this.data = await this.api.post('SolarSightWS/generic/pg/selectFrom',
          {
            "keySpace": "iot",
            "tableName": "asset_meas_by_min_hist",
            "allCols": true,
            "cols": ["site_ref_key", "asset_ref_key", "meas_name", "meas_date"],
            "andConditions": [
              {"col": "asset_ref_key", "operator": "IN", "values": ["TEPSOL_SITE_001_110101"]},
              {"col": "meas_name", "operator": "IN", "values": [label]},
              {"col": "meas_date", "operator": ">=", "value": this.first},
              {"col": "meas_date", "operator": "<=", "value": this.last}
            ],
            "orderBy": "meas_date",
            "orderType": "ASC"
          }, this.accessToken);

        this.data.setRange = [{first: this.first, last: this.last}];

        this.events.emit('asset:Data', this.data);

      }
    } catch (error) {
      console.log('Error getting response', error);
    }
  }

  public getRangeChangeEvent(selectedItem) {
    this.selectedItem = selectedItem;
    console.log('this.selectedItem', this.selectedItem);

    this.first = this.dateRange[0].first;
    this.last = this.dateRange[0].last;
    this.getData(true, this.measName);

    console.log('this.first', this.first);
    console.log('this.last', this.last);
  }

  public getDateRange(dateRange) {
    this.dateRange = dateRange;
    console.log('this.dateRange', this.dateRange);
  }

}
