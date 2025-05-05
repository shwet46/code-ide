"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Loader2, Copy, CheckCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { executeCode } from "../lib/api";


interface OutputProps {
  editorRef: React.MutableRefObject<any>;
  language: string;
}

const Output: React.FC<OutputProps> = ({ editorRef, language }) => {
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const runCode = async () => {
    if (!editorRef.current) return;

    setIsExecuting(true);
    setError(null);
    setOutput("");
    setExecutionTime(null);
    
    const startTime = performance.now();
    const sourceCode = editorRef.current.getValue();
    
    try {
      const result = await executeCode(language, sourceCode);
      
      const endTime = performance.now();
      setExecutionTime(Math.round((endTime - startTime) * 100) / 100);
      
      if (result.run.stderr) {
        setError(result.run.stderr);
      } else {
        let outputText = result.run.stdout || "";
        if (result.run.output && result.run.output !== outputText) {
          outputText += result.run.output;
        }
        setOutput(outputText || "Code executed successfully with no output");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "An error occurred while executing the code";
      setError(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = () => {
    const contentToCopy = error || output;
    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasContent = output || error;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center h-14 px-4 mb-1">
        <div className="flex items-center space-x-2">
          <div className="text-xs font-medium text-muted-foreground">
            Console
            {error && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-red-500"></span>}
            {output && !error && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-500"></span>}
          </div>
          {executionTime !== null && (
            <span className="text-xs text-muted-foreground">
              {executionTime}ms
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {hasContent && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={copyToClipboard} 
              className="h-8 w-8"
              title="Copy to clipboard"
            >
              {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-5" />}
            </Button>
          )}
          <Button
            onClick={runCode}
            disabled={isExecuting}
            size="sm"
            className="h-8 text-sm px-2"
          >
            {isExecuting ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Play className="mr-1 h-3 w-3" />
            )}
            {isExecuting ? "Running..." : "Run"}
          </Button>
        </div>
      </div>
      
      <Card className="flex-1 overflow-hidden border flex flex-col">
        <ScrollArea className="flex-1">
          {error ? (
            <Alert variant="destructive" className="m-2 border-none">
              <AlertDescription className="font-mono text-xs whitespace-pre-wrap">
                {error}
              </AlertDescription>
            </Alert>
          ) : output ? (
            <pre className="font-mono text-xs whitespace-pre-wrap p-3">{output}</pre>
          ) : (
            <div className="text-muted-foreground text-xs h-full flex items-center justify-center p-4">
              Run your code to see the output here
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Output;