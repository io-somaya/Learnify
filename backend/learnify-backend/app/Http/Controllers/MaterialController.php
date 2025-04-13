<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\Lesson;
use App\Http\Resources\MaterialResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MaterialController extends Controller
{
    /**
     * Display a listing of the materials.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $materials = Material::with('lesson')->get();

        return response()->json([
            'success' => true,
            'data' => MaterialResource::collection($materials)
        ]);
    }

    /**
     * Store a newly created material in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'lesson_id' => 'required|exists:lessons,id',
            'file_name' => 'required|string|max:255',
            'file_url' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $material = Material::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Material created successfully',
            'data' => new MaterialResource($material)
        ], 201);
    }

    /**
     * Display the specified material.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $material = Material::with('lesson')->find($id);

        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'Material not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new MaterialResource($material)
        ]);
    }

    /**
     * Update the specified material in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $material = Material::find($id);

        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'Material not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'lesson_id' => 'sometimes|required|exists:lessons,id',
            'file_name' => 'sometimes|required|string|max:255',
            'file_url' => 'sometimes|required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $material->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Material updated successfully',
            'data' => new MaterialResource($material)
        ]);
    }

    /**
     * Remove the specified material from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $material = Material::find($id);

        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'Material not found'
            ], 404);
        }

        $material->delete();

        return response()->json([
            'success' => true,
            'message' => 'Material deleted successfully'
        ]);
    }

    /**
     * Get materials for a specific lesson.
     *
     * @param  int  $lessonId
     * @return \Illuminate\Http\Response
     */
    public function getMaterialsByLesson($lessonId)
    {
        $lesson = Lesson::find($lessonId);

        if (!$lesson) {
            return response()->json([
                'success' => false,
                'message' => 'Lesson not found'
            ], 404);
        }

        $materials = Material::where('lesson_id', $lessonId)->get();

        return response()->json([
            'success' => true,
            'data' => MaterialResource::collection($materials)
        ]);
    }
}
