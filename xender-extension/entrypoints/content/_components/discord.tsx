import DiscordButtonInjector from "./discord-button-injector";

export default function Discord({
  address,
  balance,
  isSignedIn,
}: {
  isSignedIn: boolean;
  address: string;
  balance: any;
}) {
  return (
    <>
      <DiscordButtonInjector
        stxAddr={address}
        balance={balance}
        isSignedId={isSignedIn}
      />
    </>
  );
}
