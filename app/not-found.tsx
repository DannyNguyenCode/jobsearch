export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-muted mt-2">The screen you requested is not part of this workspace.</p>
    </div>
  );
}