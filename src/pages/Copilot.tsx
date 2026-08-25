import { useState, useRef, useEffect } from 'react';
import {
  Send, Bot, User, Zap, ArrowRight, ListOrdered, AlertCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ActionModal } from '@/components/shared/ActionModal';
import { suggestedPrompts } from '@/data/insights';
import { simulateAIResponse, createMessage } from '@/lib/aiSimulator';
import type { ChatMessage, ActionItem } from '@/types';

export const Copilot = () => {
  const { data, showToast, createAction, setCurrentPage, opportunities, dateRange } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const query = text ?? input;
    if (!query.trim()) return;

    const userMsg = createMessage('user', query);
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = simulateAIResponse(query, data, opportunities, dateRange);
      const aiMsg: ChatMessage = {
        ...createMessage('ai', response.text, response.actionCard),
        actionButton: response.actionButton,
        customerList: response.customerList,
        recommendations: response.recommendations,
        nextSteps: response.nextSteps,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      showToast('info', 'AI analysis completed', 'Response generated based on your business data.');
    }, 1200 + Math.random() * 800);
  };

  const handleReviewFromChat = (actionCard: NonNullable<ChatMessage['actionCard']>) => {
    const isOppId = actionCard.actionId.startsWith('opp-');
    const action: ActionItem = {
      id: actionCard.actionId,
      title: actionCard.title,
      type: isOppId ? 'customer_growth' : 'revenue_recovery',
      trigger: 'ai_copilot',
      reason: isOppId
        ? `${actionCard.affectedCustomers ?? 642} customers identified for recovery.`
        : `${actionCard.affectedCustomers ?? 126} customers affected by payment failures.`,
      estimatedImpact: actionCard.estimatedImpact,
      confidence: actionCard.confidence,
      risk: isOppId ? 'medium' : 'low',
      status: 'pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      affectedCustomers: actionCard.affectedCustomers,
    };
    setSelectedAction(action);
    setActionModalOpen(true);
  };

  const handleCreateActionFromChat = (actionCard: NonNullable<ChatMessage['actionCard']>) => {
    const id = createAction({
      title: actionCard.title,
      type: actionCard.actionId.startsWith('opp-') ? 'customer_growth' : 'revenue_recovery',
      trigger: 'ai_copilot',
      reason: `Created from AI Copilot recommendation. ${actionCard.affectedCustomers ?? ''} customers affected.`,
      estimatedImpact: actionCard.estimatedImpact,
      confidence: actionCard.confidence,
      risk: 'low',
      affectedCustomers: actionCard.affectedCustomers,
    });
    showToast('success', 'Action created', `${actionCard.title} has been added to Action Center as Pending Approval.`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-7rem)] animate-fade-in">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy-900">PayPilot Copilot</h1>
            <p className="text-xs text-gray-500">Ask questions about your business and turn insights into actions.</p>
          </div>
        </div>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-50">
                <Bot className="h-8 w-8 text-accent-600" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-navy-900">How can I help you grow revenue?</h2>
              <p className="mt-1 text-sm text-gray-500">Ask me about your business performance, or try a suggested prompt below.</p>
              <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm text-navy-700 transition-all hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700"
                  >
                    <Zap className="h-4 w-4 flex-shrink-0 text-accent-500" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${msg.sender === 'ai' ? 'bg-accent-600' : 'bg-navy-900'}`}>
                    {msg.sender === 'ai' ? <Bot className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-white" />}
                  </div>
                  <div className={`flex-1 ${msg.sender === 'user' ? 'flex justify-end' : ''}`}>
                    <div className={`inline-block rounded-xl px-4 py-3 text-sm ${msg.sender === 'user' ? 'bg-navy-900 text-white' : 'bg-gray-50 text-navy-700 border border-gray-100'}`}>
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>

                    {/* Next Steps */}
                    {msg.nextSteps && (
                      <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3 max-w-md">
                        <div className="flex items-center gap-1.5 mb-2">
                          <ListOrdered className="h-3.5 w-3.5 text-navy-500" />
                          <span className="text-xs font-bold uppercase tracking-wide text-navy-600">Recommended Next Steps</span>
                        </div>
                        <ul className="space-y-1.5">
                          {msg.nextSteps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-navy-700">
                              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-accent-100 text-[10px] font-bold text-accent-700">{i + 1}</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Ranked Recommendations */}
                    {msg.recommendations && (
                      <div className="mt-2 space-y-2 max-w-md">
                        {msg.recommendations.map((rec) => (
                          <div key={rec.rank} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                            <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              rec.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {rec.rank}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-navy-900">{rec.title}</p>
                              <p className="text-xs text-gray-400">{rec.priority} priority · {rec.impact}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Customer List */}
                    {msg.customerList && (
                      <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3 max-w-md overflow-x-auto">
                        <div className="flex items-center gap-1.5 mb-2">
                          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                          <span className="text-xs font-bold uppercase tracking-wide text-red-600">Affected Customers</span>
                        </div>
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left text-[10px] font-semibold uppercase text-gray-400 pb-1">Customer</th>
                              <th className="text-left text-[10px] font-semibold uppercase text-gray-400 pb-1">Reason</th>
                              <th className="text-right text-[10px] font-semibold uppercase text-gray-400 pb-1">Amount</th>
                              <th className="text-right text-[10px] font-semibold uppercase text-gray-400 pb-1">Recovery</th>
                            </tr>
                          </thead>
                          <tbody>
                            {msg.customerList.map((c, i) => (
                              <tr key={i} className="border-b border-gray-50">
                                <td className="py-1.5 text-xs font-medium text-navy-900">{c.name}</td>
                                <td className="py-1.5 text-xs text-gray-500">{c.reason}</td>
                                <td className="py-1.5 text-right text-xs text-navy-700">{c.amount}</td>
                                <td className="py-1.5 text-right text-xs font-semibold text-emerald-700">{c.recovery}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Action Card */}
                    {msg.actionCard && (
                      <div className="mt-2 rounded-xl border border-accent-200 bg-accent-50 p-4 max-w-md">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-accent-600" />
                          <span className="text-xs font-bold uppercase tracking-wide text-accent-600">Action Recommendation</span>
                          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">Prototype</span>
                        </div>
                        <p className="mt-2 text-sm font-bold text-navy-900">{msg.actionCard.title}</p>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-[11px] text-gray-400">Est. Impact</p>
                            <p className="text-sm font-bold text-emerald-700">{msg.actionCard.estimatedImpact}</p>
                          </div>
                          {msg.actionCard.affectedCustomers && (
                            <div>
                              <p className="text-[11px] text-gray-400">Customers</p>
                              <p className="text-sm font-bold text-navy-900">{msg.actionCard.affectedCustomers}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-[11px] text-gray-400">Confidence</p>
                            <p className="text-sm font-bold text-navy-900">{msg.actionCard.confidence}%</p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleReviewFromChat(msg.actionCard!)}>
                            Review
                          </Button>
                          <Button size="sm" variant="primary" className="flex-1" onClick={() => handleCreateActionFromChat(msg.actionCard!)}>
                            Create Action
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Action Button (navigation) */}
                    {msg.actionButton && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setCurrentPage(msg.actionButton!.target)}
                        >
                          {msg.actionButton.label} <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}

                    <p className="mt-1 text-[11px] text-gray-400">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent-600">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 max-w-3xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about revenue, payments, customers, or growth opportunities..."
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy-700 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
            <Button onClick={() => handleSend()} disabled={!input.trim() || isTyping} className="px-4 py-2.5">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <ActionModal open={actionModalOpen} onClose={() => setActionModalOpen(false)} action={selectedAction} source="AI Copilot" />
    </div>
  );
};
