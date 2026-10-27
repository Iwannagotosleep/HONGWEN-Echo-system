import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'ECHO-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const adminKey = request.headers.get('x-admin-key');

  if (adminKey) {
    if (adminKey !== process.env.ADMIN_SECRET_PASSWORD) {
      return NextResponse.json({ error: '管理员密码错误' }, { status: 401 });
    }
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (code) {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('tracking_code, title, category, content, status, department, official_reply, created_at, updated_at')
      .eq('tracking_code', code.trim().toUpperCase())
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '未找到该查询码对应的诉求，请检查输入是否正确' }, { status: 404 });
    }
    return NextResponse.json({ data });
  }

  const { data, error } = await supabase
    .from('feedbacks')
    .select('id, tracking_code, title, category, content, status, department, official_reply, upvotes, created_at, updated_at')
    .eq('allow_public', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, category, content, allow_public } = body;

  if (!title?.trim() || !content?.trim() || !category) {
    return NextResponse.json({ error: '请填写完整的标题、分类与诉求内容' }, { status: 400 });
  }

  const tracking_code = generateCode();

  const { data, error } = await supabase
    .from('feedbacks')
    .insert([
      {
        tracking_code,
        title: title.trim(),
        category,
        content: content.trim(),
        allow_public: allow_public ?? true,
      },
    ])
    .select('tracking_code')
    .single();

  if (error) return NextResponse.json({ error: '提交失败，请重试' }, { status: 500 });
  return NextResponse.json({ tracking_code: data.tracking_code });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const adminKey = request.headers.get('x-admin-key');

  if (body.action === 'upvote' && body.id) {
    const { data: current } = await supabase.from('feedbacks').select('upvotes').eq('id', body.id).single();
    const { data, error } = await supabase
      .from('feedbacks')
      .update({ upvotes: (current?.upvotes || 0) + 1 })
      .eq('id', body.id)
      .select('upvotes')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ upvotes: data.upvotes });
  }

  if (adminKey !== process.env.ADMIN_SECRET_PASSWORD) {
    return NextResponse.json({ error: '无权限操作' }, { status: 401 });
  }

  const { id, status, department, official_reply, is_featured } = body;
  const { error } = await supabase
    .from('feedbacks')
    .update({
      status,
      department,
      official_reply,
      is_featured,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}