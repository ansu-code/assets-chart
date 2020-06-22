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
  public response: any;
  public measName: any;
  public first = '2019-06-01';
  public last = '2019-08-07';

  constructor(private http: HttpClient, private api: ApiService, public events: EventsService) {
    events.listen('onClick:Event', async (setDateRange) => {
      this.first = setDateRange[0].first;
      this.last = setDateRange[0].last;
      this.getData(true, this.measName);
      console.log('value', this.first);
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

    this.measName = label;

    try {
      if (event) {

        console.log('this.accessToken', this.accessToken);

        this.response = await this.api.post('SolarSightWS/generic/pg/selectFrom',
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


        let data = [];
        const result = get(this.response, 'result', []);

        each(result, function (chartResult) {
          const data1 = JSON.parse(chartResult);
          data.push({ date: data1.meas_time, value: data1.meas_num_v, unit: 'kwh'});
        });

        this.events.emit('asset:Data', data);

      }
    } catch (error) {
      console.log('Error getting response', error);
    }
  }

  public ngOnDestroy() {
    this.events.dispose('onClick:Event');
  }

}
