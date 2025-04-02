"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileText, HelpCircle } from "lucide-react";
import Editor from "@monaco-editor/react";

/**
 * String Converter component that allows users to convert text to a string array format
 * @returns {JSX.Element} The rendered String Converter page
 */
export default function StringConverter() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("output.txt");
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    handleConversion();
  }, [inputText]);

  const handleConversion = () => {
    try {
      setError("");
      if (!inputText.trim()) {
        setOutputText("");
        return;
      }

      // 處理每一行，添加引號並轉為字串陣列
      const lines = inputText.split("\n");
      const processedLines = lines
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => `  "${line}"`);

      // 如果有內容，則添加陣列括號並處理最後一行的逗號
      if (processedLines.length > 0) {
        // 將所有行加上逗號，除了最後一行
        const formattedLines = processedLines.map((line, index) =>
          index < processedLines.length - 1 ? `${line},` : line
        );

        // 添加陣列括號
        setOutputText(`[\n${formattedLines.join("\n")}\n]`);
      } else {
        setOutputText("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "處理過程發生錯誤");
      setOutputText("");
    }
  };

  const handleDownload = () => {
    if (!outputText) return;

    const element = document.createElement("a");
    const file = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(`${file.name.split(".")[0]}_converted.txt`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
  };

  return (
    <main className="min-h-screen p-8 bg-[#1E1E1E] text-white">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-2xl font-bold">字串陣列轉換器</h1>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 transition-colors ml-auto"
            aria-label="顯示使用說明"
            tabIndex={0}
          >
            <HelpCircle size={16} />
          </button>
        </div>

        {showHelp && (
          <div className="mb-6 p-4 bg-[#2D2D2D] rounded-lg border border-gray-700">
            <h2 className="text-lg font-semibold mb-2">使用說明</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>此工具可將一般文字轉換為完整的字串陣列格式</li>
              <li>每行文字會被轉換為一個獨立的字串，並添加雙引號</li>
              <li>
                輸出結果會自動添加陣列括號 [ ] 與適當的縮排，可直接用於程式碼中
              </li>
              <li>
                可以直接在左側編輯器中輸入文字，或上傳 .txt、.md、.csv 等文件
              </li>
              <li>輸入內容後會自動進行轉換，結果顯示在右側編輯器中</li>
              <li>可以自定義輸出檔案名稱，並下載轉換後的結果</li>
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">輸入文字</h2>
              <div className="flex gap-2">
                <label className="flex items-center gap-2 px-3 py-1.5 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-cyan-400 rounded-lg cursor-pointer transition-colors">
                  <FileText size={16} />
                  <span className="text-sm">上傳檔案</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".txt,.md,.csv"
                  />
                </label>
              </div>
            </div>
            <div className="border border-gray-700 rounded-lg overflow-hidden h-[400px]">
              <Editor
                height="100%"
                defaultLanguage="plaintext"
                value={inputText}
                onChange={(value) => setInputText(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  fontSize: 14,
                  fontFamily: "monospace",
                  padding: { top: 8 },
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">輸出結果</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  disabled={!outputText}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-cyan-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download size={16} />
                  <span className="text-sm">下載結果</span>
                </button>
              </div>
            </div>
            <div className="border border-gray-700 rounded-lg overflow-hidden h-[400px]">
              <Editor
                height="100%"
                defaultLanguage="typescript"
                value={outputText}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  fontSize: 14,
                  fontFamily: "monospace",
                  padding: { top: 8 },
                }}
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="file-name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                檔案名稱
              </label>
              <input
                id="file-name"
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full p-2 border border-gray-700 rounded-lg bg-[#2d2d2d] text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400 mt-8">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
