import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'upm-subtitle-page',
  imports: [],
  templateUrl: './subTitlePage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubTitlePageComponent {
  titlePage = input<string>('');
  subtitlePage = input<string>('');
  descriptionPage = input<string>('');
 }
