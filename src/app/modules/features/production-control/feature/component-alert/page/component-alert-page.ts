import { Component } from '@angular/core';
import { CardContainerInterface, CardAlertContainer } from '../components/card-alert-container/card-alert-container';

@Component({
  selector: 'app-component-alert-page',
  standalone: true,
  imports: [CardAlertContainer],
  template:`
    <card-container [options]="optionsPendientCards"></card-container>
  `
})
export class ComponentAlertPage {
    optionsPendientCards: CardContainerInterface = {
        icon: 'motion_play',
        iconColor: 'text-yellow-500',
        title: 'Pendientes'
    }
}
