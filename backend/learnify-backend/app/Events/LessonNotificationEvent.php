<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LessonNotificationEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;
    public $grade;

    public function __construct(Notification $notification, $grade)
    {
        $this->notification = $notification;
        $this->grade = $grade;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel("grade.{$this->grade}.notifications"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'new.lesson';
    }
}