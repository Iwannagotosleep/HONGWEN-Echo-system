'use client';

import React, { useState } from 'react';
import { Lock, Save, RefreshCw, Eye, EyeOff } from 'lucide-react';

const DEPARTMENTS = ['待分配', '学生会秘书处', '学生权益与生活部', '学术与课程委员会', '校园设施与后勤对接组', '社团与活动部'];
const STATUSES = ['待分拣', '跟进核实中', '已解决', '不予受理'];

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [filterDept, setFilterDept] = useState('全部');
  const [savingId, setSavingId] = useState<string | null>(null);

  async function loadAll(key = adminKey) {
    const res = await fetch('/api/feedback', {
      headers: { 'x-admin-key': key },
    });
    if (res.ok) {
      const json = await res.json();
      setItems(json.data || []);
      setAuthenticated(true);
    } else {
      alert('管理密码错误');
    }
  }

  async function handleSave(item: any) {
    setSavingId(item.id);
    const res = await fetch('/api/feedback', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
      body: JSON.stringify({
        id: item.id,
        status: item.status,
        department: item.department,
        official_reply: item.official_reply,
        is_featured: item.is_featured,
      }),
    });
    setSavingId(null);
    if (!res.ok) alert('保存失败');
  }

  function updateField(id: string, field: string, value: any) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 w-full max-w-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Lock className="w-5 h-5" /> ECHO 内部部门流转后台
          </div>
          <input
            type="password"
            placeholder="请输入管理员口令"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            onClick={() => loadAll()}
            className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-semibold"
          >
            进入工作台
          </button>
        </div>
      </div>
    );
  }

  const filtered = filterDept === '全部' ? items : items.filter((i) => i.department === filterDept);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
          <div>
            <h1 className="font-bold text-lg">ECHO 多部门工单分流工作台</h1>
            <p className="text-xs text-slate-500">共 {items.length} 条反馈 · 修改后请点击对应卡片右下角的「保存更新」</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white"
            >
              <option value="全部">查看全部部门</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <button
              onClick={() => loadAll()}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-sm"
            >
              <RefreshCw className="w-4 h-4" /> 刷新
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold bg-slate-100 px-2 py-0.5 rounded">{item.tracking_code}</span>
                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">{item.category}</span>
                  <span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${item.allow_public ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {item.allow_public ? '学生允许公开' : '🔒 学生要求私密处理（不可上墙）'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base">{item.title}</h3>
                <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{item.content}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">流转部门</label>
                  <select
                    value={item.department}
                    onChange={(e) => updateField(item.id, 'department', e.target.value)}
                    className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-sm bg-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">处理状态</label>
                  <select
                    value={item.status}
                    onChange={(e) => updateField(item.id, 'status', e.target.value)}
                    className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-sm bg-white"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <label className={`flex items-center gap-2 text-xs font-semibold p-2 rounded border w-full cursor-pointer ${
                    !item.allow_public ? 'opacity-40 pointer-events-none bg-slate-100' : 'bg-white border-slate-300'
                  }`}>
                    <input
                      type="checkbox"
                      disabled={!item.allow_public}
                      checked={item.is_featured}
                      onChange={(e) => updateField(item.id, 'is_featured', e.target.checked)}
                    />
                    {item.is_featured ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                    精选并展示在公开回音壁
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">官方正式答复（保存后学生即可凭码或在回音壁查看到）</label>
                <textarea
                  rows={3}
                  placeholder="填写核实情况、解决方案与预计完成时间..."
                  value={item.official_reply || ''}
                  onChange={(e) => updateField(item.id, 'official_reply', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave(item)}
                  disabled={savingId === item.id}
                  className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingId === item.id ? '正在保存...' : '保存更新'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}