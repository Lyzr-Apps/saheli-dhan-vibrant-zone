'use client'

/**
 * SAHELI - Smart Home Business Companion
 * Complete UI for Indian housewives managing home businesses
 *
 * Agent IDs:
 * 1. Gentle Reminder Agent: 69858c60ab4bf65a66ad081a
 * 2. Sales Recording Agent: 69858c7bc613a65b3c419477
 * 3. Expense Tracker Agent: 69858c94a791e6e318b8dee8
 * 4. Profit Companion Agent: 69858cad094c8b2d4207dd31
 * 5. Summary Companion Agent: 69858cc8c613a65b3c41947c
 * 6. Pricing Guide Agent: 69858ce46417bacaca9cf927
 */

import { useState, useEffect, useCallback } from 'react'
import { callAIAgent, NormalizedAgentResponse } from '@/lib/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  FaHome,
  FaHistory,
  FaCog,
  FaMicrophone,
  FaRupeeSign,
  FaShoppingBasket,
  FaSmile,
  FaCalendarAlt,
  FaArrowLeft,
  FaTimes,
  FaSmileBeam,
  FaMeh,
  FaFrown,
  FaSun,
  FaCheck,
  FaExclamationTriangle,
  FaChartLine,
  FaLightbulb,
  FaSpinner,
  FaChevronRight
} from 'react-icons/fa'

// Agent IDs
const AGENT_IDS = {
  GENTLE_REMINDER: '69858c60ab4bf65a66ad081a',
  SALES_RECORDING: '69858c7bc613a65b3c419477',
  EXPENSE_TRACKER: '69858c94a791e6e318b8dee8',
  PROFIT_COMPANION: '69858cad094c8b2d4207dd31',
  SUMMARY_COMPANION: '69858cc8c613a65b3c41947c',
  PRICING_GUIDE: '69858ce46417bacaca9cf927',
}

// TypeScript Interfaces based on test responses
interface ReminderResponse {
  greeting: string
  reminders: string[]
  encouragement: string
}

interface SalesRecordingResponse {
  question: string
  step: number
  options?: string[]
  confirmation?: string
}

interface ExpenseTrackerResponse {
  question: string
  categories?: string[]
  confirmation?: string
}

interface ProfitCompanionResponse {
  mood: 'happy' | 'okay' | 'concerned'
  message: string
  visualization: string
  encouragement: string
}

interface SummaryCompanionResponse {
  weekSummary: string
  wins: string[]
  concerns: string[]
  encouragement: string
}

interface PricingGuideResponse {
  suggestion: string
  reasoning: string
  isOptional: boolean
}

interface HistoryItem {
  id: string
  type: 'sale' | 'expense'
  description: string
  amount: string
  date: string
  icon: any
}

type Screen = 'home' | 'sales' | 'expense' | 'profit' | 'summary' | 'pricing' | 'history' | 'settings'

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home')
  const [loading, setLoading] = useState(false)
  const [reminderData, setReminderData] = useState<ReminderResponse | null>(null)
  const [showReminder, setShowReminder] = useState(true)
  const [sessionId] = useState(() => `session_${Date.now()}`)

  // Chat state for conversational flows
  const [chatMessages, setChatMessages] = useState<Array<{type: 'agent' | 'user', text: string, options?: string[]}>>([])
  const [userInput, setUserInput] = useState('')
  const [currentAgent, setCurrentAgent] = useState<string>('')

  // Financial state
  const [profitData, setProfitData] = useState<ProfitCompanionResponse | null>(null)
  const [summaryData, setSummaryData] = useState<SummaryCompanionResponse | null>(null)
  const [pricingData, setPricingData] = useState<PricingGuideResponse | null>(null)
  const [pricingInput, setPricingInput] = useState('')
  const [pricingLoading, setPricingLoading] = useState(false)

  // History data (mock data for now)
  const [historyItems] = useState<HistoryItem[]>([
    {
      id: '1',
      type: 'sale',
      description: '5 samosas sold',
      amount: '₹100',
      date: 'Today, 2:30 PM',
      icon: FaRupeeSign
    },
    {
      id: '2',
      type: 'expense',
      description: 'Flour and oil',
      amount: '₹250',
      date: 'Today, 10:00 AM',
      icon: FaShoppingBasket
    },
    {
      id: '3',
      type: 'sale',
      description: '3 pickle jars sold',
      amount: '₹450',
      date: 'Yesterday, 5:00 PM',
      icon: FaRupeeSign
    },
  ])

  // Load reminder on app start
  useEffect(() => {
    loadReminder()
  }, [])

  const loadReminder = async () => {
    const result = await callAIAgent('Good morning', AGENT_IDS.GENTLE_REMINDER, { session_id: sessionId })
    if (result.success && result.response.result) {
      setReminderData(result.response.result as ReminderResponse)
    }
  }

  const handleActionClick = async (action: Screen) => {
    setCurrentScreen(action)
    setChatMessages([])
    setUserInput('')
    setLoading(false)

    if (action === 'sales') {
      setCurrentAgent(AGENT_IDS.SALES_RECORDING)
      setChatMessages([
        {
          type: 'agent',
          text: 'Namaste! I\'m here to help you record your sale. What did you sell today?',
        }
      ])
    } else if (action === 'expense') {
      setCurrentAgent(AGENT_IDS.EXPENSE_TRACKER)
      setChatMessages([
        {
          type: 'agent',
          text: 'Hello! Let\'s note down your expense. What did you spend money on?',
        }
      ])
    } else if (action === 'profit') {
      setLoading(true)
      const result = await callAIAgent('How am I doing this week with my business?', AGENT_IDS.PROFIT_COMPANION, { session_id: sessionId })
      if (result.success && result.response.result) {
        setProfitData(result.response.result as ProfitCompanionResponse)
      }
      setLoading(false)
    } else if (action === 'summary') {
      setLoading(true)
      const result = await callAIAgent('Show me my weekly summary', AGENT_IDS.SUMMARY_COMPANION, { session_id: sessionId })
      if (result.success && result.response.result) {
        setSummaryData(result.response.result as SummaryCompanionResponse)
      }
      setLoading(false)
    }
  }

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return

    // Add user message to chat
    setChatMessages(prev => [...prev, { type: 'user', text: message }])
    setUserInput('')
    setLoading(true)

    // Call agent
    const result = await callAIAgent(message, currentAgent, { session_id: sessionId })

    if (result.success && result.response.result) {
      const agentResponse = result.response.result as any

      // Handle Sales Recording Agent
      if (currentAgent === AGENT_IDS.SALES_RECORDING) {
        const salesResponse = agentResponse as SalesRecordingResponse

        if (salesResponse.confirmation) {
          // Final confirmation
          setChatMessages(prev => [...prev, {
            type: 'agent',
            text: salesResponse.confirmation
          }])

          // Show celebration and return to home after delay
          setTimeout(() => {
            alert('🎉 Wonderful! Your sale has been recorded. You\'re doing amazing!')
            setCurrentScreen('home')
          }, 1500)
        } else if (salesResponse.question) {
          // Next question with options
          setChatMessages(prev => [...prev, {
            type: 'agent',
            text: salesResponse.question,
            options: salesResponse.options
          }])
        }
      }

      // Handle Expense Tracker Agent
      if (currentAgent === AGENT_IDS.EXPENSE_TRACKER) {
        const expenseResponse = agentResponse as ExpenseTrackerResponse

        if (expenseResponse.confirmation) {
          // Final confirmation
          setChatMessages(prev => [...prev, {
            type: 'agent',
            text: expenseResponse.confirmation
          }])

          // Return to home after delay
          setTimeout(() => {
            alert('✓ Perfect! Your expense has been noted. You\'re managing so well!')
            setCurrentScreen('home')
          }, 1500)
        } else if (expenseResponse.question) {
          // Next question with categories
          setChatMessages(prev => [...prev, {
            type: 'agent',
            text: expenseResponse.question,
            options: expenseResponse.categories
          }])
        }
      }
    }

    setLoading(false)
  }, [currentAgent, sessionId])

  const handleOptionClick = useCallback((option: string) => {
    handleSendMessage(option)
  }, [handleSendMessage])

  const handleVoiceClick = () => {
    alert('Voice input will be available soon! For now, please type your message.')
  }

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy':
        return <FaSmileBeam className="text-green-500" size={80} />
      case 'okay':
        return <FaMeh className="text-yellow-500" size={80} />
      case 'concerned':
        return <FaFrown className="text-orange-500" size={80} />
      default:
        return <FaSmile className="text-green-500" size={80} />
    }
  }

  // Screen Components
  const HomeScreen = () => (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-400 text-white px-6 py-8 rounded-b-3xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">नमस्ते, Saheli!</h1>
        <p className="text-lg opacity-90">Welcome back to your business companion</p>
      </div>

      {/* Reminder Card */}
      {showReminder && reminderData && (
        <div className="mx-4 mt-4 mb-2">
          <Card className="bg-white border-2 border-orange-200 shadow-md relative">
            <button
              onClick={() => setShowReminder(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <FaTimes size={18} />
            </button>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-orange-800 flex items-center gap-2">
                <FaSun className="text-orange-400" />
                {reminderData.greeting}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-3">
                {reminderData.reminders.map((reminder, idx) => (
                  <p key={idx} className="text-gray-700 text-base leading-relaxed">
                    • {reminder}
                  </p>
                ))}
              </div>
              <p className="text-green-700 font-medium text-base italic">
                {reminderData.encouragement}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Grid */}
      <div className="flex-1 px-4 py-6 overflow-auto">
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          <ActionCard
            icon={<FaRupeeSign size={48} />}
            title="Record Sale"
            subtitle="Bechna hua maal"
            color="from-green-400 to-emerald-500"
            onClick={() => handleActionClick('sales')}
          />
          <ActionCard
            icon={<FaShoppingBasket size={48} />}
            title="Add Expense"
            subtitle="Kharcha"
            color="from-orange-400 to-red-400"
            onClick={() => handleActionClick('expense')}
          />
          <ActionCard
            icon={<FaSmile size={48} />}
            title="How am I doing?"
            subtitle="Mera hisaab"
            color="from-purple-400 to-pink-400"
            onClick={() => handleActionClick('profit')}
          />
          <ActionCard
            icon={<FaCalendarAlt size={48} />}
            title="Weekly Summary"
            subtitle="Hafta ka hisaab"
            color="from-blue-400 to-indigo-500"
            onClick={() => handleActionClick('summary')}
          />
        </div>

        {/* Additional Actions */}
        <div className="mt-6 max-w-2xl mx-auto">
          <Button
            onClick={() => handleActionClick('pricing')}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <FaLightbulb className="mr-2" size={24} />
            Get Pricing Advice
          </Button>
        </div>
      </div>

      {/* Voice Button */}
      <div className="flex justify-center pb-24">
        <button
          onClick={handleVoiceClick}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full p-6 shadow-2xl hover:shadow-3xl transition-all hover:scale-110 active:scale-95"
        >
          <FaMicrophone size={32} />
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav active="home" onNavigate={setCurrentScreen} />
    </div>
  )

  const ConversationalScreen = ({ title, backAction }: { title: string, backAction: () => void }) => (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-400 text-white px-6 py-6 shadow-lg flex items-center gap-4">
        <button onClick={backAction} className="text-white hover:bg-white/20 rounded-full p-2">
          <FaArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto px-4 py-6 space-y-4">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.type === 'user' ? 'bg-orange-500 text-white' : 'bg-white border-2 border-orange-200'} rounded-2xl px-6 py-4 shadow-md`}>
              <p className="text-lg leading-relaxed">{msg.text}</p>

              {/* Options as large buttons */}
              {msg.options && msg.options.length > 0 && (
                <div className="mt-4 space-y-2">
                  {msg.options.map((option, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionClick(option)}
                      className="w-full bg-gradient-to-r from-orange-400 to-amber-400 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all text-base font-medium"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-orange-200 rounded-2xl px-6 py-4 shadow-md">
              <FaSpinner className="animate-spin text-orange-500" size={24} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 pb-6 pt-4 bg-white border-t-2 border-orange-200">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(userInput)}
            placeholder="Type your message..."
            className="flex-1 text-lg py-6 px-4 border-2 border-orange-300 rounded-xl"
            disabled={loading}
          />
          <Button
            onClick={() => handleSendMessage(userInput)}
            disabled={loading || !userInput.trim()}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 rounded-xl"
          >
            <FaChevronRight size={24} />
          </Button>
          <button
            onClick={handleVoiceClick}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl shadow-lg"
          >
            <FaMicrophone size={24} />
          </button>
        </div>
      </div>
    </div>
  )

  const ProfitScreen = () => (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-6 py-6 shadow-lg flex items-center gap-4">
        <button onClick={() => setCurrentScreen('home')} className="text-white hover:bg-white/20 rounded-full p-2">
          <FaArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">How You're Doing</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <FaSpinner className="animate-spin text-orange-500" size={48} />
          </div>
        ) : profitData ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Mood Indicator */}
            <Card className="bg-white border-2 border-purple-200 shadow-lg">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="flex justify-center mb-6">
                  {getMoodIcon(profitData.mood)}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {profitData.visualization}
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  {profitData.message}
                </p>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <p className="text-lg text-green-800 font-medium">
                    {profitData.encouragement}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Back Button */}
            <Button
              onClick={() => setCurrentScreen('home')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-6 text-lg rounded-2xl shadow-lg"
            >
              Back to Home
            </Button>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p className="text-lg">Unable to load your business status. Please try again.</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav active="home" onNavigate={setCurrentScreen} />
    </div>
  )

  const SummaryScreen = () => (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-6 py-6 shadow-lg flex items-center gap-4">
        <button onClick={() => setCurrentScreen('home')} className="text-white hover:bg-white/20 rounded-full p-2">
          <FaArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Weekly Summary</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <FaSpinner className="animate-spin text-orange-500" size={48} />
          </div>
        ) : summaryData ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Week Summary */}
            <Card className="bg-white border-2 border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-800 flex items-center gap-2">
                  <FaCalendarAlt />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl text-gray-700 font-medium mb-6">
                  {summaryData.weekSummary}
                </p>

                {/* Wins */}
                {summaryData.wins.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">
                      <FaCheck /> Your Wins
                    </h3>
                    <div className="space-y-2">
                      {summaryData.wins.map((win, idx) => (
                        <div key={idx} className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                          <p className="text-base text-gray-700">✓ {win}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Concerns */}
                {summaryData.concerns.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-orange-700 mb-3 flex items-center gap-2">
                      <FaExclamationTriangle /> Things to Consider
                    </h3>
                    <div className="space-y-2">
                      {summaryData.concerns.map((concern, idx) => (
                        <div key={idx} className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                          <p className="text-base text-gray-700">• {concern}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Encouragement */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4">
                  <p className="text-lg text-blue-800 font-medium">
                    💪 {summaryData.encouragement}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Back Button */}
            <Button
              onClick={() => setCurrentScreen('home')}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-6 text-lg rounded-2xl shadow-lg"
            >
              Back to Home
            </Button>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p className="text-lg">Unable to load your weekly summary. Please try again.</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav active="home" onNavigate={setCurrentScreen} />
    </div>
  )

  const handleGetPricingAdvice = async () => {
    if (!pricingInput.trim()) {
      alert('Please enter what you want pricing advice for')
      return
    }

    setPricingLoading(true)
    const result = await callAIAgent(pricingInput, AGENT_IDS.PRICING_GUIDE, { session_id: sessionId })

    if (result.success && result.response.result) {
      setPricingData(result.response.result as PricingGuideResponse)
    }

    setPricingLoading(false)
  }

  const PricingScreen = () => {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-6 shadow-lg flex items-center gap-4">
          <button onClick={() => setCurrentScreen('home')} className="text-white hover:bg-white/20 rounded-full p-2">
            <FaArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Pricing Guide</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Input Section */}
            {!pricingData && (
              <Card className="bg-white border-2 border-amber-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-800 flex items-center gap-2">
                    <FaLightbulb />
                    Get Pricing Advice
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-base text-gray-700">
                    Tell me what product you want pricing advice for:
                  </p>
                  <Input
                    value={pricingInput}
                    onChange={(e) => setPricingInput(e.target.value)}
                    placeholder="e.g., homemade pickles, samosas..."
                    className="text-lg py-6 px-4 border-2 border-amber-300 rounded-xl"
                    onKeyPress={(e) => e.key === 'Enter' && handleGetPricingAdvice()}
                  />
                  <Button
                    onClick={handleGetPricingAdvice}
                    disabled={pricingLoading || !pricingInput.trim()}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-6 text-lg rounded-2xl shadow-lg"
                  >
                    {pricingLoading ? (
                      <><FaSpinner className="animate-spin mr-2" /> Getting Advice...</>
                    ) : (
                      'Get Advice'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pricing Advice */}
            {pricingData && (
              <div className="space-y-6">
                <Card className="bg-white border-2 border-amber-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl text-amber-800 flex items-center gap-2">
                      <FaChartLine />
                      Pricing Suggestion
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
                      <p className="text-lg text-gray-800 leading-relaxed">
                        {pricingData.suggestion}
                      </p>
                    </div>

                    <div className="border-t-2 border-gray-200 pt-4">
                      <h4 className="text-base font-bold text-gray-700 mb-2">Why this advice?</h4>
                      <p className="text-base text-gray-600 leading-relaxed">
                        {pricingData.reasoning}
                      </p>
                    </div>

                    {pricingData.isOptional && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
                        <p className="text-sm text-blue-800">
                          Remember, this is just a suggestion. You know your customers best!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setPricingData(null)
                      setPricingInput('')
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-6 text-lg rounded-2xl shadow-lg"
                  >
                    Get More Advice
                  </Button>
                  <Button
                    onClick={() => setCurrentScreen('home')}
                    variant="outline"
                    className="w-full border-2 border-amber-400 text-amber-700 py-6 text-lg rounded-2xl"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav active="home" onNavigate={setCurrentScreen} />
      </div>
    )
  }

  const HistoryScreen = () => (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-400 text-white px-6 py-6 shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaHistory />
          History
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {historyItems.map((item) => (
            <Card key={item.id} className="bg-white border-2 border-orange-200 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${item.type === 'sale' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <item.icon className={item.type === 'sale' ? 'text-green-600' : 'text-red-600'} size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{item.description}</h3>
                    <p className="text-sm text-gray-500">{item.date}</p>
                  </div>
                  <div className={`text-xl font-bold ${item.type === 'sale' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.type === 'sale' ? '+' : '-'}{item.amount}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {historyItems.length === 0 && (
            <div className="text-center py-12">
              <FaHistory className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500 text-lg">No history yet. Start recording your sales and expenses!</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav active="history" onNavigate={setCurrentScreen} />
    </div>
  )

  const SettingsScreen = () => (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-400 text-white px-6 py-6 shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaCog />
          Settings
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <Card className="bg-white border-2 border-orange-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Language / भाषा</CardTitle>
            </CardHeader>
            <CardContent>
              <select className="w-full p-3 border-2 border-orange-300 rounded-xl text-base">
                <option value="hi">हिंदी (Hindi)</option>
                <option value="en">English</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-orange-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base">Daily reminders</span>
                <input type="checkbox" defaultChecked className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base">Weekly summary</span>
                <input type="checkbox" defaultChecked className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-orange-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">About Saheli</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-gray-700 leading-relaxed">
                Saheli is your friendly business companion, designed to help you manage your home business with ease and confidence.
                We're here to support you every step of the way.
              </p>
              <p className="text-sm text-gray-500 mt-4">Version 1.0.0</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav active="settings" onNavigate={setCurrentScreen} />
    </div>
  )

  // Render current screen
  return (
    <>
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'sales' && (
        <ConversationalScreen
          title="Record Sale"
          backAction={() => setCurrentScreen('home')}
        />
      )}
      {currentScreen === 'expense' && (
        <ConversationalScreen
          title="Add Expense"
          backAction={() => setCurrentScreen('home')}
        />
      )}
      {currentScreen === 'profit' && <ProfitScreen />}
      {currentScreen === 'summary' && <SummaryScreen />}
      {currentScreen === 'pricing' && <PricingScreen />}
      {currentScreen === 'history' && <HistoryScreen />}
      {currentScreen === 'settings' && <SettingsScreen />}
    </>
  )
}

// Helper Components
function ActionCard({
  icon,
  title,
  subtitle,
  color,
  onClick
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-br ${color} text-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all active:scale-95 flex flex-col items-center justify-center gap-3 min-h-[160px]`}
    >
      <div>{icon}</div>
      <div className="text-center">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm opacity-90">{subtitle}</p>
      </div>
    </button>
  )
}

function BottomNav({
  active,
  onNavigate
}: {
  active: Screen
  onNavigate: (screen: Screen) => void
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-200 shadow-lg">
      <div className="flex justify-around items-center py-3 max-w-2xl mx-auto">
        <NavButton
          icon={<FaHome size={24} />}
          label="Ghar"
          active={active === 'home'}
          onClick={() => onNavigate('home')}
        />
        <NavButton
          icon={<FaHistory size={24} />}
          label="History"
          active={active === 'history'}
          onClick={() => onNavigate('history')}
        />
        <NavButton
          icon={<FaCog size={24} />}
          label="Settings"
          active={active === 'settings'}
          onClick={() => onNavigate('settings')}
        />
      </div>
    </div>
  )
}

function NavButton({
  icon,
  label,
  active,
  onClick
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
        active
          ? 'text-orange-600 bg-orange-50'
          : 'text-gray-500 hover:text-orange-500'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
