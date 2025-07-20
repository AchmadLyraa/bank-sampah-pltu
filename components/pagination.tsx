"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
}

export default function Pagination({ currentPage, totalPages, totalItems }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 🔗 Create URL with page parameter
  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  // 📄 Generate page numbers to show
  const getVisiblePages = () => {
    const delta = 2 // Show 2 pages before and after current page
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) return null

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-between px-2">
      {/* Info */}
      <div className="flex-1 flex justify-between sm:hidden">
        <div className="text-sm text-gray-700">
          Halaman {currentPage} dari {totalPages}
        </div>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Menampilkan <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> sampai{" "}
            <span className="font-medium">{Math.min(currentPage * 20, totalItems)}</span> dari{" "}
            <span className="font-medium">{totalItems}</span> transaksi
          </p>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center space-x-2">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            asChild={currentPage > 1}
            disabled={currentPage <= 1}
            className={cn(currentPage <= 1 && "opacity-50 cursor-not-allowed")}
          >
            {currentPage > 1 ? (
              <Link href={createPageURL(currentPage - 1)} className="flex items-center">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Link>
            ) : (
              <span className="flex items-center">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </span>
            )}
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {visiblePages.map((page, index) => {
              if (page === "...") {
                return (
                  <span key={`dots-${index}`} className="px-3 py-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                )
              }

              const pageNumber = page as number
              const isActive = pageNumber === currentPage

              return (
                <Button
                  key={pageNumber}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  asChild={!isActive}
                  disabled={isActive}
                  className={cn("min-w-[40px]", isActive && "bg-blue-600 hover:bg-blue-700")}
                >
                  {isActive ? <span>{pageNumber}</span> : <Link href={createPageURL(pageNumber)}>{pageNumber}</Link>}
                </Button>
              )
            })}
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            asChild={currentPage < totalPages}
            disabled={currentPage >= totalPages}
            className={cn(currentPage >= totalPages && "opacity-50 cursor-not-allowed")}
          >
            {currentPage < totalPages ? (
              <Link href={createPageURL(currentPage + 1)} className="flex items-center">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            ) : (
              <span className="flex items-center">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Pagination */}
      <div className="flex sm:hidden space-x-2">
        <Button variant="outline" size="sm" asChild={currentPage > 1} disabled={currentPage <= 1}>
          {currentPage > 1 ? (
            <Link href={createPageURL(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span>
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}
        </Button>

        <Button variant="outline" size="sm" asChild={currentPage < totalPages} disabled={currentPage >= totalPages}>
          {currentPage < totalPages ? (
            <Link href={createPageURL(currentPage + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span>
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
