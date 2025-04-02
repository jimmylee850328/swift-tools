"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Copy, HelpCircle, RefreshCw } from "lucide-react";
import Editor from "@monaco-editor/react";

/**
 * Array Merger component that allows users to merge two arrays with options
 * @returns {JSX.Element} The rendered Array Merger page
 */
export default function ArrayMerger() {
  const [firstArray, setFirstArray] = useState("");
  const [secondArray, setSecondArray] = useState("");
  const [resultArray, setResultArray] = useState("");
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("merged_array.txt");
  const [showHelp, setShowHelp] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    handleMerge();
  }, [firstArray, secondArray, removeDuplicates]);

  const handleMerge = () => {
    try {
      setError("");
      setCopySuccess(false);

      // 解析第一個陣列
      let array1: string[] = [];
      if (firstArray.trim()) {
        try {
          // 嘗試使用 JSON.parse 解析
          const trimmedInput = firstArray.trim();
          const jsonString =
            trimmedInput.startsWith("[") && trimmedInput.endsWith("]")
              ? trimmedInput
              : `[${trimmedInput}]`;
          array1 = JSON.parse(jsonString);
        } catch {
          // 如果 JSON.parse 失敗，嘗試使用逗號分隔
          array1 = firstArray
            .split(/[,\n]/)
            .map((item) => item.trim())
            .filter((item) => item !== "");
        }
      }

      // 解析第二個陣列
      let array2: string[] = [];
      if (secondArray.trim()) {
        try {
          // 嘗試使用 JSON.parse 解析
          const trimmedInput = secondArray.trim();
          const jsonString =
            trimmedInput.startsWith("[") && trimmedInput.endsWith("]")
              ? trimmedInput
              : `[${trimmedInput}]`;
          array2 = JSON.parse(jsonString);
        } catch {
          // 如果 JSON.parse 失敗，嘗試使用逗號分隔
          array2 = secondArray
            .split(/[,\n]/)
            .map((item) => item.trim())
            .filter((item) => item !== "");
        }
      }

      // 合併陣列
      let mergedArray = [...array1, ...array2];

      // 如果選擇去重，則過濾重複項
      if (removeDuplicates) {
        mergedArray = Array.from(new Set(mergedArray));
      }

      // 格式化為 JSON 字串
      if (mergedArray.length > 0) {
        const formattedArray = JSON.stringify(mergedArray, null, 2);
        setResultArray(formattedArray);
      } else {
        setResultArray("[]");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "處理過程發生錯誤");
      setResultArray("");
    }
  };

  const handleDownload = () => {
    if (!resultArray) return;

    const element = document.createElement("a");
    const file = new Blob([resultArray], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    if (!resultArray) return;

    navigator.clipboard.writeText(resultArray).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      },
      () => {
        setError("複製到剪貼簿失敗");
      }
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
          <h1 className="text-2xl font-bold">陣列合併工具</h1>
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
              <li>此工具可將兩個陣列合併成一個新的陣列</li>
              <li>
                支援多種輸入格式，如 [&quot;a&quot;, &quot;b&quot;,
                &quot;c&quot;] 或 a, b, c 或逐行輸入
              </li>
              <li>可以選擇是否移除合併後的重複項目</li>
              <li>合併結果將以 JSON 格式呈現</li>
              <li>可以複製結果或以自訂檔名下載</li>
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">第一個陣列</h2>
            <div className="border border-gray-700 rounded-lg overflow-hidden h-[250px]">
              <Editor
                height="100%"
                defaultLanguage="plaintext"
                value={firstArray}
                onChange={(value) => setFirstArray(value || "")}
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
            <h2 className="text-xl font-semibold mb-4">第二個陣列</h2>
            <div className="border border-gray-700 rounded-lg overflow-hidden h-[250px]">
              <Editor
                height="100%"
                defaultLanguage="plaintext"
                value={secondArray}
                onChange={(value) => setSecondArray(value || "")}
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
        </div>

        <div className="mb-6">
          <button
            onClick={handleMerge}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-cyan-400 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            <span className="text-sm">重新合併</span>
          </button>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">合併結果</h2>
              <label className="flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={removeDuplicates}
                  onChange={(e) => setRemoveDuplicates(e.target.checked)}
                  className="w-4 h-4 text-cyan-500 bg-[#2D2D2D] border-gray-700 rounded focus:ring-cyan-500 focus:ring-opacity-25"
                />
                <span className="ml-2 text-sm font-medium text-gray-200">
                  移除重複項目
                </span>
              </label>
            </div>
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

        {error && (
          <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400 mt-8">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
