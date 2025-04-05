<?php

namespace App\Exports;

use App\Models\Payment;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class SubscriptionsExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize, WithColumnFormatting
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Payment::with(['packageUser.user', 'packageUser.package'])
            ->get()
            ->map(function ($payment) {
                return [
                    'Student Name' => $payment->packageUser->user->first_name . ' ' . $payment->packageUser->user->last_name,
                    'Package Name' => $payment->packageUser->package->name,
                    'Amount Paid' => $payment->amount_paid	,
                    'Payment Status' => ucfirst($payment->payment_status), // Capitalize first letter
                    'Payment Date' => $payment->created_at->format('Y-m-d H:i'),
                    'Transaction Reference' => $payment->transaction_reference
                ];
            });
    }

    /**
    * @return array
    */
    public function headings(): array
    {
        return [
            'Student Name',
            'Package Name',
            'Amount Paid',
            'Payment Status',
            'Payment Date',
            'Transaction Reference'
        ];
    }
    
    /**
     * @param Worksheet $sheet
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row (headers)
            1 => [
                'font' => ['bold' => true, 'size' => 12],
                'fill' => [//background color 
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E2EFDA']
                ],
            ],
            // Style all cells
            'A1:F100' => [
                'alignment' => [
                    'wrapText' => true,
                    'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    ],
                ],
            ],
        ];
    }
    
    /**
     * @return array
     */
    public function columnFormats(): array
    {
        return [
            'C' => NumberFormat::FORMAT_ACCOUNTING_USD,
            'E' => NumberFormat::FORMAT_DATE_DATETIME,
        ];
    }
}