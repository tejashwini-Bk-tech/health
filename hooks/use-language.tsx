"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import en from "@/lib/i18n/en.json"
import as from "@/lib/i18n/as.json"
import mni from "@/lib/i18n/mni.json"
import kha from "@/lib/i18n/kha.json"
import brx from "@/lib/i18n/brx.json"

type Language = "en" | "as" | "mni" | "kha" | "brx"

const dictionaries = {
  en,
  as,
  mni,
  kha,
  brx,
}

// Map dictionary type from English as the base
export type Dictionary = typeof en

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Dictionary
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    // Load from local storage on mount
    const saved = localStorage.getItem("app_language") as Language
    if (saved && Object.keys(dictionaries).includes(saved)) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("app_language", lang)
  }

  const t = dictionaries[language]

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
