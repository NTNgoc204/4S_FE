import Skeleton from '../../../components/Skeleton'

function QuizSkeleton() {
  return (
    <main className="mx-auto flex h-[calc(100dvh-74px)] w-[min(1360px,96vw)] flex-col overflow-hidden py-3">
      <div className="mb-3 flex justify-end">
        <Skeleton height="2.25rem" width="120px" borderRadius="8px" />
      </div>
      <section className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-2xl border border-white/12 bg-[#081a30]/62 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left panel skeleton */}
        <div className="flex min-h-0 flex-col border-r border-white/10 p-4 md:p-6 justify-between">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Skeleton variant="circle" height="28px" width="28px" />
              <div className="w-full max-w-[790px] rounded-2xl border border-white/5 bg-[#122237]/40 p-5">
                <Skeleton height="2rem" className="w-3/4 mb-4" />
                <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                  <Skeleton height="3rem" borderRadius="12px" />
                  <Skeleton height="3rem" borderRadius="12px" />
                  <Skeleton height="3rem" borderRadius="12px" />
                  <Skeleton height="3rem" borderRadius="12px" />
                </div>
                <div className="mt-6 flex justify-between">
                  <Skeleton height="0.8rem" width="100px" />
                  <Skeleton height="0.8rem" width="40px" />
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <Skeleton height="100%" className="w-1/3" />
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-3">
            <Skeleton height="1.2rem" className="w-1/2" />
          </div>
        </div>

        {/* Right panel skeleton */}
        <div className="flex min-h-0 flex-col bg-[#203a59]/40 border-l border-white/5">
          <header className="border-b border-white/10 p-5 flex items-center justify-between">
            <Skeleton height="1.8rem" width="150px" />
            <Skeleton variant="circle" height="24px" width="24px" />
          </header>
          <div className="flex-1 p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-[#122238]/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton height="1.2rem" width="130px" />
                  <Skeleton height="1.2rem" width="50px" borderRadius="6px" />
                </div>
                <Skeleton height="0.8rem" className="w-full mb-2" />
                <Skeleton height="0.8rem" className="w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default QuizSkeleton
