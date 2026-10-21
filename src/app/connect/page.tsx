import dynamic from "next/dynamic";

const ConnectStepperCard = dynamic(
  () => import("@/components/connect/ConnectStepperCard").then((mod) => mod.ConnectStepperCard),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-xl mx-auto py-16 px-4 text-center">
        <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-sm text-text-muted">Loading secure connection portal...</p>
      </div>
    ),
  }
);

export default function ConnectPage() {
  return (
    <main className="flex-1 flex flex-col justify-center items-center py-8">
      <ConnectStepperCard />
    </main>
  );
}
