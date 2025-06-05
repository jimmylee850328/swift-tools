"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Copy, HelpCircle, RefreshCw } from "lucide-react";
import Editor from "@monaco-editor/react";

type DiffMode = "onlyInFirst" | "onlyInSecond" | "both";
type OutputMode = "auto" | "number" | "string";

export default function ArrayDiff(): JSX.Element {
  const [firstArray, setFirstArray] = useState<string>("");
  const [secondArray, setSecondArray] = useState<string>("");
  const [resultArray, setResultArray] = useState<string>("");
  const [diffMode, setDiffMode] = useState<DiffMode>("onlyInFirst");
  const [outputMode, setOutputMode] = useState<OutputMode>("auto");
  const [error, setError] = useState<string>("");
  const [fileName, setFileName] = useState<string>("array_diff.txt");
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  useEffect(() => {
    handleDiff();
  }, [firstArray, secondArray, diffMode, outputMode]);

  // Parse input array, preserve string format to handle large numbers
  const parseInputArray = (input: string): string[] => {
    if (!input.trim()) return [];

    try {
      const trimmedInput = input.trim();
      const jsonString =
        trimmedInput.startsWith("[") && trimmedInput.endsWith("]")
          ? trimmedInput
          : `[${trimmedInput}]`;

      // Preprocessing: Convert all numbers to string format to maintain precision
      const preprocessedJson = jsonString.replace(
        /(\[|,|\s+)(\d+)(\s*[,\]])/g,
        (match, prefix, number, suffix) => `${prefix}"${number}"${suffix}`
      );

      const parsedArray = JSON.parse(preprocessedJson);
      return parsedArray.map((item: unknown) => String(item));
    } catch {
      // Error handling: Split input and clean
      return input
        .split(/[,\n]/)
        .map((item: string) => item.trim())
        .filter((item: string) => item !== "");
    }
  };

  // Format output result
  const formatOutput = (items: string[]): string => {
    if (items.length === 0) return "[]";

    // Check if all items are in number format
    const allNumbers = items.every((item: string) => {
      const cleaned = item.replace(/^"|"$/g, "");
      return /^-?\d+(\.\d+)?$/.test(cleaned);
    });

    const processedItems = items;

    if (outputMode === "string" || (outputMode === "auto" && !allNumbers)) {
      // String format
      return JSON.stringify(processedItems, null, 2);
    }

    if (outputMode === "number" || (outputMode === "auto" && allNumbers)) {
      // Number format: Manually construct JSON to ensure large numbers are not truncated
      const cleanedItems = items.map((item: string) =>
        item.replace(/^"|"$/g, "")
      );
      const jsonLines = cleanedItems.map(
        (item: string, index: number) =>
          `  ${item}${index < cleanedItems.length - 1 ? "," : ""}`
      );
      return `[\n${jsonLines.join("\n")}\n]`;
    }

    return JSON.stringify(processedItems, null, 2);
  };

  const handleDiff = (): void => {
    try {
      setError("");
      setCopySuccess(false);

      const array1 = parseInputArray(firstArray);
      const array2 = parseInputArray(secondArray);
      const set1 = new Set(array1);
      const set2 = new Set(array2);

      let diffResult: string[] = [];

      switch (diffMode) {
        case "onlyInFirst":
          diffResult = array1.filter((item: string) => !set2.has(item));
          break;
        case "onlyInSecond":
          diffResult = array2.filter((item: string) => !set1.has(item));
          break;
        case "both":
          diffResult = [
            ...array1.filter((item: string) => !set2.has(item)),
            ...array2.filter((item: string) => !set1.has(item)),
          ];
          break;
      }

      setResultArray(formatOutput(diffResult));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during processing"
      );
      setResultArray("");
    }
  };

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
      () => setError("Failed to copy to clipboard")
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
          <h1 className="text-2xl font-bold">陣列差異比較工具</h1>
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
              <li>比較兩個陣列的差異，找出僅在其中一個陣列中存在的元素</li>
              <li>支援多種輸入格式：JSON 陣列、逗號分隔值或逐行輸入</li>
              <li>特別支援超大數字的比較，確保不會有精度問題</li>
              <li>可選擇差異模式：僅第一個陣列、僅第二個陣列或兩者差異</li>
              <li>可選擇輸出格式：自動判斷、數字或字串格式</li>
              <li>結果以 JSON 陣列格式呈現，可複製或下載</li>
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

        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={handleDiff}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-cyan-400 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            <span className="text-sm">重新計算差異</span>
          </button>

          <div className="flex items-center">
            <label className="text-sm mr-2">差異模式：</label>
            <select
              value={diffMode}
              onChange={(e) => setDiffMode(e.target.value as DiffMode)}
              className="bg-[#2D2D2D] border border-gray-700 rounded px-2 py-1 text-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="onlyInFirst">僅顯示第一個陣列獨有元素</option>
              <option value="onlyInSecond">僅顯示第二個陣列獨有元素</option>
              <option value="both">顯示兩者不同的元素</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="text-sm mr-2">輸出格式：</label>
            <select
              value={outputMode}
              onChange={(e) => setOutputMode(e.target.value as OutputMode)}
              className="bg-[#2D2D2D] border border-gray-700 rounded px-2 py-1 text-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="auto">自動判斷</option>
              <option value="number">數字格式</option>
              <option value="string">字串格式</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">比較結果</h2>
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
