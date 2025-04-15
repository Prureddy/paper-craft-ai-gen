
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';
import FileUploader from "./FileUploader";
import { generateQuestionPaper } from "../services/questionPaperService";

const QUESTION_TYPES = [
  { id: "multipleChoice", label: "Multiple Choice" },
  { id: "longAnswer", label: "Long Answer" },
  { id: "shortAnswer", label: "Short Answer" },
];

const EXAM_TYPES = [
  { value: "Test", label: "Test" },
  { value: "Internal Assessment", label: "Internal Assessment" },
  { value: "Semester End", label: "Semester End" },
];

const DIFFICULTY_LEVELS = [
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
  { value: "Mixed", label: "Mixed" },
];

export default function QuestionPaperForm() {
  const [formData, setFormData] = useState({
    api_key: "",
    college_name: "",
    exam_type: "Test",
    total_marks: 100,
    title: "",
    question_difficulty: "Mixed",
  });
  
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState<Blob | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionTypeChange = (type: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedQuestionTypes((prev) => [...prev, type]);
    } else {
      setSelectedQuestionTypes((prev) => prev.filter((t) => t !== type));
    }
  };

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      toast.error("Please upload at least one PDF file");
      return;
    }

    // Show a warning if no question types are selected
    if (selectedQuestionTypes.length === 0) {
      toast.warning("No question types selected. Defaulting to 'Mixed'");
    }

    try {
      setLoading(true);
      setGeneratedPdf(null);
      
      // Prepare form data for submission
      const formDataToSubmit = new FormData();
      
      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSubmit.append(key, value.toString());
      });
      
      // Add selected question types or "Mixed" if none selected
      if (selectedQuestionTypes.length > 0) {
        selectedQuestionTypes.forEach(type => {
          formDataToSubmit.append("question_types", type);
        });
      } else {
        formDataToSubmit.append("question_types", "Mixed");
      }
      
      // Add files
      files.forEach(file => {
        formDataToSubmit.append("files", file);
      });
      
      // Send request to API
      const pdfBlob = await generateQuestionPaper(formDataToSubmit);
      
      // Set the generated PDF and show success message
      setGeneratedPdf(pdfBlob);
      toast.success("Question paper generated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate question paper");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!generatedPdf) return;
    
    const url = URL.createObjectURL(generatedPdf);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formData.title || 'question_paper'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Exam Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
              <CardDescription>Enter the basic information about your exam</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api_key">API Key</Label>
                <Input
                  id="api_key"
                  name="api_key"
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={formData.api_key}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="college_name">College Name</Label>
                <Input
                  id="college_name"
                  name="college_name"
                  placeholder="Enter college name"
                  value={formData.college_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Exam Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="E.g., Final Exam, Midterm Test"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exam_type">Exam Type</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("exam_type", value)}
                  defaultValue={formData.exam_type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="total_marks">Total Marks</Label>
                <Input
                  id="total_marks"
                  name="total_marks"
                  type="number"
                  min="1"
                  placeholder="Enter total marks"
                  value={formData.total_marks}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Question Settings Section */}
          <Card>
            <CardHeader>
              <CardTitle>Question Settings</CardTitle>
              <CardDescription>Configure the types of questions for your exam</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Question Types</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select the types of questions to include (defaults to Mixed if none selected)
                </p>
                <div className="space-y-2">
                  {QUESTION_TYPES.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.id}
                        checked={selectedQuestionTypes.includes(type.label)}
                        onCheckedChange={(checked) => 
                          handleQuestionTypeChange(type.label, checked === true)
                        }
                      />
                      <Label htmlFor={type.id} className="cursor-pointer">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="question_difficulty">Question Difficulty</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("question_difficulty", value)}
                  defaultValue={formData.question_difficulty}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Course Materials</CardTitle>
            <CardDescription>
              Upload PDF files containing the course materials to generate questions from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader onFilesChange={handleFilesChange} />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            className="w-full md:w-auto px-8"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Question Paper"}
          </Button>
        </div>
      </form>

      {/* Results Section */}
      {(loading || generatedPdf) && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Generated Question Paper</CardTitle>
            <CardDescription>
              {loading
                ? "Please wait while we generate your question paper..."
                : "Your question paper has been generated successfully!"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              generatedPdf && (
                <div className="w-full flex flex-col items-center space-y-4">
                  <div className="bg-secondary p-6 rounded-md w-full max-w-md text-center">
                    <p className="text-lg font-medium mb-2">Question Paper Ready!</p>
                    <p className="text-sm text-muted-foreground">
                      Your question paper has been generated based on your specifications.
                      Click the button below to download it.
                    </p>
                  </div>
                  <Button
                    onClick={handleDownloadPdf}
                    size="lg"
                    className="mt-4"
                  >
                    Download PDF
                  </Button>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
