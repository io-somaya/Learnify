<?php

// 1. SubscriptionPackage Model (needed for StudentPackageSubscription)
// Path: app/Models/SubscriptionPackage.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPackage extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'type',
        'price',
        'duration_days',
        'discount',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'discount' => 'decimal:2',
        'duration_days' => 'integer',
    ];

    /**
     * Get the subscriptions for this package.
     */
    public function subscriptions()
    {
        return $this->hasMany(StudentPackageSubscription::class, 'package_id');
    }
}

// 2. Payment Model (needed for StudentPackageSubscription)
// Path: app/Models/Payment.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'student_package_subscription_id',
        'amount_paid',
        'status',
        'transaction_reference',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount_paid' => 'decimal:2',
    ];

    /**
     * Get the subscription that this payment is for.
     */
    public function subscription()
    {
        return $this->belongsTo(StudentPackageSubscription::class, 'student_package_subscription_id');
    }
}

// 3. Exam Model (needed for StudentExamSubmission)
// Path: app/Models/Exam.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'start_time',
        'end_time',
        'passing_score',
        'exam_type',
        'grade',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'passing_score' => 'integer',
    ];

    /**
     * Get the questions for this exam.
     */
    public function questions()
    {
        return $this->hasMany(ExamQuestion::class, 'exam_id');
    }

    /**
     * Get the submissions for this exam.
     */
    public function submissions()
    {
        return $this->hasMany(StudentExamSubmission::class, 'exam_id');
    }
}

// 4. StudentQuestionAnswer Model (needed for StudentExamSubmission)
// Path: app/Models/StudentQuestionAnswer.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentQuestionAnswer extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'submission_id',
        'question_id',
        'selected_option_id',
        'score',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'score' => 'decimal:2',
    ];

    /**
     * Get the submission that this answer belongs to.
     */
    public function submission()
    {
        return $this->belongsTo(StudentExamSubmission::class, 'submission_id');
    }

    /**
     * Get the question that this answer is for.
     */
    public function question()
    {
        return $this->belongsTo(QuestionsBank::class, 'question_id');
    }
}

// 5. ExamQuestion Model (needed for Exam)
// Path: app/Models/ExamQuestion.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamQuestion extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'exam_id',
        'question_id',
        'points',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'points' => 'integer',
    ];

    /**
     * Get the exam that this question belongs to.
     */
    public function exam()
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }

    /**
     * Get the question details.
     */
    public function question()
    {
        return $this->belongsTo(QuestionsBank::class, 'question_id');
    }
}

// 6. QuestionsBank Model (needed for ExamQuestion and StudentQuestionAnswer)
// Path: app/Models/QuestionsBank.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuestionsBank extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'question_type',
        'question_text',
        'options',
        'correct_answer',
        'difficulty',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'options' => 'json',
    ];

    /**
     * Get the exam questions that reference this question.
     */
    public function examQuestions()
    {
        return $this->hasMany(ExamQuestion::class, 'question_id');
    }

    /**
     * Get the student answers for this question.
     */
    public function studentAnswers()
    {
        return $this->hasMany(StudentQuestionAnswer::class, 'question_id');
    }
}
