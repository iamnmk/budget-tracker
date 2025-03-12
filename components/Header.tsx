import { SignedIn, UserButton, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "./ui/button";

function Header() {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-100">
      <h1 className="text-3xl font-semibold">Receipt Agent</h1>

      <SignedIn>
        <UserButton />
      </SignedIn>

      <SignedOut>
        <SignInButton mode="modal">
          <Button>Sign In</Button>
        </SignInButton>
      </SignedOut>
    </div>
  );
}

export default Header;
