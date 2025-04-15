
// Service to handle API interactions
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
