"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Copy, HelpCircle, RefreshCw } from "lucide-react";
import Editor from "@monaco-editor/react";

export default function UrlProcessor() {
  const [urls, setUrls] = useState<string>("");
  const [parameterName, setParameterName] = useState<string>("sku");
  const [resultArray, setResultArray] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [fileName, setFileName] = useState<string>("url_processed.txt");
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const handleUrlProcessing = useCallback((): void => {
    const processUrls = (urlArray: string[], paramName: string): string[] => {
      const seen = new Set();
      const result: string[] = [];

      for (const url of urlArray) {
        try {
          const urlObj = new URL(url);
          const baseUrl = `${urlObj.origin}${urlObj.pathname}?${paramName}=`;

          if (!seen.has(baseUrl)) {
            seen.add(baseUrl);

            const searchParams = urlObj.search;
            const paramRegex = new RegExp(`[?&]${paramName}=([^&]*)`);
            const match = searchParams.match(paramRegex);
            if (match) {
              const paramValue = decodeURIComponent(match[1]);
              const trimmedValue = paramValue.trim();
              result.push(trimmedValue);
            }
          }
        } catch {
          console.warn(`無法解析 URL: ${url}`);
        }
      }

      return result;
    };
    try {
      setError("");
      setCopySuccess(false);

      if (!urls.trim()) {
        setResultArray("");
        return;
      }

      let urlArray: string[] = [];
      const trimmedInput = urls.trim();

      try {
        if (trimmedInput.startsWith("[") && trimmedInput.endsWith("]")) {
          urlArray = JSON.parse(trimmedInput);
        } else {
          urlArray = trimmedInput
            .split(/[,\n]/)
            .filter((url: string) => url !== "");
        }
      } catch {
        urlArray = trimmedInput
          .split(/[,\n]/)
          .filter((url: string) => url !== "");
      }

      if (urlArray.length === 0) {
        setResultArray("[]");
        return;
      }

      const processedValues = processUrls(urlArray, parameterName);
      const formattedResult = JSON.stringify(processedValues, null, 2);
      setResultArray(formattedResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "處理 URL 時發生錯誤");
      setResultArray("");
    }
  }, [urls, parameterName]);

  useEffect(() => {
    handleUrlProcessing();
  }, [urls, parameterName, handleUrlProcessing]);

  const handleDownload = (): void => {
    if (!resultArray) return;
    const element = document.createElement("a");
    const file = new Blob([resultArray], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = (): void => {
    if (!resultArray) return;
    navigator.clipboard.writeText(resultArray).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      },
      () => setError("複製到剪貼簿失敗")
    );
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
          <h1 className="text-2xl font-bold">URL 參數提取工具</h1>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 transition-colors ml-auto"
          >
            <HelpCircle size={16} />
          </button>
        </div>

        {showHelp && (
          <div className="mb-6 p-4 bg-[#2D2D2D] rounded-lg border border-gray-700">
            <h2 className="text-lg font-semibold mb-2">使用說明</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>此工具可以從 URL 陣列中提取指定參數的值</li>
              <li>
                支援多種輸入格式：JSON 陣列格式 [&quot;url1&quot;,
                &quot;url2&quot;] 或逗號分隔或逐行輸入 URL
              </li>
              <li>可以自定義要提取的參數名稱（預設為 sku）</li>
              <li>自動去除重複的 URL 前綴，只保留唯一的參數值</li>
              <li>提取的參數值會自動進行 trim() 處理</li>
              <li>結果以 JSON 陣列格式呈現，可複製或下載</li>
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">URL 陣列</h2>
            <div className="border border-gray-700 rounded-lg overflow-hidden h-[300px]">
              <Editor
                height="100%"
                defaultLanguage="plaintext"
                value={urls}
                onChange={(value) => setUrls(value || "")}
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
            <h2 className="text-xl font-semibold mb-4">提取結果</h2>
            <div className="border border-gray-700 rounded-lg overflow-hidden h-[300px]">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={resultArray}
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
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={handleUrlProcessing}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-cyan-400 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            <span className="text-sm">重新處理</span>
          </button>

          <div className="flex items-center">
            <label className="text-sm mr-2">參數名稱：</label>
            <input
              type="text"
              value={parameterName}
              onChange={(e) => setParameterName(e.target.value)}
              className="bg-[#2D2D2D] border border-gray-700 rounded px-2 py-1 text-sm text-white focus:ring-cyan-500 focus:border-cyan-500 w-24"
              placeholder="sku"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">處理結果</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!resultArray}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-cyan-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Copy size={16} />
                <span className="text-sm">
                  {copySuccess ? "已複製！" : "複製結果"}
                </span>
              </button>
              <button
                onClick={handleDownload}
                disabled={!resultArray}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-cyan-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download size={16} />
                <span className="text-sm">下載結果</span>
              </button>
            </div>
          </div>
          <div className="border border-gray-700 rounded-lg overflow-hidden h-[250px]">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={resultArray}
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              檔案名稱
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full p-2 border border-gray-700 rounded-lg bg-[#2d2d2d] text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
            />
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
