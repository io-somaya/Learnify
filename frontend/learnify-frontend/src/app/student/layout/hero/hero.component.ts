import { Component , Input} from '@angular/core';
import { IUserProfile } from '../../../Interfaces/IUserProfile';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {
   @Input() user: IUserProfile | null = null;

  
  constructor(
  ) {}

  ngOnInit(): void {
  }

}
