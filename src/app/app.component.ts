import {AfterViewInit, Component} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'assets-ui';
  private accessToken: any;
  public response: any;
  public measName: any;

  constructor(private http: HttpClient, private api: ApiService) {

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

    if (event) {

      console.log('this.accessToken', this.accessToken);

      this.response = await this.api.post('SolarSightWS/generic/pg/selectFrom',
        {
          "keySpace": "iot",
          "tableName": "asset_meas_by_min_hist",
          "allCols": true,
          "cols": ["site_ref_key", "asset_ref_key", "meas_name", "meas_date"],
          "andConditions": [
            {"col": "party_id", "operator": "=", "value": "TEPSOL"},
            {"col": "site_ref_key", "operator": "IN", "values": ["TEPSOL_SITE_001"]},
            {"col": "asset_ref_key", "operator": "IN", "values": ["TEPSOL_SITE_001_110101"]},
            {"col": "meas_name", "operator": "IN", "values": this.measName},
            {"col": "meas_date", "operator": ">=", "value": "2019-06-01"},
            {"col": "meas_date", "operator": "<=", "value": "2020-06-07"}
          ],
          "orderBy": "meas_date",
          "orderType": "ASC"
        }, this.accessToken);

      console.log('this.response', this.response);

    }
  }

}
