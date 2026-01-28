"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/textarea";

interface OutcomeReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    plantName: string;
    onConfirm: (data: any) => Promise<void>;
}

export default function OutcomeReportModal({ isOpen, onClose, plantName, onConfirm }: OutcomeReportModalProps) {
    const [outcomeType, setOutcomeType] = useState<string>("");
    const [confidence, setConfidence] = useState<string>("medium");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!outcomeType) return;
        setLoading(true);
        try {
            await onConfirm({ outcomeType, confidence, notes });
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Conclude Care Cycle</DialogTitle>
                    <DialogDescription>
                        Finalize records for <strong>{plantName}</strong>. This will archive the plant and generate a history report.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="outcome" className="text-right">
                            Outcome
                        </Label>
                        <Select onValueChange={setOutcomeType} value={outcomeType}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select outcome..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="success">Success / Thriving</SelectItem>
                                <SelectItem value="dead">Dead / Failed</SelectItem>
                                <SelectItem value="customer_complaint">Customer Complaint</SelectItem>
                                <SelectItem value="cold_damage">Cold Damage</SelectItem>
                                <SelectItem value="heat_damage">Heat Damage</SelectItem>
                                <SelectItem value="root_rot">Root Rot</SelectItem>
                                <SelectItem value="pest_damage">Pest Damage</SelectItem>
                                <SelectItem value="returned">Returned to Store</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="confidence" className="text-right">
                            Confidence
                        </Label>
                        <Select onValueChange={setConfidence} value={confidence}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Level of certainty..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="high">High (Certain)</SelectItem>
                                <SelectItem value="medium">Medium (Likely)</SelectItem>
                                <SelectItem value="low">Low (Guess)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Describe what happened (e.g. 'Leaves turned brown after frost')..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!outcomeType || loading} className="bg-red-600 hover:bg-red-700 text-white">
                        {loading ? "Archiving..." : "Conclude & Archive"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
