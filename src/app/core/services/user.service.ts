import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { User } from '../interfaces/user.interface';

const baseURL = environment.baseURL + '/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _http = inject(HttpClient);
  //
  //
  constructor() {}
  //
  //
  GetAll() {
    return this._http.get<User[]>(baseURL);
  }
}
