
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { fetchApprovedPapers } from "../services/questionPaperService";
import { toast } from "sonner";
import { Download } from "lucide-react";

export default function ApprovedPapersSearch() {
  const [searchParams, setSearchParams] = useState({
    subject_name: "",
    course_code: "",
    date: ""
  });
  
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const approvedPapers = await fetchApprovedPapers(searchParams);
      setPapers(approvedPapers);
      
      if (approvedPapers.length === 0) {
        toast.info("No papers found matching your criteria");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch papers");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadPdf = (paperData: string, fileName: string) => {
    // Convert base64 to blob
    const byteCharacters = atob(paperData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName || 'question_paper'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Load initial papers on component mount
  useEffect(() => {
    const loadInitialPapers = async () => {
      try {
        setLoading(true);
        const initialPapers = await fetchApprovedPapers();
        setPapers(initialPapers);
      } catch (error) {
        console.error("Failed to load initial papers:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialPapers();
  }, []);
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Question Papers</CardTitle>
          <CardDescription>Find approved question papers by subject, course code, or date</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="subject_name">Subject Name</Label>
              <Input
                id="subject_name"
                name="subject_name"
                placeholder="Filter by subject"
                value={searchParams.subject_name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="course_code">Course Code</Label>
              <Input
                id="course_code"
                name="course_code"
                placeholder="Filter by course code"
                value={searchParams.course_code}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={searchParams.date}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="flex items-end">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Searching..." : "Search Papers"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Results Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Found Question Papers ({papers.length})</h3>
        
        {loading && (
          <div className="h-40 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        )}
        
        {!loading && papers.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <p className="text-muted-foreground">No question papers found. Try different search criteria or approve some papers.</p>
            </CardContent>
          </Card>
        )}
        
        {!loading && papers.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {papers.map((paper) => (
              <Card key={paper.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{paper.title}</CardTitle>
                  <CardDescription>
                    {paper.subject_name} ({paper.course_code})
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Exam Type:</span> {paper.exam_type}</p>
                    <p><span className="font-medium">Total Marks:</span> {paper.total_marks}</p>
                    <p><span className="font-medium">Difficulty:</span> {paper.question_difficulty}</p>
                    <p><span className="font-medium">Question Types:</span> {Array.isArray(paper.question_types) ? paper.question_types.join(', ') : paper.question_types}</p>
                    <p><span className="font-medium">Created:</span> {new Date(paper.created_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleDownloadPdf(paper.pdf_data, paper.title)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
