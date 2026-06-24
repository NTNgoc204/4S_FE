import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'

import QuizLeftPanel from './components/QuizLeftPanel'
import QuizRightPanel from './components/QuizRightPanel'
import QuizSkeleton from './components/QuizSkeleton'
import QuizError from './components/QuizError'
import ConfirmModal from '../../components/ConfirmModal'
import {
  fetchQuestionsRequest,
  fetchUserProgressRequest,
  submitAnswerIncrementRequest,
  setActiveIndex,
  redoQuizRequest,
} from '../../feature/question/questionSlice'
import {
  isOptionActuallyOther,
} from './util/quizHelpers'

function GuidedQuizPage() {
  const { t, i18n } = useTranslation('quiz')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const locale = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'

  const text = useMemo(() => ({
    helper: t('helper'),
    changeMode: t('changeMode'),
    questionProgress: (current, total) => t('questionProgress', { current, total }),
    panelIdle: t('panelIdle'),
    panelActive: (current, total) => t('panelActive', { current, total }),
    viewDetail: t('viewDetail'),
    compareButton: (count) => t('compareButton', { count }),
    summaryTitle: t('summaryTitle'),
  }), [t])

  // Load backend questions if available
  const dynamicQuestions = useSelector((state) => state.question.questions)
  const { loading: questionsLoading, submitLoading } = useSelector((state) => state.question)
  const { user, loading: authLoading } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchQuestionsRequest())
  }, [dispatch])

  const quizQuestions = useMemo(() => {
    const rawQuestions = dynamicQuestions && dynamicQuestions.length > 0 ? dynamicQuestions : []
    
    // Filter out chatbot category to only show Holland questions
    const hollandQuestions = rawQuestions.filter(q => 
      q.categoryId !== 'b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' && 
      q.categoryName !== 'Trò chuyện hướng nghiệp AI'
    );

    return hollandQuestions.map((q) => {
      const hasOther = q.options?.some(isOptionActuallyOther)

      if (hasOther) return q

      const customOtherOption = {
        id: `custom_other_${q.id}`,
        content: 'Khác',
        label: { vi: 'Khác', en: 'Other' },
        scoreTag: 'balanced',
        vector: { leftBrain: 0, rightBrain: 0 },
      }

      return {
        ...q,
        options: [...(q.options || []), customOtherOption],
      }
    })
  }, [dynamicQuestions])

  const {
    answers,
    insights,
    activeIndex,
    overallSummary,
    aiRecommendations,
    progressLoading,
    evaluationLoading,
    thinkingQuestionId,
    overallLoading,
    redoLoading
  } = useSelector((state) => state.question)

  const [isRedoConfirmOpen, setIsRedoConfirmOpen] = useState(false)

  const listRef = useRef(null)

  const answeredCount = Object.keys(answers).length
  const isDone = quizQuestions.length > 0 && answeredCount === quizQuestions.length
  const visibleQuestions = useMemo(() => {
    return quizQuestions.slice(0, Math.min(activeIndex + 1, quizQuestions.length))
  }, [quizQuestions, activeIndex])

  const isThinking = evaluationLoading || overallLoading

  // Load progress from database if user is authenticated and dynamic questions are loaded
  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user) {
      return
    }

    if (quizQuestions.length === 0) {
      return
    }

    dispatch(fetchUserProgressRequest({ quizQuestions, locale }))
  }, [user, authLoading, quizQuestions, questionsLoading, dispatch, locale])

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [])

  useEffect(() => {
    if (!listRef.current) {
      return
    }
    listRef.current.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [answers, insights, activeIndex, overallLoading, overallSummary])


  function onSelect(question, option, customText) {
    if (evaluationLoading || redoLoading) {
      return
    }

    const qIndex = quizQuestions.findIndex((q) => q.id === question.id)
    if (qIndex === -1) return

    const activeQuestion = quizQuestions[activeIndex]
    const isSameCategory = activeQuestion && question.categoryId === activeQuestion.categoryId

    if (isDone || !isSameCategory) {
      return
    }

    const isAlreadyAnswered = Boolean(answers[question.id])
    const isEndOfCategory = qIndex === quizQuestions.length - 1 ||
      (quizQuestions[qIndex + 1] && quizQuestions[qIndex].categoryId !== quizQuestions[qIndex + 1].categoryId);

    // Find all questions in the same category
    const categoryQuestions = quizQuestions.filter(q => q.categoryId === question.categoryId)
    const lastQuestionOfCategory = categoryQuestions[categoryQuestions.length - 1]

    dispatch(submitAnswerIncrementRequest({
      question,
      option,
      customText,
      locale,
      isAlreadyAnswered,
      isEndOfCategory,
      lastQuestionOfCategory,
      activeIndex,
      quizQuestionsLength: quizQuestions.length
    }))
  }


  const handleContinue = () => {
    dispatch(setActiveIndex(Math.min(activeIndex + 1, quizQuestions.length - 1)))
  }

  function handleViewDetail(school) {
    if (!school) {
      return
    }
    navigate(`/university/${school.id}`, {
      state: {
        from: '/quiz',
        matchScore: school.matchPercent,
      },
    })
  }

  const triggerRedoQuiz = () => {
    setIsRedoConfirmOpen(true)
  }

  const executeRedoQuiz = () => {
    setIsRedoConfirmOpen(false)
    dispatch(redoQuizRequest({ locale }))
  }

  const showPageSkeleton = authLoading || questionsLoading || progressLoading || redoLoading;

  if (showPageSkeleton) {
    return <QuizSkeleton />
  }

  const isFailedToLoad = !questionsLoading && dynamicQuestions.length === 0 && !progressLoading;

  if (isFailedToLoad) {
    return <QuizError onRetry={() => dispatch(fetchQuestionsRequest())} />
  }

  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://4s-company.vercel.app';

  return (
    <>
      <Helmet>
        <title>{t('meta.title')}</title>
        <meta name="description" content={t('meta.description')} />
        <link rel="canonical" href={`${siteUrl}/quiz`} />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content={t('meta.title')} />
        <meta property="og:description" content={t('meta.description')} />
        <meta property="og:url" content={`${siteUrl}/quiz`} />
        <meta property="og:image" content={`${siteUrl}/assets/logo-4s.png`} />
      </Helmet>
      <main className="mx-auto flex h-[calc(100dvh-74px)] w-[min(1360px,96vw)] flex-col overflow-hidden py-3">
        <div className="mb-3 flex justify-end">
          <button
            className="rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 md:text-sm"
            onClick={() => navigate('/consultation')}
            type="button"
          >
            {text.changeMode}
          </button>
        </div>
        <section className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-2xl border border-white/12 bg-[#081a30]/62 lg:grid-cols-[minmax(0,1fr)_340px]">
          <QuizLeftPanel
            activeIndex={activeIndex}
            answers={answers}
            insights={insights}
            isCategoryThinking={evaluationLoading}
            isDone={isDone}
            isThinking={isThinking}
            isOverallLoading={overallLoading}
            listRef={listRef}
            locale={locale}
            onSelect={onSelect}
            questionCount={quizQuestions.length}
            text={text}
            thinkingQuestionId={thinkingQuestionId}
            visibleQuestions={visibleQuestions}
            recommendations={aiRecommendations}
            onViewDetail={handleViewDetail}
            submitLoading={submitLoading}
            onContinue={handleContinue}
            overallSummary={overallSummary}
            onRedoQuiz={triggerRedoQuiz}
          />
          <QuizRightPanel
            answeredCount={answeredCount}
            isCategoryThinking={evaluationLoading}
            isDone={isDone}
            isOverallLoading={overallLoading}
            locale={locale}
            questionCount={quizQuestions.length}
            recommendations={aiRecommendations}
            text={text}
            answers={answers}
            questions={quizQuestions}
            insights={insights}
          />
        </section>
      </main>
      <ConfirmModal
        isOpen={isRedoConfirmOpen}
        title={t('confirmModal.title')}
        message={t('confirmModal.message')}
        confirmText={t('confirmModal.confirm')}
        cancelText={t('confirmModal.cancel')}
        onConfirm={executeRedoQuiz}
        onCancel={() => setIsRedoConfirmOpen(false)}
        type="warning"
      />
    </>
  )
}

export default GuidedQuizPage

