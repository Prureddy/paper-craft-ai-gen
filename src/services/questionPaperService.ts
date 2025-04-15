
import { supabase } from "@/integrations/supabase/client";

/**
 * Generate a question paper by sending form data to the API
 */
export const generateQuestionPaper = async (formData: FormData): Promise<Blob> => {
  try {
    const response = await fetch('/generate_question_paper/', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Error: ${response.status} ${response.statusText}`);
    }

    const pdfBlob = await response.blob();
    return pdfBlob;
  } catch (error) {
    console.error('Failed to generate question paper:', error);
    throw error;
  }
};

/**
 * Store an approved question paper in Supabase
 */
export const approveQuestionPaper = async (
  paperData: {
    college_name: string;
    exam_type: string;
    total_marks: number;
    title: string;
    question_difficulty: string;
    subject_name: string;
    course_code: string;
    question_types: string[];
    created_at: string;
  }, 
  pdfBlob: Blob
): Promise<void> => {
  try {
    // Convert PDF blob to Base64 for storage
    const base64Data = await blobToBase64(pdfBlob);
    
    // Insert record into Supabase using a raw insert query
    // This bypasses the type checking issues
    const { error } = await supabase
      .from('approved_papers')
      .insert({
        college_name: paperData.college_name,
        exam_type: paperData.exam_type,
        total_marks: paperData.total_marks,
        title: paperData.title,
        question_difficulty: paperData.question_difficulty,
        subject_name: paperData.subject_name,
        course_code: paperData.course_code,
        question_types: paperData.question_types,
        created_at: paperData.created_at,
        pdf_data: base64Data
      } as any); // Using type assertion to bypass type checking

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to store question paper: ${error.message}`);
    }
  } catch (error) {
    console.error('Failed to approve question paper:', error);
    throw error;
  }
};

/**
 * Fetch approved question papers from Supabase
 */
export const fetchApprovedPapers = async (
  filters?: {
    subject_name?: string;
    course_code?: string;
    date?: string;
  }
): Promise<any[]> => {
  try {
    // Using type assertion to bypass type checking for now
    let query = supabase
      .from('approved_papers')
      .select('*')
      .order('created_at', { ascending: false }) as any;
    
    // Apply filters if provided
    if (filters) {
      if (filters.subject_name) {
        query = query.eq('subject_name', filters.subject_name);
      }
      if (filters.course_code) {
        query = query.eq('course_code', filters.course_code);
      }
      if (filters.date) {
        // Filter by date (exact match for the date part)
        const dateStart = new Date(filters.date);
        dateStart.setUTCHours(0, 0, 0, 0);
        
        const dateEnd = new Date(filters.date);
        dateEnd.setUTCHours(23, 59, 59, 999);
        
        query = query
          .gte('created_at', dateStart.toISOString())
          .lte('created_at', dateEnd.toISOString());
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch approved papers: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch approved papers:', error);
    throw error;
  }
};

/**
 * Convert a Blob to a Base64 string
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

