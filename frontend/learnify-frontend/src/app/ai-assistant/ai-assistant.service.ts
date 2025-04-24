import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiAssistantService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get AI response for user query
   * @param query User's question
   * @param context Optional context information
   * @returns Observable with the AI response
   */
  getResponse(query: string, context?: string): Observable<any> {
    const userId = this.getCurrentUserId();
    return this.http.post(`${this.apiUrl}/ai-assistant/get-response`, {
      query,
      context,
      user_id: userId
    });
  }

  /**
   * Get available help topics
   * @returns Observable with help topics
   */
  getHelpTopics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ai-assistant/help-topics`);
  }

  /**
   * Get current user ID from local storage
   * @returns User ID as number
   */
  private getCurrentUserId(): number {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || 0;
  }

  /**
   * Rate assistant response
   * @param interactionId ID of the AI interaction
   * @param wasHelpful Whether the response was helpful
   * @returns Observable with the result
   */
  rateResponse(interactionId: number, wasHelpful: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/ai-assistant/rate-response`, {
      interaction_id: interactionId,
      was_helpful: wasHelpful
    });
  }
}
