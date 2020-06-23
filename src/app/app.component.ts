import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../services/api.service';
import { EventsService } from '../services/events.service';
import { get, each, map, filter } from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'assets-ui';
  private accessToken: any;
  public data: any;
  public measName: any;
  public first = '2019-06-01';
  public last = '2019-08-07';
  public selectedItem = 'month';

  constructor(private http: HttpClient, private api: ApiService, public events: EventsService) {
    events.listen('onClick:Event', async (setDateRange) => {
      this.first = setDateRange[0].first;
      this.last = setDateRange[0].last;
      this.getData(true, this.measName);
      console.log('this.first', this.first);
      console.log('this.last', this.last);
    });
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

/*
    this.measName = label;
*/

    try {
      if (event) {

        console.log('this.accessToken', this.accessToken);

 /*       this.data = await this.api.post('SolarSightWS/generic/pg/selectFrom',
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



        let data = get(this.data, 'result', []);
*/

        this.data = [
          {date: '2019-02-05T10:00:01+00:00', value: 3.26, unit: 'kwh'},
          {date: '2019-08-07T10:00:01+00:00', value: 17.26, unit: 'kwh'},
          {date: '2020-05-07T10:00:01+00:00', value: 37.26, unit: 'kwh'},
          {date: '2020-10-07T10:00:01+00:00', value: 97.26, unit: 'kwh'}
        ];

        this.events.emit('asset:Data', this.data);

      }
    } catch (error) {
      console.log('Error getting response', error);
    }
  }

  public getSelectedItem(selectedItem) {
    this.selectedItem = selectedItem;
    console.log('this.selectedItem', this.selectedItem);
  }

  public ngOnDestroy() {
    this.events.dispose('onClick:Event');
  }

}
