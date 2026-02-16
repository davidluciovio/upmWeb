import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'selector-name',
    standalone: true,
    imports: [],
    template:  `

    `, 
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class NameComponent implements OnInit {
    constructor() { }

    ngOnInit() { }
}


