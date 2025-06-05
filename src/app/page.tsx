"use client";

import Link from "next/link";
import { KeyIcon, ListIcon, LayersIcon, Diff } from "lucide-react";

/**
 * Tool card component for displaying available tools
 */
const ToolCard = ({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}) => {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-2 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:border-cyan-400 dark:hover:border-cyan-500"
      aria-label={`前往 ${title} 工具`}
      tabIndex={0}
    >
      <div className="p-2 w-12 h-12 flex items-center justify-center bg-cyan-100 dark:bg-cyan-900 rounded-lg text-cyan-600 dark:text-cyan-400 mb-2 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800 transition-colors">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </Link>
  );
};

/**
 * Home page component that displays a collection of utility tools
 * @returns {JSX.Element} The rendered home page
 */
export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
            Swift Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            簡單好用的網頁工具集，提供各種實用功能，輕鬆提升您的工作效率。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ToolCard
            title="JWT 解碼器"
            description="輕鬆解碼和驗證 JSON Web Tokens (JWT)，查看令牌中包含的所有信息。"
            icon={<KeyIcon className="w-6 h-6" />}
            href="/tools/jwt-decoder"
          />
          <ToolCard
            title="字串陣列轉換器"
            description="將文本檔案中的每一行轉換為帶引號的字串陣列格式，適用於程式碼開發。"
            icon={<ListIcon className="w-6 h-6" />}
            href="/tools/string-converter"
          />
          <ToolCard
            title="陣列合併工具"
            description="合併兩個陣列，支援自訂是否去除重複項目，並提供複製與下載功能。"
            icon={<LayersIcon className="w-6 h-6" />}
            href="/tools/array-merger"
          />
          <ToolCard
            title="陣列差異比較工具"
            description="比較兩個陣列的差異，找出獨有元素，支援超大數字並提供多種比較模式。"
            icon={<Diff className="w-6 h-6" />}
            href="/tools/array-diff"
          />
          {/* 未來可以在這裡添加更多工具卡片 */}
        </div>
      </div>
    </main>
  );
}
