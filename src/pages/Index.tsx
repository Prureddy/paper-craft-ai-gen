
import QuestionPaperForm from "@/components/QuestionPaperForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="py-6 border-b bg-card shadow-sm">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-primary">Question Paper Generator</h1>
          <p className="text-muted-foreground">
            Create professional exam papers with AI-powered content generation
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-6">Generate Your Question Paper</h2>
            <QuestionPaperForm />
          </section>
        </div>
      </main>

      <footer className="mt-auto py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Question Paper Generator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
