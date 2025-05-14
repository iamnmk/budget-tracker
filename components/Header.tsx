"use client";

import { SignedIn, UserButton, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";
import { Shield } from "lucide-react";
import { usePathname } from "next/navigation";

function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div
      className={`flex justify-between items-center p-4 ${
        isHomePage ? "bg-blue-50" : "bg-white border-b border-blue-50"
      }`}
    >
      <Link href="/" className="flex items-center">
        <Shield className="h-6 w-6 text-blue-600 mr-2" />

        <h1 className="text-xl font-semibold">Expensio</h1>
      </Link>

      <div className="flex items-center space-x-4">
        <SignedIn>
          <Link href="/receipts">
            <Button variant="outline">My Receipts</Button>
          </Link>

          <Link href="/accounts">
            <Button variant="outline">Accounts</Button>
          </Link>

          <Link href="/manage-plan">
            <Button>Manage Plan</Button>
          </Link>

          <UserButton />
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <Button>Sign In To Get Started</Button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  );
}

export default Header;
