import { Injectable } from '@angular/core';
import { Routes } from '@angular/router';
import { routes } from '../../app.routes';
import coreRoutes from '../core.routes';

interface Module {
  title?: string;
  route?: string;
  icon: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ModuleServiceService {
  private _routes = routes;
  private _routesCore = coreRoutes;

  constructor() {}

  getModules(): Module[] {
    let modules: Module[] = [];
    this._routes.forEach((route) => {
      if (route.data) {
        modules.push({
          title: `${route?.title}`,
          route: route.path,
          icon: route.data['icon'],
          roles: route.data['role'],
        });
      }
    });
    return modules;
  }

  getSystemModules(routes: Routes): Module[] {
    let modules: Module[] = [];
    routes.forEach((route) => {
      if (route.data) {
        modules.push({
          title: `${route?.title}`,
          route: route.path,
          icon: route.data['icon'],
          roles: route.data['role'],
        });
      }
    });
    return modules;
  }

}
