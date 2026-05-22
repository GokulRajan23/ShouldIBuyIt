export default function LoadingScreen({ product, message }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8 text-center">
      <div
        className="h-16 w-16 animate-spin rounded-full border-4 border-purple border-t-coral"
        role="status"
        aria-label="Loading"
      />
      <h2 className="mt-8 text-2xl font-bold text-purple sm:text-3xl">
        {message ?? 'Crunching the numbers…'}
      </h2>
      {product && (
        <p className="mt-3 max-w-sm text-lg font-medium text-purple/70">
          Judging <span className="font-bold text-purple">{product}</span>
        </p>
      )}
    </div>
  )
}
