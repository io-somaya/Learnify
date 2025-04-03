<?php

namespace App\Http\Controllers\Teacher\TeacherSubscription;

use App\Http\Controllers\Controller;
use App\Http\traits\ApiTrait;
use App\Models\Payment;
use Illuminate\Http\Request;

class TeacherSubscriptionController extends Controller
{
    use ApiTrait;

    //get all filtered subscription for the teacher 
    public function index(Request $request)
    {
        $subscriptions = Payment::with(["PackageUser.user", "PackageUser.package"])
            ->when($request->status, function ($query) use($request)
            {
                return $query->where("status", "$request->status");
            })
            ->get();

            return $this->apiResponse(200, "Subscciptions Retrieved", null , $subscriptions);
    }


}
