"use client";

import React, { useRef, useState, useEffect } from "react";
import { Editor, OnMount } from "@monaco-editor/react";
import { CODE_SNIPPETS } from "../lib/constants";
import LanguageSelector from "./LanguageSelector";
import Output from "../components/Output";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Download, Moon, Sun } from "lucide-react";
import * as monaco from "monaco-editor";

type SupportedLanguage = keyof typeof CODE_SNIPPETS;

const CodeEditor: React.FC = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [value, setValue] = useState<string>("");
  const [language, setLanguage] = useState<SupportedLanguage>("javascript");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setValue(CODE_SNIPPETS[language]);
  }, [language]);

  const onMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language: SupportedLanguage): void => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
  };

  const copyCode = (): void => {
    if (value) {
      navigator.clipboard.writeText(value);
    }
  };

  const downloadCode = (): void => {
    if (value) {
      const fileExtension = getFileExtension(language);
      const blob = new Blob([value], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `code.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getFileExtension = (lang: SupportedLanguage): string => {
    const extensions: Record<SupportedLanguage, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      csharp: "cs",
    };
    return extensions[lang] || "txt";
  };

  const toggleTheme = () => {
    setIsSpinning(true);
    setTheme(theme === "dark" ? "light" : "dark");
    setTimeout(() => setIsSpinning(false), 1000);
  };

  if (!mounted) return null;

  return (
    <Card className="w-full h-screen overflow-y-auto px-2 py-2 sm:px-4 sm:py-4">
      <CardHeader className="pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-2xl font-medium">Code Editor</h2>
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={toggleTheme}>
                  {theme === "dark" ? (
                    <Sun
                      className={`h-4 w-4 ${isSpinning ? "animate-spin" : ""}`}
                      color="#FFD700"
                    />
                  ) : (
                    <Moon
                      className={`h-4 w-4 ${isSpinning ? "animate-spin" : ""}`}
                      color="#4169E1"
                    />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle theme</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Copy Code */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={copyCode}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy code</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy code</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Download Code */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={downloadCode}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download code</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download code</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="w-full">
          <LanguageSelector language={language} onSelect={onSelect} />
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Editor Section */}
          <div className="w-full lg:w-1/2">
            <div className="mb-2">
              <h3 className="text-sm font-medium">Editor</h3>
            </div>
            <div className="border rounded-md overflow-hidden">
              <Editor
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  wordWrap: "on",
                  automaticLayout: true,
                  lineNumbers: "on",
                  scrollbar: {
                    vertical: "auto",
                    horizontal: "auto",
                  },
                }}
                height="70vh"
                theme={theme === "dark" ? "vs-dark" : "light"}
                language={language}
                defaultValue={CODE_SNIPPETS[language]}
                onMount={onMount}
                value={value}
                onChange={(value) => setValue(value || "")}
              />
            </div>
          </div>

          {/* Output Section */}
          <div className="w-full lg:w-1/2">
            <div className="mb-2">
              <h3 className="text-sm font-medium">Output</h3>
            </div>
            <div className="border rounded-md overflow-hidden h-[70vh]">
              <Output editorRef={editorRef} language={language} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeEditor;