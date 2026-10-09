import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  FileText,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Wrench,
  Truck,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { ChatMessage } from '../types/manufacturing';
import { askManufacturingCopilot } from '../services/aiService';
import { Badge } from '../components/common/Badge';
import { usePlantDatabase } from '../context/DatabaseContext';

interface AICopilotProps {
  onSelectComponent: (partNumber: string) => void;
  onSelectMachine: (machineId: string) => void;
  onNavigateToParts: () => void;
  onNavigateToMachines: () => void;
  onNavigateToSuppliers: () => void;
}

export const AICopilot: React.FC<AICopilotProps> = ({
  onSelectComponent,
  onSelectMachine,
  onNavigateToParts,
  onNavigateToMachines,
  onNavigateToSuppliers
}) => {
  const { components, machines, purchaseOrders, suppliers } = usePlantDatabase();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello Sohil. I am **PlantIQ Copilot**, your manufacturing intelligence assistant for **Plant A — Sanand**.

I have real-time visibility into the plant's active BOM explosions, machine sensor telemetry, supplier delivery status, and standard operating procedures (SOPs).

Here are the most urgent alerts requiring your attention:
- 🚨 **SEN-2048 & MCU-110**: Critical shortage risk threatening Line 1 and Line 2 ECU production schedules.
- ⚙️ **M-ASSY-03 (SMT Station)**: Spindle harmonic vibration alert at **4.8 mm/s** (exceeds 4.5 mm/s ISO threshold).
- 🚢 **Supplier Delays**: 4 purchase orders currently delayed or at risk.

How can I assist your operations today?`,
      timestamp: 'Just now',
      sources: [
        { docTitle: 'BOM-ECU-GEN5-PRO Rev 4', section: 'Section 2: Active Electronics', page: 2, score: 98 },
        { docTitle: 'SOP-MNT-402: High-Speed SMT Placement Station Vibration', section: 'Section 3.1: Vibration Limits', page: 3, score: 95 }
      ],
      actions: [
        {
          type: 'PROCUREMENT',
          title: 'Expedite PO-9840 (SEN-2048)',
          description: 'Authorize air-freight premium for 20 units.',
          partOrMachineId: 'SEN-2048'
        },
        {
          type: 'MAINTENANCE',
          title: 'Dispatch Ultrasound Check for M-ASSY-03',
          description: 'Mandatory bearing acoustic inspection within 4h.',
          partOrMachineId: 'M-ASSY-03'
        }
      ]
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeActions, setActiveActions] = useState<any[]>(messages[0].actions || []);
  const [activeSources, setActiveSources] = useState<any[]>(messages[0].sources || []);
  const [actionDoneNotice, setActionDoneNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const suggestedQuestions = [
    'Which components are at risk of shortage?',
    'Which supplier delays may affect upcoming ECU production?',
    'What is causing the high vibration alert?',
    'Recommend purchase quantities for the next four weeks.',
    'Which spare parts are needed for machine M-ASSY-03?',
    'Which components have only one approved supplier?',
    'Explain the maintenance procedure for an overheating assembly robot.'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    setInputPrompt('');

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await askManufacturingCopilot(query, newHistory, {
        components,
        machines,
        purchaseOrders,
        suppliers
      });

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources,
        actions: response.actions
      };

      setMessages((prev) => [...prev, aiMessage]);
      if (response.actions && response.actions.length > 0) {
        setActiveActions(response.actions);
      }
      if (response.sources && response.sources.length > 0) {
        setActiveSources(response.sources);
      }
    } catch {
      // Fallback
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'Unable to reach model backend. Please verify network connectivity or check system status.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: any) => {
    setActionDoneNotice(`Initiated operational action: "${action.title}"`);
    setTimeout(() => setActionDoneNotice(null), 3500);

    if (action.partOrMachineId) {
      if (action.partOrMachineId.startsWith('M-')) {
        onSelectMachine(action.partOrMachineId);
      } else {
        onSelectComponent(action.partOrMachineId);
      }
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-cleared',
        role: 'assistant',
        content: 'Conversation cleared. What manufacturing question can I solve for you next?',
        timestamp: 'Just now'
      }
    ]);
    setActiveActions([]);
    setActiveSources([]);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#172B4D]">
              PlantIQ AI Copilot
            </h1>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-[#20A36B] border border-emerald-200">
              Gemini 3.8 Flash • RAG Grounded
            </span>
          </div>
          <p className="text-xs text-[#718198]">
            Generative manufacturing assistant with retrieval-augmented generation over automotive manuals and BOM tables
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Action Notification Toast */}
      {actionDoneNotice && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{actionDoneNotice}</span>
        </div>
      )}

      {/* 3-Panel Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 min-h-[640px]">
        {/* Left Panel (3 cols): Suggested Questions */}
        <div className="space-y-3 lg:col-span-3">
          <div className="rounded-lg border border-slate-200/90 bg-white p-3.5 shadow-xs">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <Sparkles className="h-4 w-4 text-[#1677F2]" />
              <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                Operational Inquiries
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="w-full text-left rounded-md border border-slate-100 bg-[#F3F6FB]/80 p-2 text-xs text-[#172B4D] hover:bg-blue-50/70 hover:border-blue-200 hover:text-[#1677F2] transition-colors"
                >
                  <span className="line-clamp-2">"{q}"</span>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded bg-slate-50 p-2 text-[11px] text-slate-500">
              💡 <em>Answers are strictly grounded in Sanand Plant A records and verified engineering manuals.</em>
            </div>
          </div>
        </div>

        {/* Center Panel (6 cols): Conversation Area */}
        <div className="flex flex-col rounded-lg border border-slate-200/90 bg-white shadow-xs lg:col-span-6 overflow-hidden">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[560px]">
            {messages.map((msg, msgIdx) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={`${msg.id}-${msgIdx}`}
                  className={`flex gap-3 text-xs ${isAssistant ? '' : 'flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isAssistant
                        ? 'bg-[#10233F] text-white shadow-2xs'
                        : 'bg-[#1677F2] text-white'
                    }`}
                  >
                    {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[85%] rounded-lg p-3.5 space-y-2 ${
                      isAssistant
                        ? 'border border-slate-200 bg-[#F3F6FB]/70 text-[#172B4D]'
                        : 'bg-[#1677F2] text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] opacity-70">
                      <span>{isAssistant ? 'PlantIQ Intelligence' : 'You (Sohil Malek)'}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="prose prose-xs max-w-none leading-relaxed text-inherit whitespace-pre-wrap font-sans">
                      {msg.content}
                    </div>

                    {/* Sources Badge List */}
                    {isAssistant && msg.sources && msg.sources.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Grounded Citations:
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {msg.sources.map((s, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200"
                            >
                              <FileText className="h-3 w-3 text-[#1677F2]" />
                              <span className="truncate max-w-[140px]">{s.docTitle}</span>
                              {s.page && <span className="text-slate-400">p.{s.page}</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 text-xs">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#10233F] text-white animate-pulse">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-slate-600 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#1677F2] animate-ping" />
                  <span>Analyzing active BOM allocations, machine telemetry, and SOP manuals...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="border-t border-slate-200 p-3 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask manufacturing question or maintenance protocol..."
                className="flex-1 rounded-md border border-slate-200 bg-[#F3F6FB] px-3.5 py-2 text-xs text-[#172B4D] placeholder-slate-400 focus:border-[#1677F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1677F2]"
              />
              <button
                type="submit"
                disabled={isLoading || !inputPrompt.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1677F2] text-white hover:bg-blue-600 disabled:opacity-40 transition-colors shadow-2xs"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel (3 cols): Action Plan & Retrieved Documents */}
        <div className="space-y-4 lg:col-span-3">
          {/* Action Plan */}
          <div className="rounded-lg border border-slate-200/90 bg-white p-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                Recommended Action Plan
              </span>
              <Badge variant="info">{activeActions.length} Actions</Badge>
            </div>

            {activeActions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Ask a question to generate specific operational mitigations.
              </div>
            ) : (
              <div className="mt-3 space-y-2.5">
                {activeActions.map((act, idx) => {
                  let badgeVariant: 'critical' | 'warning' | 'info' = 'info';
                  if (act.type === 'PROCUREMENT') badgeVariant = 'warning';
                  if (act.type === 'MAINTENANCE') badgeVariant = 'critical';

                  return (
                    <div
                      key={idx}
                      className="rounded-md border border-slate-200 bg-slate-50/70 p-2.5 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#172B4D]">{act.title}</span>
                        <Badge variant={badgeVariant}>{act.type}</Badge>
                      </div>
                      <p className="text-[11px] text-slate-600">{act.description}</p>
                      <button
                        onClick={() => handleActionClick(act)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#1677F2] hover:underline pt-1"
                      >
                        <span>Execute Action</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Retrieved Source Documents */}
          <div className="rounded-lg border border-slate-200/90 bg-white p-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-[#1677F2]" />
                <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                  Retrieved Documents
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">BM25 Ranked</span>
            </div>

            {activeSources.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Retrieved knowledge passages will appear here.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {activeSources.map((source, i) => (
                  <div
                    key={i}
                    className="rounded border border-slate-100 bg-[#F3F6FB] p-2 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#172B4D] truncate max-w-[160px]">
                        {source.docTitle}
                      </span>
                      {source.score && (
                        <span className="text-[10px] text-emerald-600 font-mono">
                          {source.score}% match
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {source.section} {source.page ? `• Page ${source.page}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
