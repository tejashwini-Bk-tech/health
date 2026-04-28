"use client"

import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { BottomNav } from "@/components/BottomNav"
import HygieneQuest from "@/components/HygieneQuest"

export default function LearnPage() {
  return (
    <div className="min-h-screen mesh-bg pb-24">
      <Navbar userName="Rahul" role="user" />
      <main className="mx-auto max-w-lg px-0 py-2">
        <HygieneQuest />
      </main>
      <BottomNav />
    </div>
  )
}
