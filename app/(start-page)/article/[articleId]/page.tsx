"use client"

import { useParams } from "next/navigation"
import { Header } from "@/components/start-page/header"
import { Footer } from "@/components/start-page/footer"
import Article1 from "@/components/start-page/article1"
import Article2 from "@/components/start-page/article2"
import { notFound } from "next/navigation"

export default function ArticlePage() {
  const params = useParams()
  const articleId = params.articleId as string

  // W zależności od ID artykułu, renderuj odpowiedni komponent
  const renderArticle = () => {
    switch (articleId) {
      case "art1":
        return <Article1 />
      case "art2":
        return <Article2 />
      default:
        notFound()
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-[#0A0F1C]">
      <Header />
      {renderArticle()}
      <Footer />
    </main>
  )
} 