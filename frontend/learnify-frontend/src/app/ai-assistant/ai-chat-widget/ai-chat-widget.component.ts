import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiAssistantService } from '../ai-assistant.service';

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface HelpTopic {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-ai-chat-widget',
  templateUrl: './ai-chat-widget.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./ai-chat-widget.component.scss']
})
export class AiChatWidgetComponent implements OnInit {
  isOpen = false;
  messages: ChatMessage[] = [];
  userInput = '';
  isLoading = false;
  helpTopics: HelpTopic[] = [];
  showTopics = false;
  currentInteractionId?: number;

  constructor(private aiService: AiAssistantService) { }

  ngOnInit(): void {
    this.loadHelpTopics();
  }

  loadHelpTopics(): void {
    this.aiService.getHelpTopics().subscribe(
      response => {
        if (response.success) {
          this.helpTopics = response.topics;
        }
      },
      error => {
        console.error('Error loading help topics:', error);
      }
    );
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen && this.messages.length === 0) {
      this.showWelcomeMessage();
      this.showTopics = true;
    }
  }

  showWelcomeMessage(): void {
    this.messages.push({
      content: 'Hello! I\'m your AI learning assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date()
    });
  }

  selectTopic(topic: HelpTopic): void {
    this.showTopics = false;
    this.sendMessage(`Help me with ${topic.name}`);
  }

  sendMessage(message?: string): void {
    const messageText = message || this.userInput.trim();

    if (!messageText) return;

    // Add user message to chat
    this.messages.push({
      content: messageText,
      isUser: true,
      timestamp: new Date()
    });

    this.isLoading = true;
    this.userInput = '';

    // Get response from AI service
    this.aiService.getResponse(messageText).subscribe(
      response => {
        if (response.success) {
          this.messages.push({
            content: response.response,
            isUser: false,
            timestamp: new Date()
          });

          if (response.interaction_id) {
            this.currentInteractionId = response.interaction_id;
          }
        } else {
          this.handleError();
        }
        this.isLoading = false;
      },
      error => {
        console.error('Error getting AI response:', error);
        this.handleError();
        this.isLoading = false;
      }
    );
  }

  handleError(): void {
    this.messages.push({
      content: 'Sorry, I encountered a problem. Please try again later or contact support on learnify.supp.G2025@gmail.com for assistance. we will get back to you as soon as possible.',
      isUser: false,
      timestamp: new Date()
    });
  }

  rateResponse(wasHelpful: boolean): void {
    if (this.currentInteractionId) {
      this.aiService.rateResponse(this.currentInteractionId, wasHelpful).subscribe();
      this.currentInteractionId = undefined;

      this.messages.push({
        content: wasHelpful ?
          'Thank you for your feedback!' :
          'I\'m sorry I couldn\'t help. Let me try a different approach.',
        isUser: false,
        timestamp: new Date()
      });

      if (!wasHelpful) {
        this.showTopics = true;
      }
    }
  }

  clearChat(): void {
    this.messages = [];
    this.showWelcomeMessage();
    this.showTopics = true;
  }
}
