import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as _ from 'lodash';

@Injectable()
export class InsightsEventsService {

  subjects: any;

  constructor() {
    this.subjects = {};
  }

  protected createName(name: string) {
    return '$' + name;
  }

  emit(name: string, data?: any) {
    const fnName = this.createName(name);

    if (!_.has(this.subjects, fnName)) {
      this.subjects[fnName] = new Subject();
    }

    this.subjects[fnName].next(data);
  }

  listen(name: any, handler: Function) {
    const fnName = this.createName(name);

    if (!_.has(this.subjects, fnName)) {
      this.subjects[fnName] = new Subject();
    }

    return this.subjects[fnName].subscribe(handler);
  }

  dispose(name: string) {
    const fnName = this.createName(name);

    if (_.has(this.subjects, fnName)) {
      this.subjects = _.omit(this.subjects, fnName);
    }
  }
}
