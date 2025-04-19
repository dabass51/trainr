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
import { Eye, Activity, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { ActivityType } from '@prisma/client';

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

interface Activity {
    id: string;
    name: string;
    activityType: ActivityType;
    duration: number;
    distance: number | null;
    startTime: string;
    description?: string;
}

interface TrainingUnitsListProps {
    units: TrainingUnit[];
    activities: Activity[];
    onComplete: (id: string, completed: boolean) => void;
    onDelete: (id: string) => void;
    onDeleteAll: () => void;
    onDeleteAllActivities: () => void;
}

const ITEMS_PER_PAGE = 8;

const TrainingUnitsList: React.FC<TrainingUnitsListProps> = ({ units, activities, onComplete, onDelete, onDeleteAll, onDeleteAllActivities }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [unitToDelete, setUnitToDelete] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
    const [showDeleteAllActivitiesDialog, setShowDeleteAllActivitiesDialog] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<TrainingUnit | null>(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    
    // Sort units by date (earliest first)
    const sortedUnits = [...units].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate pagination values
    const totalPages = Math.ceil(sortedUnits.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentUnits = sortedUnits.slice(startIndex, endIndex);

    // Get activities for a specific date
    const getActivitiesForDate = (date: string) => {
        console.log('Checking activities for date:', date);
        console.log('All activities:', activities);
        
        const trainingUnitDate = new Date(date).toISOString().split('T')[0];
        const matchingActivities = activities.filter(activity => {
            const activityDate = new Date(activity.startTime).toISOString().split('T')[0];
            console.log('Activity date:', activityDate, 'Training unit date:', trainingUnitDate);
            return activityDate === trainingUnitDate;
        });
        
        console.log('Matching activities:', matchingActivities);
        return matchingActivities;
    };

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

    const handleDeleteAllActivities = () => {
        onDeleteAllActivities();
        setShowDeleteAllActivitiesDialog(false);
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        const totalPagesArr = Array.from({ length: totalPages }, (_, i) => i + 1);
        if (totalPages <= maxVisiblePages) {
            return totalPagesArr;
        }
        const current = currentPage;
        let startPage = Math.max(current - 1, 2);
        let endPage = Math.min(current + 1, totalPages - 1);
        if (current === 1) {
            endPage = 3;
        }
        if (current === totalPages) {
            startPage = totalPages - 2;
        }
        const pageNumbers = [1];
        if (startPage > 2) {
            pageNumbers.push('ellipsis-start');
        }
        for (let i = startPage; i <= endPage; i++) {
            if (i > 1 && i < totalPages) {
                pageNumbers.push(i);
            }
        }
        if (endPage < totalPages - 1) {
            pageNumbers.push('ellipsis-end');
        }
        if (totalPages > 1) {
            pageNumbers.push(totalPages);
        }
        return pageNumbers;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Training Units</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowDeleteAllActivitiesDialog(true)}>
                        Delete All Activities
                    </Button>
                    <Button variant="outline" onClick={() => setShowDeleteAllDialog(true)}>
                        Delete All Units
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentUnits.map((unit) => {
                    const unitActivities = getActivitiesForDate(unit.date);
                    return (
                        <div key={unit.id} className="border rounded-lg p-4 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold">{unit.type}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(unit.date).toLocaleDateString()}
                                    </p>
                                    {unit.description && (
                                        <p className="text-sm mt-1 text-gray-700">
                                            {unit.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleViewDetail(unit)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteClick(unit.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {unitActivities.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Activities</h4>
                                    {unitActivities.map((activity) => (
                                        <div key={activity.id} className="flex flex-col gap-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Activity className="h-4 w-4" />
                                                <span className="font-medium">{activity.name}</span>
                                                <span className="text-muted-foreground">
                                                    ({Math.round(activity.duration / 60)} min)
                                                </span>
                                            </div>
                                            {activity.description && (
                                                <p className="text-muted-foreground text-xs pl-6">
                                                    {activity.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <Button
                                    variant={unit.completed ? "default" : "outline"}
                                    onClick={() => onComplete(unit.id, !unit.completed)}
                                >
                                    {unit.completed ? "Completed" : "Mark as Complete"}
                                </Button>
                            </div>
                        </div>
                    );
                })}
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
                        {getPageNumbers().map((pageNum, idx) => {
                            if (typeof pageNum === 'string') {
                                return (
                                    <PaginationItem key={pageNum + idx}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                );
                            }
                            return (
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
                            );
                        })}
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

            {/* Delete All Activities Dialog */}
            <Dialog open={showDeleteAllActivitiesDialog} onOpenChange={setShowDeleteAllActivitiesDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete All Activities</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete all activities? This action cannot be undone and will remove all your activity data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteAllActivitiesDialog(false)}
                        >
                            No, Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAllActivities}
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
