<?php

namespace App\Services;

use Jubaer\Zoom\Zoom;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class ZoomService
{
    protected $zoom;
    protected $accountId;
    protected $clientId;
    protected $clientSecret;

    public function __construct(Zoom $zoom)
    {
        $this->zoom = $zoom;
        $this->accountId = Config::get('zoom.account_id');
        $this->clientId = Config::get('zoom.client_id');
        $this->clientSecret = Config::get('zoom.client_secret');
    }

    const DEFAULT_DURATION = 60;
    const DEFAULT_TIMEZONE = 'Africa/Cairo';

   

    /**
     * Create a meeting using the Zoom package
     */
    public function createMeeting(array $lectureData)
    {
        try {
            $startTime = $this->calculateStartTime(
                $lectureData['day_of_week'],
                $lectureData['start_time']
            );

            $result = $this->zoom->createMeeting([
                'topic' => $lectureData['title'],
                'type' => 2,
                'start_time' => $startTime,
                'duration' => self::DEFAULT_DURATION,
                'timezone' => self::DEFAULT_TIMEZONE,
                'settings' => [
                    'join_before_host' => true,
                    'waiting_room' => false,
                    'approval_type' => 0
                ]
            ]);

            if ($result['status']) {
                return [
                    'join_url' => $result['data']['join_url'],
                    'id' => $result['data']['id'],
                    'start_url' => $result['data']['start_url']
                ];
            }
            
            
        } catch (\Exception $e) {
            Log::error('Error in createMeeting: ' . $e->getMessage());
        }
    }

    /**
     * Update an existing Zoom meeting
     */
    public function updateMeeting(string $meetingId, array $lectureData)
    {
        try {
            $startTime = $this->calculateStartTime(
                $lectureData['day_of_week'],
                $lectureData['start_time']
            );

            $result = $this->zoom->updateMeeting($meetingId, [
                'topic' => $lectureData['title'],
                'start_time' => $startTime,
                'duration' => self::DEFAULT_DURATION,
                'timezone' => self::DEFAULT_TIMEZONE,
                'settings' => [
                    'join_before_host' => true,
                    'waiting_room' => false,
                    'approval_type' => 0
                ]
            ]);

            if ($result['status']) {
                // Get updated meeting details
                $meetingDetails = $this->zoom->getMeeting($meetingId);
                if ($meetingDetails['status']) {
                    return [
                        'join_url' => $meetingDetails['data']['join_url'],
                        'id' => $meetingDetails['data']['id'],
                        'start_url' => $meetingDetails['data']['start_url']
                    ];
                }
            }
            
        } catch (\Exception $e) {
            Log::error('Error in updateMeeting: ' . $e->getMessage());
        }
    }

   
    private function calculateStartTime(string $day, string $time): string
    {
        return Carbon::parse("next $day $time")
            ->setTimezone(self::DEFAULT_TIMEZONE)
            ->toIso8601String();
    }


    public function deleteMeeting(string $meetingId): void
    {
        $this->zoom->deleteMeeting($meetingId);
    }
}