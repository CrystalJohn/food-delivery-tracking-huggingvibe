'use client';

import { useMemo, useState, type ComponentType, type FormEvent } from 'react';
import Link from 'next/link';
import {
  Ban,
  BarChart3,
  Bell,
  Bike,
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  Eye,
  LayoutDashboard,
  Pencil,
  Plus,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/features/auth';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/components/ui';
import { useDriverManagement } from './useDriverManagement';
import type { CreateDriverRequest, DriverAccount } from './driver.service';

interface SidebarItem {
  label: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
}

interface CreateDriverFormState {
  email: string;
  fullName: string;
  phone: string;
  password: string;
  vehicleType: string;
  licensePlate: string;
}

interface CreateDriverFieldErrors {
  email?: string;
  fullName?: string;
  phone?: string;
  password?: string;
  vehicleType?: string;
  licensePlate?: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'Tong quan', icon: LayoutDashboard },
  { label: 'Quan ly nhan vien', href: '/admin/staffs', icon: Users },
  { label: 'Quan ly tai xe', href: '/admin/drivers', icon: Bike, active: true },
  { label: 'Quan ly thuc don', icon: ClipboardList },
  { label: 'Bao cao', icon: BarChart3 },
  { label: 'Cai dat', icon: Settings },
];

const INITIAL_FORM_STATE: CreateDriverFormState = {
  email: '',
  fullName: '',
  phone: '',
  password: '',
  vehicleType: '',
  licensePlate: '',
};

function getFirstFieldError(values?: string[]): string | undefined {
  return values && values.length > 0 ? values[0] : undefined;
}

function mapCreateDriverErrors(error: ApiError): CreateDriverFieldErrors {
  const fieldErrors: CreateDriverFieldErrors = {
    email: getFirstFieldError(error.errors?.email),
    fullName: getFirstFieldError(error.errors?.fullName ?? error.errors?.name),
    phone: getFirstFieldError(error.errors?.phone),
    password: getFirstFieldError(error.errors?.password),
    vehicleType: getFirstFieldError(error.errors?.vehicleType),
    licensePlate: getFirstFieldError(error.errors?.licensePlate),
  };

  if (error.statusCode === 409 && !fieldErrors.email) {
    fieldErrors.email = 'Email da ton tai trong he thong.';
  }

  return fieldErrors;
}

function getNameInitial(value: string): string {
  const normalized = value.trim();
  if (!normalized) return 'D';
  return normalized.charAt(0).toUpperCase();
}

function getStatusInfo(driver: DriverAccount): { label: string; className: string } {
  if (driver.isActive === false || driver.status?.toUpperCase() === 'INACTIVE') {
    return {
      label: 'Khong hoat dong',
      className: 'bg-slate-200 text-slate-600',
    };
  }

  return {
    label: driver.status ?? 'Hoat dong',
    className: 'bg-emerald-100 text-emerald-700',
  };
}

function getOnlineInfo(driver: DriverAccount): { label: string; className: string } {
  if (driver.isOnline === true) {
    return { label: 'Online', className: 'bg-emerald-100 text-emerald-700' };
  }
  if (driver.isOnline === false) {
    return { label: 'Offline', className: 'bg-amber-100 text-amber-700' };
  }
  return { label: '-', className: 'bg-slate-100 text-slate-500' };
}

function containsSearchTerm(driver: DriverAccount, searchTerm: string): boolean {
  const normalizedQuery = searchTerm.toLowerCase();
  return (
    driver.fullName.toLowerCase().includes(normalizedQuery) ||
    driver.email.toLowerCase().includes(normalizedQuery) ||
    driver.phone.toLowerCase().includes(normalizedQuery) ||
    (driver.licensePlate ?? '').toLowerCase().includes(normalizedQuery)
  );
}

export function DriverManagementPage() {
  const { user } = useAuth();
  const { drivers, loading, creating, error, createDriver, refetch } = useDriverManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DriverAccount | null>(null);
  const [formData, setFormData] = useState<CreateDriverFormState>(INITIAL_FORM_STATE);
  const [fieldErrors, setFieldErrors] = useState<CreateDriverFieldErrors>({});
  const [submitError, setSubmitError] = useState('');

  const filteredDrivers = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim();
    if (!normalizedSearchTerm) return drivers;
    return drivers.filter((driver) => containsSearchTerm(driver, normalizedSearchTerm));
  }, [searchTerm, drivers]);

  const adminDisplayName = user?.name || user?.email || 'Admin';

  const openCreateDialog = () => {
    setFieldErrors({});
    setSubmitError('');
    setFormData(INITIAL_FORM_STATE);
    setIsCreateDialogOpen(true);
  };

  const closeCreateDialog = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      setFieldErrors({});
      setSubmitError('');
      setFormData(INITIAL_FORM_STATE);
    }
  };

  const handleViewDriver = (driver: DriverAccount) => {
    setSelectedDriver(driver);
    setIsDetailDialogOpen(true);
  };

  const handleUnavailableAction = () => {
    toast.info('API cap nhat/xoa driver chua san sang. Hien tai chi ho tro Read va Create.');
  };

  const validateForm = (): boolean => {
    const nextErrors: CreateDriverFieldErrors = {};
    const emailValue = formData.email.trim();
    const fullNameValue = formData.fullName.trim();
    const phoneValue = formData.phone.trim();
    const vehicleTypeValue = formData.vehicleType.trim();
    const licensePlateValue = formData.licensePlate.trim();

    if (!emailValue) {
      nextErrors.email = 'Vui long nhap email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      nextErrors.email = 'Email chua dung dinh dang.';
    }

    if (!fullNameValue) {
      nextErrors.fullName = 'Vui long nhap ho ten.';
    } else if (fullNameValue.length < 2) {
      nextErrors.fullName = 'Ho ten can toi thieu 2 ky tu.';
    }

    if (!phoneValue) {
      nextErrors.phone = 'Vui long nhap so dien thoai.';
    } else if (!/^[0-9]{9,15}$/.test(phoneValue)) {
      nextErrors.phone = 'So dien thoai phai gom 9-15 chu so.';
    }

    if (!formData.password) {
      nextErrors.password = 'Vui long nhap mat khau.';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Mat khau can it nhat 6 ky tu.';
    }

    if (!vehicleTypeValue) {
      nextErrors.vehicleType = 'Vui long nhap loai xe.';
    }

    if (!licensePlateValue) {
      nextErrors.licensePlate = 'Vui long nhap bien so.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreateDriver = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    const payload: CreateDriverRequest = {
      email: formData.email.trim(),
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      vehicleType: formData.vehicleType.trim(),
      licensePlate: formData.licensePlate.trim(),
    };

    try {
      await createDriver(payload);
      toast.success(`Tao tai khoan tai xe cho ${payload.fullName} thanh cong.`);
      closeCreateDialog(false);
    } catch (err) {
      if (err instanceof ApiError) {
        const mappedErrors = mapCreateDriverErrors(err);
        setFieldErrors(mappedErrors);
        if (!Object.values(mappedErrors).some(Boolean)) {
          setSubmitError(err.message || 'Khong the tao tai khoan tai xe.');
        }
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Khong the tao tai khoan tai xe.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#eceef3] text-slate-800">
      <div className="grid min-h-screen lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#d8dbe2] bg-[#f4f5f8] lg:flex lg:flex-col">
          <div className="flex items-center justify-between border-b border-[#dde0e6] px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f97316] text-lg font-bold text-white">
                F
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-700">FoodGo</p>
                <p className="text-xs tracking-[0.2em] text-slate-500">ADMIN</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg p-1 text-slate-500 transition hover:bg-[#e6e8ee] hover:text-slate-700"
              aria-label="Thu gon menu quan tri"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-6">
            {SIDEBAR_ITEMS.map((item) => {
              const ItemIcon = item.icon;
              const itemClassName = `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                item.active
                  ? 'bg-[#f97316] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-[#eceef4]'
              }`;

              if (item.href) {
                return (
                  <Link key={item.label} href={item.href} className={itemClassName}>
                    <ItemIcon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={handleUnavailableAction}
                  className={itemClassName}
                >
                  <ItemIcon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="px-5 pb-6">
            <div className="h-7 w-7 rounded-full bg-slate-900" />
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-b border-[#d9dce3] bg-[#f5f6f8] px-4 py-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold text-slate-800">Quan ly tai xe</h1>
                <p className="text-sm text-slate-500">FoodGo Admin / Quan ly tai xe</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full p-2 text-slate-500 transition hover:bg-white hover:text-slate-700"
                  aria-label="Thong bao"
                >
                  <Bell className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3 rounded-2xl border border-[#dddfe5] bg-white px-3 py-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600">
                    {getNameInitial(adminDisplayName)}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-slate-700">{adminDisplayName}</p>
                    <p className="text-xs text-slate-500">Quan tri vien</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </div>
              </div>
            </div>
          </header>

          <div className="border-b border-[#d9dce3] bg-[#f5f6f8] px-4 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {SIDEBAR_ITEMS.map((item) => {
                const ItemIcon = item.icon;
                const itemClassName = `inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 text-sm ${
                  item.active
                    ? 'border-[#f97316] bg-orange-100 text-orange-700'
                    : 'border-[#d9dce3] bg-white text-slate-600'
                }`;

                if (item.href) {
                  return (
                    <Link key={`mobile-${item.label}`} href={item.href} className={itemClassName}>
                      <ItemIcon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                }

                return (
                  <button
                    key={`mobile-${item.label}`}
                    type="button"
                    onClick={handleUnavailableAction}
                    className={itemClassName}
                  >
                    <ItemIcon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
            <section className="rounded-2xl border border-transparent bg-transparent">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-4xl font-bold leading-tight text-slate-800">Quan ly tai xe</h2>
                  <p className="mt-2 text-lg text-slate-500">
                    Quan ly toan bo tai xe trong he thong
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={openCreateDialog}
                  className="h-11 rounded-2xl bg-[#f97316] px-6 text-base font-semibold text-white hover:bg-[#ea580c]"
                >
                  <Plus className="h-5 w-5" />
                  <span>Them tai xe</span>
                </Button>
              </div>

              <div className="mt-6 max-w-[520px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Tim theo ten, email, bien so..."
                    className="h-11 rounded-2xl border-[#d2d6dd] bg-white pl-10 text-sm"
                  />
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-[#d8dbe2] bg-white shadow-sm">
                <div className="max-h-[56vh] overflow-auto">
                  <table className="min-w-[980px] w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-[#f6f7f9] text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-4 font-semibold">Tai xe</th>
                        <th className="px-4 py-4 font-semibold">So dien thoai</th>
                        <th className="px-4 py-4 font-semibold">Loai xe</th>
                        <th className="px-4 py-4 font-semibold">Bien so</th>
                        <th className="px-4 py-4 font-semibold">Trang thai</th>
                        <th className="px-4 py-4 font-semibold">Online</th>
                        <th className="px-4 py-4 text-right font-semibold">Hanh dong</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && (
                        <tr>
                          <td
                            colSpan={7}
                            className="border-t border-[#eef0f4] px-4 py-10 text-center text-slate-500"
                          >
                            Dang tai danh sach tai xe...
                          </td>
                        </tr>
                      )}

                      {!loading && error && (
                        <tr>
                          <td
                            colSpan={7}
                            className="border-t border-[#eef0f4] px-4 py-10 text-center text-slate-500"
                          >
                            <p className="mb-3">{error}</p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                void refetch();
                              }}
                              className="rounded-xl"
                            >
                              Tai lai
                            </Button>
                          </td>
                        </tr>
                      )}

                      {!loading && !error && filteredDrivers.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="border-t border-[#eef0f4] px-4 py-10 text-center text-slate-500"
                          >
                            Khong tim thay tai xe phu hop.
                          </td>
                        </tr>
                      )}

                      {!loading &&
                        !error &&
                        filteredDrivers.map((driver, index) => {
                          const status = getStatusInfo(driver);
                          const online = getOnlineInfo(driver);
                          return (
                            <tr key={`${driver.userId || driver.email}-${index}`} className="hover:bg-[#fafbfc]">
                              <td className="border-t border-[#eef0f4] px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600">
                                    {getNameInitial(driver.fullName || driver.email)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-800">
                                      {driver.fullName || 'Chua cap nhat'}
                                    </p>
                                    <p className="text-xs text-slate-500">{driver.email || '-'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4 text-slate-700">
                                {driver.phone || '-'}
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4 text-slate-700">
                                {driver.vehicleType || '-'}
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4 text-slate-700">
                                {driver.licensePlate || '-'}
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                                >
                                  {status.label}
                                </span>
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${online.className}`}
                                >
                                  {online.label}
                                </span>
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleViewDriver(driver)}
                                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                    aria-label={`Xem ${driver.fullName || driver.email}`}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleUnavailableAction}
                                    className="rounded-md p-1.5 text-blue-500 transition hover:bg-blue-50 hover:text-blue-600"
                                    aria-label={`Cap nhat ${driver.fullName || driver.email}`}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleUnavailableAction}
                                    className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-600"
                                    aria-label={`Khoa ${driver.fullName || driver.email}`}
                                  >
                                    <Ban className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={closeCreateDialog}>
        <DialogContent className="sm:max-w-[600px] border-[#d9dce3] bg-white text-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Them tai xe</DialogTitle>
            <DialogDescription className="text-slate-500">
              Tao tai khoan tai xe moi bang endpoint POST /admin/drivers.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateDriver}>
            <div className="space-y-2">
              <Label htmlFor="driver-full-name">Ho va ten</Label>
              <Input
                id="driver-full-name"
                value={formData.fullName}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, fullName: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                placeholder="Nguyen Van Driver"
                className={`bg-white text-slate-900 ${fieldErrors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {fieldErrors.fullName && (
                <p className="text-xs text-red-600">{fieldErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-email">Email</Label>
              <Input
                id="driver-email"
                type="email"
                value={formData.email}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, email: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="driver1@gmail.com"
                className={`bg-white text-slate-900 ${fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-phone">So dien thoai</Label>
              <Input
                id="driver-phone"
                type="tel"
                value={formData.phone}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, phone: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="0908888888"
                className={`bg-white text-slate-900 ${fieldErrors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {fieldErrors.phone && <p className="text-xs text-red-600">{fieldErrors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-password">Mat khau</Label>
              <Input
                id="driver-password"
                type="password"
                value={formData.password}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, password: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Toi thieu 6 ky tu"
                className={`bg-white text-slate-900 ${fieldErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-vehicle">Loai xe</Label>
              <Input
                id="driver-vehicle"
                value={formData.vehicleType}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, vehicleType: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, vehicleType: undefined }));
                }}
                placeholder="Motorbike"
                className={`bg-white text-slate-900 ${fieldErrors.vehicleType ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {fieldErrors.vehicleType && (
                <p className="text-xs text-red-600">{fieldErrors.vehicleType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-license">Bien so</Label>
              <Input
                id="driver-license"
                value={formData.licensePlate}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, licensePlate: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, licensePlate: undefined }));
                }}
                placeholder="59A1-12345"
                className={`bg-white text-slate-900 ${fieldErrors.licensePlate ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {fieldErrors.licensePlate && (
                <p className="text-xs text-red-600">{fieldErrors.licensePlate}</p>
              )}
            </div>

            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {submitError}
              </div>
            )}

            <DialogFooter className="gap-2 pt-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => closeCreateDialog(false)}
              >
                Huy
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-[#f97316] text-white hover:bg-[#ea580c]"
              >
                {creating ? 'Dang tao...' : 'Tao tai khoan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[480px] border-[#d9dce3] bg-white text-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Thong tin tai xe</DialogTitle>
            <DialogDescription className="text-slate-500">
              Thong tin chi tiet tu danh sach tai xe hien tai.
            </DialogDescription>
          </DialogHeader>

          {selectedDriver && (
            <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Ho va ten</span>
                <span className="font-medium text-slate-800">{selectedDriver.fullName || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-800">{selectedDriver.email || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">So dien thoai</span>
                <span className="font-medium text-slate-800">{selectedDriver.phone || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Loai xe</span>
                <span className="font-medium text-slate-800">{selectedDriver.vehicleType || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Bien so</span>
                <span className="font-medium text-slate-800">{selectedDriver.licensePlate || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Trang thai</span>
                <span className="font-medium text-slate-800">{selectedDriver.status || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Online</span>
                <span className="font-medium text-slate-800">
                  {selectedDriver.isOnline == null ? '-' : selectedDriver.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Dong
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
