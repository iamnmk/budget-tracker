"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon } from "lucide-react";
import { createAccount } from "@/actions/accountActions";

interface AddAccountDialogProps {
  onAccountAdded?: () => void;
}

export function AddAccountDialog({ onAccountAdded }: AddAccountDialogProps = {}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createAccount(formData);

      if (result.success) {
        setOpen(false);
        router.refresh();
        window.location.reload();
        if (onAccountAdded) {
          onAccountAdded();
        }
      } else {
        setError(result.error || "Failed to create account");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#00b386] hover:bg-[#00a077] text-white">
          <PlusIcon className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#0d1117] text-white border-[#21262d]">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new financial account to track your balance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-white">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Main Account"
                className="col-span-3 bg-[#161b22] border-[#21262d] text-white"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right text-white">
                Type
              </Label>
              <Select name="type" required>
                <SelectTrigger className="col-span-3 bg-[#161b22] border-[#21262d] text-white">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-[#21262d] text-white">
                  <SelectItem value="Checking">Checking</SelectItem>
                  <SelectItem value="Savings">Savings</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Investment">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right text-white">
                Currency
              </Label>
              <Select name="currency" required defaultValue="$">
                <SelectTrigger className="col-span-3 bg-[#161b22] border-[#21262d] text-white">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-[#21262d] text-white">
                  <SelectItem value="$">USD ($)</SelectItem>
                  <SelectItem value="€">EUR (€)</SelectItem>
                  <SelectItem value="£">GBP (£)</SelectItem>
                  <SelectItem value="¥">JPY (¥)</SelectItem>
                  <SelectItem value="﷼">SAR (﷼)</SelectItem>
                  <SelectItem value="₹">INR (₹)</SelectItem>
                  <SelectItem value="د.إ">AED (د.إ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right text-white">
                Balance
              </Label>
              <Input
                id="balance"
                name="balance"
                type="number"
                placeholder="0.00"
                step="0.01"
                className="col-span-3 bg-[#161b22] border-[#21262d] text-white"
                required
              />
            </div>
          </div>
          {error && (
            <div className="text-[#ff5252] text-sm mb-4 text-center">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button
              type="submit"
              className="bg-[#00b386] hover:bg-[#00a077] text-white w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 