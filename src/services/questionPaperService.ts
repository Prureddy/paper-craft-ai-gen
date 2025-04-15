
// Service to handle API interactions

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
    
    // Send the data to your Supabase API endpoint
    const response = await fetch('/approve_question_paper/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...paperData,
        pdf_data: base64Data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to approve question paper:', error);
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
