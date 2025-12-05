import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

const API_URL = environment.baseUrl + '/DataSecurityUser';

export interface UserInterface {
    id: string;
    userName: string;
    email: string;
    active: boolean;
    createDate: Date;
    createBy: string;
    updateDate: Date;
    updateBy: string;
    roleName: string;
    prettyName: string;
}

export interface CreateUserInterface {
    userName: string;
    email: string;
    password: string;
    createBy: string;
    roleId: string;
}

export interface UpdateUserInterface {
    userName: string;
    email: string;
    active: boolean;
    updateBy: string;
    roleId: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManager {
  private readonly _http = inject(HttpClient);

  constructor() { }

  getUsers(): Observable<UserInterface[]> {
    return this._http.get<UserInterface[]>(`${API_URL}/v1/get-all`);
  }

  getUserById(id: string): Observable<UserInterface> {
    return this._http.get<UserInterface>(`${API_URL}/user/${id}`);
  }

  createUser(createDto: CreateUserInterface): Observable<UserInterface> {
    return this._http.post<UserInterface>(`${API_URL}/v1/create`, createDto);
  }

  updateUser(id: string, updateDto: UpdateUserInterface): Observable<UserInterface> {
    return this._http.post<UserInterface>(`${API_URL}/v1/update/${id}`, updateDto);
  }

  deleteUser(id: string): Observable<void> {
    return this._http.delete<void>(`${API_URL}/user/${id}`);
  }

}
