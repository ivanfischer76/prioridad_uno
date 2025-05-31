import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
      CommonModule, 
      NgbCarouselModule, 
      TranslateModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    slides = [
        {
            type: 'image',
            src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
            text: 'slider.nature'
        },
        {
            type: 'image',
            src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80',
            text: 'slider.adventure'
        },
        {
            type: 'image',
            src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
            text: 'slider.discover'
        }
    ];
}
