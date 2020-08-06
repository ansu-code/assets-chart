import { AfterViewInit, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InsightsService } from '../services/insights.service';
import { InsightsEventsService } from '../services/insights.events.service';
import { isEmpty, flattenDeep } from 'lodash';
import * as moment from 'moment';

let checked = false;

@Component({
  selector: 'app-insights',
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.scss']
})
export class InsightsComponent implements AfterViewInit {
  title = 'assets-ui';
  private accessToken: any;
  public data: any;
  public first = moment().subtract(365, 'd').format('YYYY-MM-DD');
  public last = moment().format('YYYY-MM-DD');

  /*public first = '2019-08-21';
  public last = '2019-09-21';*/

  public selectedItem = 'month';
  public dateRange: any[];
  public groupName: any[];
  public changeInRange: any;
  public checkBoxValues = [
    {
      name: 'COUNT_KWH_HR'
    },
    {
      name: 'AC_VOL_YB'
    }
  ];

  constructor(private http: HttpClient, private api: InsightsService, public events: InsightsEventsService) {
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

  public async getData(event, name, index, changeInRange = true) {

    try {

      console.log('first', this.first);
      console.log('last', this.last);
      console.log('index', index);

      // assign groupName

      this.groupName = name;

      // Check Event, Say if the checkbox is clicked

      if (event) {

        if (!changeInRange) {
          checked = true;
          this.groupName = [name];
        }

        this.data = await this.api.post('SolarSightWS/generic/pg/selectFrom',
          {
            "keySpace": "iot",
            "tableName": "asset_meas_by_min_hist",
            "allCols": true,
            "cols": ["site_ref_key", "asset_ref_key", "meas_name", "meas_date"],
            "andConditions": [
              {"col": "asset_ref_key", "operator": "IN", "values": ["TEPSOL_SITE_001_110101"]},

              {"col": "meas_name", "operator": "IN", "values": this.groupName},

              {"col": "meas_date", "operator": ">=", "value": this.first},
              {"col": "meas_date", "operator": "<=", "value": this.last}
            ],
            "orderBy": "meas_date",
            "orderType": "ASC"
          }, this.accessToken);

      } else {
        checked = false;
      }

      console.log('data', this.data);
      // Assign values to send it to the component

      this.data.last = this.first;
      this.data.checked = checked;
      this.data.groupName = this.groupName;
      this.data.changeInRange = changeInRange;
      this.data.index = index;

     // this.events.emit('asset:Data', this.data);

      // Check if the response from api is empty or not

       if (!isEmpty(this.data.result)) {
         this.events.emit('asset:Data', this.data);
       } else {
         this.data = [];
         this.data.last = this.first;
         this.data.checked = checked;
         this.data.groupName = this.groupName;
         this.data.index = index;
         this.data.changeInRange = changeInRange;
         this.events.emit('asset:Data', this.data);
         alert('No Data for the current range');
       }

    } catch (error) {
      console.log('Error getting response', error);
    }
  }

  // Range Event

  public getRangeChangeEvent(selectedItem) {

    if (selectedItem.value) {
      console.log('value', selectedItem.value);
    }

    if (this.selectedItem !== selectedItem.month || selectedItem.value) {
      this.selectedItem = selectedItem.month;
      console.log('this.selectedItem', selectedItem);
      this.getData(true, this.groupName, true);
    } else {
      alert('Please select different range');
    }
    checked = false;
  }

  // get date ranges

  public getDateRange(dateRange) {
    this.dateRange = dateRange;
    this.first = this.dateRange[0].first;
    this.last = this.dateRange[0].last;

  }

  // Set Group Name

  public getGroupName(groupName) {
    this.groupName = flattenDeep(groupName);
  }

  public getTimeEvent(changeInRange) {
    this.changeInRange = changeInRange;
  }

}
