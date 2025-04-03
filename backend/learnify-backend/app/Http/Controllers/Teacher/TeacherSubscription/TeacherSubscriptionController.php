<?php

namespace App\Http\Controllers\Teacher\TeacherSubscription;

use App\Exports\SubscriptionsExport;
use App\Http\Controllers\Controller;
use App\Http\traits\ApiTrait;
use App\Models\Payment;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class TeacherSubscriptionController extends Controller
{
    use ApiTrait;

    //get all filtered subscription for the teacher 
    public function index(Request $request)
    {
        $subscriptions = Payment::with(["PackageUser.user", "PackageUser.package"])
            ->when($request->payment_status, function ($query) use ($request) {
                return $query->where("payment_status", "$request->payment_status");
            })
            ->get();

        return $this->apiResponse(200, "Subscciptions Retrieved", null, $subscriptions);
    }

    // Export to Excel
    public function export()
    {
        return Excel::download(new SubscriptionsExport, 'subscriptions.xlsx');
    }
}
