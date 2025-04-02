"use client";

import React, { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Editor from "@monaco-editor/react";

interface JWTHeader {
  alg: string;
  typ: string;
  [key: string]: string;
}

interface JWTPayload {
  token_type?: string;
  exp?: number;
  iat?: number;
  jti?: string;
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string[];
  [key: string]: string | number | string[] | undefined;
}

interface DecodedJWT {
  header: JWTHeader;
  payload: JWTPayload;
}

interface ExplanationItem {
  field: string;
  value: string;
  explanation: string;
}

/**
 * JWT Decoder component that allows users to decode JWT tokens
 * @returns {JSX.Element} The rendered JWT Decoder page
 */
export default function JWTDecoder() {
  const [token, setToken] = useState("");
  const [decodedToken, setDecodedToken] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    handleDecode();
  }, [token]);

  const handleDecode = () => {
    try {
      setError("");
      if (!token.trim()) {
        setDecodedToken(null);
        return;
      }

      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("無效的 JWT Token 格式");
      }

      const decoded: DecodedJWT = {
        header: JSON.parse(atob(parts[0])),
        payload: JSON.parse(atob(parts[1])),
      };

      setDecodedToken(decoded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "解碼過程發生錯誤");
      setDecodedToken(null);
    }
  };

  const formatValue = (
    value: string | number | string[] | undefined
  ): string => {
    if (Array.isArray(value)) {
      return `[${value.join(", ")}]`;
    }
    if (typeof value === "number" && value > 1000000000) {
      return new Date(value * 1000).toISOString();
    }
    return String(value || "");
  };

  const getExplanations = (
    data: JWTHeader | JWTPayload,
    type: "header" | "payload"
  ): ExplanationItem[] => {
    if (type === "header") {
      return [
        {
          field: "alg",
          value: String(data.alg || ""),
          explanation: "the algorithm used for signing the JWT",
        },
        {
          field: "typ",
          value: String(data.typ || ""),
          explanation: 'always set to "JWT"',
        },
      ];
    }

    const payload = data as JWTPayload;
    return [
      {
        field: "token_type",
        value: String(payload.token_type || ""),
        explanation: "",
      },
      {
        field: "exp",
        value: formatValue(payload.exp),
        explanation: "the expiration time after which JWT must not be accepted",
      },
      {
        field: "iat",
        value: formatValue(payload.iat),
        explanation: "the time at which the JWT was issued",
      },
      {
        field: "jti",
        value: String(payload.jti || ""),
        explanation:
          "unique identifier of the token even amont different issuers",
      },
      { field: "id", value: String(payload.id || ""), explanation: "" },
      { field: "email", value: String(payload.email || ""), explanation: "" },
      {
        field: "first_name",
        value: String(payload.first_name || ""),
        explanation: "",
      },
      {
        field: "last_name",
        value: String(payload.last_name || ""),
        explanation: "",
      },
      { field: "role", value: formatValue(payload.role), explanation: "" },
    ].filter((item) => item.value !== "");
  };

  return (
    <main className="min-h-screen p-8 bg-[#1E1E1E] text-white">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-2xl font-bold">JWT Decoder</h1>
        </div>

        <div className="mb-8">
          <label
            htmlFor="jwt-input"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            JWT Token
          </label>
          <textarea
            id="jwt-input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full h-24 p-3 border border-gray-700 rounded-lg bg-[#2d2d2d] text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono text-sm"
            placeholder="在此貼上您的 JWT Token..."
          />
        </div>

        {error && (
          <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400 mb-8">
            {error}
          </div>
        )}

        {decodedToken && (
          <div className="flex gap-8">
            <div className="flex-[2]">
              <h2 className="text-xl font-semibold mb-4">Decoded JWT</h2>
              <div className="border border-gray-700 rounded-lg overflow-hidden bg-[#2D2D2D] p-4 h-[calc(100%-2rem)]">
                <Editor
                  height="400px"
                  defaultLanguage="json"
                  value={JSON.stringify(decodedToken, null, 2)}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    folding: true,
                    foldingHighlight: true,
                    foldingStrategy: "auto",
                    showFoldingControls: "always",
                    lineNumbers: "off",
                    renderLineHighlight: "none",
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    fontFamily: "monospace",
                    domReadOnly: true,
                    padding: { top: 8 },
                  }}
                />
              </div>
            </div>

            <div className="flex-[1.5]">
              <h2 className="text-xl font-semibold mb-4">Explanation</h2>
              <div className="border border-gray-700 rounded-lg overflow-hidden h-[calc(100%-2rem)]">
                <table className="w-full border-collapse h-full">
                  <thead className="bg-[#2D2D2D] text-sm">
                    <tr>
                      <th className="text-left py-2.5 px-4 font-medium text-gray-400 w-[20%]">
                        Field
                      </th>
                      <th className="text-left py-2.5 px-4 font-medium text-gray-400 w-[40%]">
                        Value
                      </th>
                      <th className="text-left py-2.5 px-4 font-medium text-gray-400 w-[40%]">
                        Explanation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700 bg-[#1E1E1E]">
                    {[
                      ...getExplanations(decodedToken.header, "header"),
                      ...getExplanations(decodedToken.payload, "payload"),
                    ].map((item) => (
                      <tr
                        key={item.field}
                        className="text-sm hover:bg-[#2D2D2D] transition-colors"
                      >
                        <td className="py-2 px-4 font-mono text-[#4FC1FF]">
                          {item.field}
                        </td>
                        <td className="py-2 px-4 font-mono whitespace-pre-wrap break-all text-[#FFA657]">
                          {item.value}
                        </td>
                        <td className="py-2 px-4 text-gray-400">
                          {item.explanation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
