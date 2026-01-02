import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    hasNext,
    hasPrev
}) => {
    // If totalPages is not provided, we rely on hasNext/hasPrev
    // If totalPages is provided, we can render page numbers (simplified version for now)

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="flex-1 flex justify-between sm:hidden">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!hasPrev && currentPage <= 1}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!hasNext && (totalPages ? currentPage >= totalPages : false)}
                >
                    Next
                </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-slate-700">
                        Halaman <span className="font-medium">{currentPage}</span>
                        {totalPages && (
                            <> dari <span className="font-medium">{totalPages}</span></>
                        )}
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-l-md rounded-r-none"
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1}
                        >
                            <span className="sr-only">First</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-none"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={!hasPrev && currentPage <= 1}
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Current Page Indicator */}
                        <div className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-primary-700 hover:bg-slate-50">
                            {currentPage}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-none"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={!hasNext && (totalPages ? currentPage >= totalPages : false)}
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-r-md rounded-l-none"
                            onClick={() => onPageChange(totalPages || currentPage + 1)} // If totalPages unknown, just go next 
                            disabled={!totalPages || currentPage >= totalPages}
                        >
                            <span className="sr-only">Last</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
