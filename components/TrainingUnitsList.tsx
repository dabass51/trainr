import React, { useState } from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TrainingUnitDetail from './TrainingUnitDetail';
import { Eye } from 'lucide-react';
import Link from 'next/link';

interface TrainingUnit {
    id: string;
    type: string;
    description: string;
    instruction: string;
    duration: number;
    intensity: string;
    date: string;
    completed: boolean;
    isEvent?: boolean;
    eventName?: string;
    eventLocation?: string;
    eventUrl?: string;
}

interface TrainingUnitsListProps {
    units: TrainingUnit[];
    onComplete: (id: string, completed: boolean) => void;
    onDelete: (id: string) => void;
    onDeleteAll: () => void;
}

const ITEMS_PER_PAGE = 8;

const TrainingUnitsList: React.FC<TrainingUnitsListProps> = ({ units, onComplete, onDelete, onDeleteAll }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [unitToDelete, setUnitToDelete] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<TrainingUnit | null>(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    
    // Sort units by date (earliest first)
    const sortedUnits = [...units].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate pagination values
    const totalPages = Math.ceil(sortedUnits.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentUnits = sortedUnits.slice(startIndex, endIndex);

    const handleDeleteClick = (id: string) => {
        setUnitToDelete(id);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (unitToDelete) {
            onDelete(unitToDelete);
            setShowDeleteDialog(false);
            setUnitToDelete(null);
        }
    };

    const handleViewDetail = (unit: TrainingUnit) => {
        setSelectedUnit(unit);
        setShowDetailDialog(true);
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        const halfVisible = Math.floor(maxVisiblePages / 2);
        
        let startPage = Math.max(currentPage - halfVisible, 1);
        let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(endPage - maxVisiblePages + 1, 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        return pages;
    };

    return (
        <div className="space-y-6">
            {units.length > 0 ? (
                <>
                    <div className="flex justify-end">
                        <Button
                            variant="destructive"
                            onClick={() => setShowDeleteAllDialog(true)}
                            className="mb-4"
                        >
                            Delete All Training Units
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {currentUnits.map((unit) => (
                            <div
                                key={unit.id}
                                className={`border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 ${
                                    unit.isEvent ? 'bg-amber-50 border-amber-200' : unit.completed ? 'bg-green-50 border-green-200' : ''
                                }`}
                            >
                                <h3 className="font-bold text-lg mb-2">
                                    {unit.isEvent ? '🎉 ' : ''}{unit.isEvent ? unit.eventName : unit.type}
                                </h3>
                                <p className="text-sm mb-1">{unit.description}</p>
                                {!unit.isEvent ? (
                                    <>
                                        <p className="text-sm mb-1">Duration: {unit.duration} minutes</p>
                                        <p className="text-sm mb-1">Instruction: {unit.instruction}</p>
                                        <p className="text-sm mb-1">Intensity: {unit.intensity}</p>
                                    </>
                                ) : (
                                    <>
                                        {unit.eventLocation && (
                                            <p className="text-sm mb-1">Location: {unit.eventLocation}</p>
                                        )}
                                        {unit.eventUrl && (
                                            <a 
                                                href={unit.eventUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm mb-1 text-blue-600 hover:text-blue-800 underline block"
                                            >
                                                Event Details
                                            </a>
                                        )}
                                    </>
                                )}
                                <p className="text-sm mb-1">Date: {new Date(unit.date).toLocaleDateString()}</p>
                                {!unit.isEvent && (
                                    <p className="text-sm mb-3">Status: {unit.completed ? 'Completed' : 'Pending'}</p>
                                )}
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2">
                                        {!unit.isEvent && (
                                            unit.completed ? (
                                                <button
                                                    onClick={() => onComplete(unit.id, false)}
                                                    className="py-1 px-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors duration-200"
                                                >
                                                    Uncomplete
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onComplete(unit.id, true)}
                                                    className="py-1 px-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors duration-200"
                                                >
                                                    Complete
                                                </button>
                                            )
                                        )}
                                        <Link
                                            href={`/training-units/${unit.id}`}
                                            className="py-1 px-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors duration-200 flex items-center gap-1"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Link>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteClick(unit.id)}
                                        className="py-1 px-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors duration-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        href="#" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                                        }}
                                        aria-disabled={currentPage === 1}
                                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                
                                {getPageNumbers().map((pageNum) => (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setCurrentPage(pageNum);
                                            }}
                                            isActive={currentPage === pageNum}
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext 
                                        href="#" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                                        }}
                                        aria-disabled={currentPage === totalPages}
                                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        No Training Units Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Create your first training unit to get started
                    </p>
                </div>
            )}

            {/* Delete Single Unit Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Training Unit</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this training unit? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            No, Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                        >
                            Yes, Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete All Units Dialog */}
            <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete All Training Units</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete all training units? This action cannot be undone and will remove all your training data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteAllDialog(false)}
                        >
                            No, Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                onDeleteAll();
                                setShowDeleteAllDialog(false);
                            }}
                        >
                            Yes, Delete All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Training Unit Detail Dialog */}
            <TrainingUnitDetail
                unit={selectedUnit}
                isOpen={showDetailDialog}
                onClose={() => {
                    setShowDetailDialog(false);
                    setSelectedUnit(null);
                }}
                onComplete={onComplete}
            />
        </div>
    );
};

export default TrainingUnitsList;
