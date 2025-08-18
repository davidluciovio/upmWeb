import { ChangeDetectionStrategy, Component } from '@angular/core';
import coreRoutes from '../../core.routes';
import { TitlePageComponent } from "../../../shared/titlePage/titlePage.component";
import { ModulesComponent } from "../../../shared/modules/modules.component";

@Component({
  selector: 'app-dashboard',
  imports: [TitlePageComponent, ModulesComponent],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardComponent {
  public coreRoutes = coreRoutes;
  //
  //
  constructor() {}
  //

}
