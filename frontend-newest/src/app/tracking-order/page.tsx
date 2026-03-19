'use client';

import { useMemo, useState } from 'react';
import { Bike, CheckCircle2, Clock3, PackageCheck, Phone, Search } from 'lucide-react';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';

type Step = {
  key: string;
  label: string;
  detail: string;
};

const ORDER_STEPS: Step[] = [
  { key: 'PLACED', label: 'Order Placed', detail: 'Don hang da duoc tiep nhan.' },
  { key: 'PREPARING', label: 'Kitchen Preparing', detail: 'Bep dang chuan bi mon.' },
  { key: 'DELIVERING', label: 'Out for Delivery', detail: 'Tai xe dang giao den ban.' },
  { key: 'COMPLETED', label: 'Delivered', detail: 'Don hang da giao thanh cong.' },
];

const STATUS_INDEX: Record<string, number> = {
  PLACED: 0,
  PREPARING: 1,
  DELIVERING: 2,
  COMPLETED: 3,
};

const STATUS_KEYS = Object.keys(STATUS_INDEX);

function inferStatus(orderCode: string, phone: string): keyof typeof STATUS_INDEX {
  const codeDigit = Number(orderCode.replace(/\D/g, '').slice(-1) || '0');
  const phoneDigit = Number(phone.replace(/\D/g, '').slice(-1) || '0');
  const seed = (codeDigit + phoneDigit) % STATUS_KEYS.length;
  return STATUS_KEYS[seed] as keyof typeof STATUS_INDEX;
}

export default function TrackingOrderPage() {
  const [phone, setPhone] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const currentStatus = useMemo(() => {
    if (!submitted) return null;
    return inferStatus(orderCode, phone);
  }, [submitted, orderCode, phone]);

  const activeIndex = currentStatus ? STATUS_INDEX[currentStatus] : -1;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const trimmedPhone = phone.trim();
    const trimmedCode = orderCode.trim();

    if (!trimmedPhone || !trimmedCode) {
      setSubmitted(false);
      setError('Vui lòng nhập đầy đủ số điện thoại và đơn hàng.');
      return;
    }

    if (!/^\d{9,11}$/.test(trimmedPhone)) {
      setSubmitted(false);
      setError('Số điện thoại không hợp lệ (yêu cầu nhập 10 số).');
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#fff7ed]">
      <LandingHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
        <section className="grid gap-6 overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-[0_20px_50px_rgba(194,65,12,0.12)] md:grid-cols-[1.05fr_1fr]">
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-amber-400 p-8 text-white md:p-10">
            <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute -bottom-12 -left-6 h-40 w-40 rounded-full bg-orange-700/30 blur-2xl" />

            <div className="relative z-10 space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                <Clock3 className="h-4 w-4" />
                Real-time tracking
              </p>
              <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
                Theo doi don hang nhanh
                <br />
                va ro rang
              </h1>
              <p className="max-w-md text-sm text-orange-50 md:text-base">
                Nhap so dien thoai va ma don de xem trang thai moi nhat. Giao dien toi uu cho
                guest va customer, de check ngay tren mobile.
              </p>
              <div className="pt-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Phone className="h-4 w-4" />
                  Hotline ho tro: 1900-8888
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <h2 className="text-2xl font-bold text-slate-900">Tracking Order</h2>
            <p className="mt-1 text-sm text-slate-500">
              Kiem tra trang thai don hang theo ma don + so dien thoai.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">So dien thoai</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Nhap so dien thoai"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Ma don hang</span>
                <input
                  type="text"
                  value={orderCode}
                  onChange={(event) => setOrderCode(event.target.value)}
                  placeholder="VD: FD-2026-00125"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                <Search className="h-4 w-4" />
                Kiem tra don hang
              </button>
            </form>

            {error && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {submitted && currentStatus && (
              <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50/50 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">Order</p>
                    <p className="text-sm font-bold text-slate-900">{orderCode}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    {currentStatus}
                  </span>
                </div>

                <ul className="space-y-3">
                  {ORDER_STEPS.map((step, index) => {
                    const isDone = index <= activeIndex;
                    return (
                      <li
                        key={step.key}
                        className={`flex items-start gap-3 rounded-xl border p-3 ${
                          isDone
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        {step.key === 'DELIVERING' ? (
                          <Bike className={`mt-0.5 h-4 w-4 ${isDone ? 'text-emerald-600' : 'text-slate-400'}`} />
                        ) : step.key === 'COMPLETED' ? (
                          <PackageCheck
                            className={`mt-0.5 h-4 w-4 ${isDone ? 'text-emerald-600' : 'text-slate-400'}`}
                          />
                        ) : (
                          <CheckCircle2
                            className={`mt-0.5 h-4 w-4 ${isDone ? 'text-emerald-600' : 'text-slate-400'}`}
                          />
                        )}
                        <div>
                          <p className={`text-sm font-semibold ${isDone ? 'text-slate-900' : 'text-slate-500'}`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-slate-500">{step.detail}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}