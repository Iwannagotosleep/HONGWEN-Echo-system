'use client';

import React, { useState, useEffect } from 'react';
import { Send, Search, MessageSquare, ShieldCheck, Copy, Check, ThumbsUp, Clock, Building2, CheckCircle2 } from 'lucide-react';

const CATEGORIES = ['食堂餐饮', '宿舍生活', '教学与学术', '校园设施', '学生组织与活动', '制度建议与申诉'];

const STATUS_STYLE: Record<string, string> = {
  '待分拣': 'bg-amber-50 text-amber-700 border-amber-200',
  '跟进核实中': 'bg-blue-50 text-blue-700 border-blue-200',
  '已解决': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '不予受理': 'bg-slate-100 text-slate-600 border-slate-300',
};

export default function EchoHomePage() {
  const [activeTab, setActiveTab] = useState<'wall' | 'submit' | 'track'>('wall');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [content, setContent] = useState('');
  const [allowPublic, setAllowPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [searchCode, setSearchCode] = useState('');
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackError, setTrackError] = useState('');
  const [searching, setSearching] = useState(false);

  const [wallItems, setWallItems] = useState<any[]>([]);
  const [loadingWall, setLoadingWall] = useState(true);

  useEffect(() => {
    fetchWall();
  }, []);

  async function fetchWall() {
    setLoadingWall(true);
    const res = await fetch('/api/feedback');
    const json = await res.json();
    if (json.data) setWallItems(json.data);
    setLoadingWall(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category, content, allow_public: allowPublic }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (json.tracking_code) {
      setGeneratedCode(json.tracking_code);
      setTitle('');
      setContent('');
    } else {
      alert(json.error || '提交失败');
    }
  }

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!searchCode.trim()) return;
    setSearching(true);
    setTrackError('');
    setTrackResult(null);
    const res = await fetch(`/api/feedback?code=${encodeURIComponent(searchCode)}`);
    const json = await res.json();
    setSearching(false);
    if (res.ok && json.data) {
      setTrackResult(json.data);
    } else {
      setTrackError(json.error || '未找到对应记录');
    }
  }

  async function handleUpvote(id: string) {
    const res = await fetch('/api/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upvote', id }),
    });
    const json = await res.json();
    if (json.upvotes !== undefined) {
      setWallItems((prev) => prev.map((item) => (item.id === id ? { ...item, upvotes: json.upvotes } : item)));
    }
  }

  function copyCode() {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-900">ECHO 校园诉求与回音壁</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 text-white font-medium">100% 匿名保护</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">免登录投递 · 专属 6 位追踪码 · 跨部门限时响应公示</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('wall')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                activeTab === 'wall' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> 阳光回音壁
            </button>
            <button
              onClick={() => { setActiveTab('submit'); setGeneratedCode(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                activeTab === 'submit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-4 h-4" /> 匿名提诉求
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                activeTab === 'track' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4" /> 凭码查进度
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'wall' && (
          <div className="space-y-4">
            <div className="bg-slate-900 text-white rounded-xl p-5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-base">公开透明 · 每一条声音都有下落</h2>
                <p className="text-xs text-slate-300 mt-1">
                  以下为经提交人授权公开的典型诉求及部门正式答复。若您的诉求涉及个人隐私，请点击上方「凭码查进度」私密查阅。
                </p>
              </div>
              <button
                onClick={() => setActiveTab('submit')}
                className="shrink-0 bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-100 transition"
              >
                我要反馈
              </button>
            </div>

            {loadingWall ? (
              <div className="text-center py-16 text-slate-400 text-sm">正在加载回音壁数据...</div>
            ) : wallItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
                暂无公开公示的诉求，点击右上角「匿名提诉求」投递第一条反馈吧。
              </div>
            ) : (
              wallItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {item.tracking_code}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {item.category}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${STATUS_STYLE[item.status] || ''}`}>
                        {item.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      对接部门：{item.department} · {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-semibold text-base text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{item.content}</p>

                  {item.official_reply && (
                    <div className="bg-slate-50 border-l-4 border-slate-900 p-3.5 rounded-r-lg mt-3">
                      <div className="text-xs font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        [{item.department}] 官方答复：
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{item.official_reply}</p>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      onClick={() => handleUpvote(item.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> 我也有同感 ({item.upvotes || 0})
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'submit' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl mx-auto">
            {generatedCode ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">投递成功！请保存您的专属查询码</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  由于本系统采取零隐私收集机制（不绑定手机与邮箱），以下 6 位追踪码是您日后查询处理进度与官方回复的唯一凭证，请截图或复制保存：
                </p>
                <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-4 max-w-xs mx-auto flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold tracking-wider text-slate-900">{generatedCode}</span>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1 text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setSearchCode(generatedCode);
                      setActiveTab('track');
                    }}
                    className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg"
                  >
                    立即去查进度
                  </button>
                  <button
                    onClick={() => setGeneratedCode(null)}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2"
                  >
                    继续投递另一条
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-bold">匿名提交校园诉求</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    系统底层已关闭 IP 与设备指纹记录。请尽量客观具体地描述时间、地点与事实，以便相关部门快速核实。
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">诉求标题 *</label>
                  <input
                    type="text"
                    required
                    placeholder="例如：图书馆三楼东侧饮水机出水异味问题"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">所属分类 *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">具体经过与改进建议 *</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="请详细说明您遇到的问题、发生位置及您的合理诉求..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <label className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowPublic}
                    onChange={(e) => setAllowPublic(e.target.checked)}
                    className="mt-1 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800">允许脱敏后公开至「阳光回音壁」</span>
                    <p className="text-slate-500 mt-0.5">
                      若涉及个人隐私或敏感举报请取消勾选，取消后该工单仅您本人凭 6 位查询码可见。
                    </p>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  {submitting ? '正在加密投递...' : '提交并获取 6 位查询码'}
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === 'track' && (
          <div className="max-w-xl mx-auto space-y-6">
            <form onSubmit={handleTrack} className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
              <h2 className="text-lg font-bold">凭专属码追踪处理进度</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="输入查询码，如 ECHO-8K9P2A"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="flex-1 font-mono uppercase rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800"
                >
                  {searching ? '检索中...' : '立即查询'}
                </button>
              </div>
              {trackError && <p className="text-xs text-red-600">{trackError}</p>}
            </form>

            {trackResult && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="font-mono text-sm font-bold text-slate-900">{trackResult.tracking_code}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${STATUS_STYLE[trackResult.status] || ''}`}>
                    当前状态：{trackResult.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    受理部门：<strong className="text-slate-800">{trackResult.department}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    最后更新：{new Date(trackResult.updated_at).toLocaleString()}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-base">{trackResult.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{trackResult.content}</p>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="text-xs font-semibold text-slate-700 mb-1.5">官方正式答复：</div>
                  {trackResult.official_reply ? (
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3.5 text-sm text-slate-800 whitespace-pre-wrap">
                      {trackResult.official_reply}
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-3.5 text-xs text-slate-500">
                      您的诉求目前正在【{trackResult.department}】流转核实中，责任人将在核实完毕后第一时间在此更新正式答复，请稍后再来查看。
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}