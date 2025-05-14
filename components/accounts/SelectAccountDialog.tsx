"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getAccounts } from "@/actions/accountActions";

interface Account {
  _id: string;
  userId: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  createdAt: number;
  updatedAt: number;
}

interface SelectAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onAccountSelected: (accountId: string) => void;
  amount?: number; // Optional amount for preview purposes
}

export function SelectAccountDialog({
  open,
  onClose,
  onAccountSelected,
  amount,
}: SelectAccountDialogProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load accounts when component mounts
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setIsLoading(true);
        const result = await getAccounts();
        
        if (result.success) {
          setAccounts(result.data || []);
          // Automatically select the first account if available
          if (result.data && result.data.length > 0) {
            setSelectedAccountId(result.data[0]._id);
          }
        } else {
          setError(result.error || "Failed to load accounts");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Error loading accounts:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (open) {
      loadAccounts();
    }
  }, [open]);

  const handleConfirm = () => {
    if (!selectedAccountId) {
      setError("Please select an account");
      return;
    }
    onAccountSelected(selectedAccountId);
  };

  const formatCurrency = (account: Account) => {
    return `${account.currency}${account.balance.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Find the selected account for display
  const selectedAccount = accounts.find(account => account._id === selectedAccountId);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-[#0d1117] text-white border-[#21262d]">
        <DialogHeader>
          <DialogTitle>Select Account for Receipt</DialogTitle>
          <DialogDescription className="text-gray-400">
            Please select which account this expense should be deducted from.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00b386]"></div>
          </div>
        ) : error ? (
          <div className="text-[#ff5252] text-sm py-4">{error}</div>
        ) : accounts.length === 0 ? (
          <div className="text-gray-400 py-4">
            You don't have any accounts. Please create an account first.
          </div>
        ) : (
          <div className="py-4">
            <div className="grid grid-cols-4 items-center gap-4 mb-4">
              <Label htmlFor="account" className="text-right text-white">
                Account
              </Label>
              <Select 
                value={selectedAccountId} 
                onValueChange={setSelectedAccountId}
              >
                <SelectTrigger className="col-span-3 bg-[#161b22] border-[#21262d] text-white">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-[#21262d] text-white">
                  {accounts.map((account) => (
                    <SelectItem key={account._id} value={account._id}>
                      {account.name} ({formatCurrency(account)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedAccount && amount && (
              <div className="bg-[#161b22] p-4 rounded-md mt-2">
                <div className="text-sm text-gray-400 mb-1">Transaction Preview</div>
                <div className="flex justify-between items-center">
                  <span>Current Balance:</span>
                  <span className="font-medium">{formatCurrency(selectedAccount)}</span>
                </div>
                <div className="flex justify-between items-center text-[#ff5252] border-b border-[#21262d] pb-2 mb-2">
                  <span>Receipt Amount:</span>
                  <span>- {selectedAccount.currency}{amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>New Balance:</span>
                  <span className="font-medium">
                    {selectedAccount.currency}
                    {(selectedAccount.balance - amount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#21262d] text-white hover:bg-[#161b22]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedAccountId || isLoading}
            className="bg-[#00b386] hover:bg-[#00a077] text-white"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 