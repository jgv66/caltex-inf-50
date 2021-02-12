import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-vistaproducto',
  templateUrl: './vistaproducto.component.html',
  styleUrls: ['./vistaproducto.component.scss']
})
export class VistaproductoComponent implements OnInit {

  @Input() producto;
  @Input() occ;

  constructor() { }

  ngOnInit() {
  }

}
