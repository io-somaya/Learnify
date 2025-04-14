import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDateFormat',
  standalone: true,
})
export class CustomDateFormatPipe implements PipeTransform {
  transform(time: string): string {
    if (!time) {
      return '';
    }

    // Split the time string into hours, minutes, and seconds
    const [hours24, minutes] = time.split(':');
    
    // Convert hours to number
    let hours = parseInt(hours24);
    
    // Determine if it's AM or PM
    const ampm = hours >= 12 ? 'pm' : 'am';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    
    // Return formatted time
    return `${hours}:${minutes} ${ampm}`;
  }
}