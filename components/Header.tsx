import { SignedIn, UserButton, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";

function Header() {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-100">
      <Link href="/">
        <h1 className="text-xl font-semibold">Receipt Agent</h1>
      </Link>

      <div className="flex items-center space-x-4">
        <Link href="/manage-plan">
          <Button>Manage Plan</Button>
        </Link>

        <SignedIn>
          <UserButton />
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <Button>Sign In</Button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  );
}

export default Header;
