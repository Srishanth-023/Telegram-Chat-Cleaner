import dynamic from "next/dynamic";

const ReviewView = dynamic(
  () => import("@/components/review/ReviewView").then((mod) => mod.ReviewView),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-text-muted">Loading selection review...</p>
      </div>
    ),
  }
);

export default function ReviewPage() {
  return <ReviewView />;
}
