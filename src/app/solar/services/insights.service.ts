
import { timeout } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams, HttpHeaders } from '@angular/common/http';

import * as _ from 'lodash';

@Injectable()
export class InsightsService {

  private baseUrl: string;

  private DEFAULT_MAX_HTTP_TIME = 30000;
  private DOCUMENT_MAX_HTTP_TIME = 50000;

  constructor(private http: HttpClient) {
  }

  async _fetchRaw(method, url, data, accessToken, maxTime, type?): Promise<any> {

    // handle undefined data
    if (!_.isObject(data)) {
      data = {};
    }

    // base url for api
    this.baseUrl = 'https://app.ipredict.io/';

    // url of request
    const apiUrl = this.baseUrl + url;
    const apiVerb = method;
    let params = new HttpParams();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    });

    try {

      // handle request type
     if (apiVerb === 'get') {

        _.forOwn(data, (value, key) => {
          const bIterate = _.isObject(value);
          if (bIterate) {
            params = params.append(key, JSON.stringify(value));
          } else {
            params = params.append(key, value);
          }
        });
      }

      if (accessToken) {
        headers = headers.set('Authorization', 'Bearer ' + accessToken);
      }

      let httpRequest = new HttpRequest(_.toUpper(apiVerb), apiUrl, data, {
        headers: headers,
        params: params,
        withCredentials: true
      });

      console.log('httpRequest', httpRequest);

      const result = await this.http
        .request(httpRequest).pipe(
        timeout((maxTime) ? maxTime : this.DEFAULT_MAX_HTTP_TIME))
        .toPromise();

      return _.get(result, 'body', {});

    } catch (ex) {
      throw(ex);
    }

  }

  async _fetch(method, url, data, accessToken, maxTime, type?) {

    try {

      const result = await this._fetchRaw(method, url, data, accessToken, maxTime, type);

      return result;

    } catch (ex) {
        return Promise.reject(ex);
    }
  }

  public async post (url, data?, accessToken?, type?, maxTime = this.DEFAULT_MAX_HTTP_TIME): Promise<any> {
    if (type === 'document') {
      maxTime = this.DOCUMENT_MAX_HTTP_TIME;
    }
    return this._fetch('post', url, data, accessToken, maxTime, type);
  }

}
