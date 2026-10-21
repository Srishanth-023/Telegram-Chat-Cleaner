import dynamic from "next/dynamic";

const ProgressView = dynamic(
  () => import("@/components/progress/ProgressView").then((mod) => mod.ProgressView),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-text-muted">Loading removal execution console...</p>
      </div>
    ),
  }
);

export default function ProgressPage() {
  return <ProgressView />;
}
