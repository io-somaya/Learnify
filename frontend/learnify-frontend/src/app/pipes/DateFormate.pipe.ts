import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDateFormat',
  standalone: true, // Make sure this is set to true
})
export class CustomDateFormatPipe implements PipeTransform {
  transform(dateString: string): string {
    if (!dateString) {
      return '';
    }

    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    // Get day and month
    const day = date.getDate();
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    
    // Get hours in 12-hour format
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    // Get minutes with leading zero if needed
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    // Return formatted date string
    // return `${day}-${month} ${hours}:${minutes} ${ampm}`;
    return `${hours}:${minutes} ${ampm}`;

  }
}