import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import assemblyProductionRoutes from './assemblyProduction.routes';
import { ModulesComponent } from '../../shared/modules/modules.component';
import { TitlePageComponent } from "../../shared/titlePage/titlePage.component";

@Component({
  selector: 'app-assembly-production',
  standalone: true,
  imports: [ModulesComponent, TitlePageComponent],
  templateUrl: './assemblyProduction.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AssemblyProductionComponent {
  public apRoutes = assemblyProductionRoutes;
}
