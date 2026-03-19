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
import { useStaffManagement } from './useStaffManagement';
import type { CreateStaffRequest, StaffAccount } from './staff.service';

interface SidebarItem {
  label: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
}

interface CreateStaffFormState {
  email: string;
  fullName: string;
  phone: string;
  password: string;
}

interface CreateStaffFieldErrors {
  email?: string;
  fullName?: string;
  phone?: string;
  password?: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'Tổng quan', icon: LayoutDashboard },
  { label: 'Quản lý nhân viên', href: '/admin/staffs', icon: Users, active: true },
  { label: 'Quản lý tài xế', icon: Bike },
  { label: 'Quản lý thực đơn', icon: ClipboardList },
  { label: 'Báo cáo', icon: BarChart3 },
  { label: 'Cài đặt', icon: Settings },
];

const INITIAL_FORM_STATE: CreateStaffFormState = {
  email: '',
  fullName: '',
  phone: '',
  password: '',
};

function getFirstFieldError(values?: string[]): string | undefined {
  return values && values.length > 0 ? values[0] : undefined;
}

function mapCreateStaffErrors(error: ApiError): CreateStaffFieldErrors {
  const fieldErrors: CreateStaffFieldErrors = {
    email: getFirstFieldError(error.errors?.email),
    fullName: getFirstFieldError(error.errors?.fullName ?? error.errors?.name),
    phone: getFirstFieldError(error.errors?.phone),
    password: getFirstFieldError(error.errors?.password),
  };

  if (error.statusCode === 409 && !fieldErrors.email) {
    fieldErrors.email = 'Email đã tồn tại trong hệ thống.';
  }

  return fieldErrors;
}

function getNameInitial(value: string): string {
  const normalized = value.trim();
  if (!normalized) return 'S';
  return normalized.charAt(0).toUpperCase();
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('vi-VN').format(date);
}

function mapRoleLabel(role: string): string {
  if (role === 'ADMIN') return 'Quản lý';
  if (role === 'STAFF') return 'Nhân viên';
  return role;
}

function getStatusInfo(staff: StaffAccount): { label: string; className: string } {
  if (!staff.userIsActive) {
    return {
      label: 'Tạm khóa',
      className: 'bg-red-100 text-red-600',
    };
  }

  if (!staff.isActive) {
    return {
      label: 'Không hoạt động',
      className: 'bg-slate-200 text-slate-600',
    };
  }

  return {
    label: 'Hoạt động',
    className: 'bg-emerald-100 text-emerald-700',
  };
}

function containsSearchTerm(staff: StaffAccount, searchTerm: string): boolean {
  const normalizedQuery = searchTerm.toLowerCase();
  return (
    staff.fullName.toLowerCase().includes(normalizedQuery) ||
    staff.email.toLowerCase().includes(normalizedQuery) ||
    staff.phone.toLowerCase().includes(normalizedQuery)
  );
}

export function StaffManagementPage() {
  const { user } = useAuth();
  const { staffs, loading, creating, error, createStaff, refetch } = useStaffManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffAccount | null>(null);
  const [formData, setFormData] = useState<CreateStaffFormState>(INITIAL_FORM_STATE);
  const [fieldErrors, setFieldErrors] = useState<CreateStaffFieldErrors>({});
  const [submitError, setSubmitError] = useState('');

  const filteredStaffs = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim();
    if (!normalizedSearchTerm) return staffs;
    return staffs.filter((staff) => containsSearchTerm(staff, normalizedSearchTerm));
  }, [searchTerm, staffs]);

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

  const handleViewStaff = (staff: StaffAccount) => {
    setSelectedStaff(staff);
    setIsDetailDialogOpen(true);
  };

  const handleUnavailableAction = () => {
    toast.info('API cập nhật/xóa staff chưa sẵn sàng. Hiện tại đang hỗ trợ Read và Create.');
  };

  const validateForm = (): boolean => {
    const nextErrors: CreateStaffFieldErrors = {};
    const emailValue = formData.email.trim();
    const fullNameValue = formData.fullName.trim();
    const phoneValue = formData.phone.trim();

    if (!emailValue) {
      nextErrors.email = 'Vui lòng nhập email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      nextErrors.email = 'Email chưa đúng định dạng.';
    }

    if (!fullNameValue) {
      nextErrors.fullName = 'Vui lòng nhập họ tên.';
    } else if (fullNameValue.length < 2) {
      nextErrors.fullName = 'Họ tên cần tối thiểu 2 ký tự.';
    }

    if (!phoneValue) {
      nextErrors.phone = 'Vui lòng nhập số điện thoại.';
    } else if (!/^[0-9]{9,15}$/.test(phoneValue)) {
      nextErrors.phone = 'Số điện thoại phải gồm 9-15 chữ số.';
    }

    if (!formData.password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu.';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Mật khẩu cần ít nhất 6 ký tự.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreateStaff = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    const payload: CreateStaffRequest = {
      email: formData.email.trim(),
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
    };

    try {
      await createStaff(payload);
      toast.success(`Tạo tài khoản nhân viên cho ${payload.fullName} thành công.`);
      closeCreateDialog(false);
    } catch (err) {
      if (err instanceof ApiError) {
        const mappedErrors = mapCreateStaffErrors(err);
        setFieldErrors(mappedErrors);
        if (!Object.values(mappedErrors).some(Boolean)) {
          setSubmitError(err.message || 'Không thể tạo tài khoản nhân viên.');
        }
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Không thể tạo tài khoản nhân viên.');
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
              aria-label="Thu gọn menu quản trị"
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
                <h1 className="text-lg font-semibold text-slate-800">Quản lý nhân viên</h1>
                <p className="text-sm text-slate-500">FoodGo Admin / Quản lý nhân viên</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full p-2 text-slate-500 transition hover:bg-white hover:text-slate-700"
                  aria-label="Thông báo"
                >
                  <Bell className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3 rounded-2xl border border-[#dddfe5] bg-white px-3 py-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600">
                    {getNameInitial(adminDisplayName)}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-slate-700">{adminDisplayName}</p>
                    <p className="text-xs text-slate-500">Quản trị viên</p>
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
                  <h2 className="text-4xl font-bold leading-tight text-slate-800">Quản lý nhân viên</h2>
                  <p className="mt-2 text-lg text-slate-500">
                    Quản lý toàn bộ nhân viên trong hệ thống
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={openCreateDialog}
                  className="h-11 rounded-2xl bg-[#f97316] px-6 text-base font-semibold text-white hover:bg-[#ea580c]"
                >
                  <Plus className="h-5 w-5" />
                  <span>Thêm nhân viên</span>
                </Button>
              </div>

              <div className="mt-6 max-w-[520px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Tìm theo tên, email..."
                    className="h-11 rounded-2xl border-[#d2d6dd] bg-white pl-10 text-sm"
                  />
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-[#d8dbe2] bg-white shadow-sm">
                <div className="max-h-[56vh] overflow-auto">
                  <table className="min-w-[980px] w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-[#f6f7f9] text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-4 font-semibold">Nhân viên</th>
                        <th className="px-4 py-4 font-semibold">Số điện thoại</th>
                        <th className="px-4 py-4 font-semibold">Vai trò</th>
                        <th className="px-4 py-4 font-semibold">Trạng thái</th>
                        <th className="px-4 py-4 font-semibold">Ngày tạo</th>
                        <th className="px-4 py-4 text-right font-semibold">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && (
                        <tr>
                          <td
                            colSpan={6}
                            className="border-t border-[#eef0f4] px-4 py-10 text-center text-slate-500"
                          >
                            Đang tải danh sách nhân viên...
                          </td>
                        </tr>
                      )}

                      {!loading && error && (
                        <tr>
                          <td
                            colSpan={6}
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
                              Tải lại
                            </Button>
                          </td>
                        </tr>
                      )}

                      {!loading && !error && filteredStaffs.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="border-t border-[#eef0f4] px-4 py-10 text-center text-slate-500"
                          >
                            Không tìm thấy nhân viên phù hợp.
                          </td>
                        </tr>
                      )}

                      {!loading &&
                        !error &&
                        filteredStaffs.map((staff, index) => {
                          const status = getStatusInfo(staff);
                          return (
                            <tr key={`${staff.userId || staff.email}-${index}`} className="hover:bg-[#fafbfc]">
                              <td className="border-t border-[#eef0f4] px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600">
                                    {getNameInitial(staff.fullName || staff.email)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-800">
                                      {staff.fullName || 'Chưa cập nhật'}
                                    </p>
                                    <p className="text-xs text-slate-500">{staff.email || '-'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4 text-slate-700">
                                {staff.phone || '-'}
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4 text-slate-700">
                                {mapRoleLabel(staff.role)}
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                                >
                                  {status.label}
                                </span>
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4 text-slate-600">
                                {formatDate(staff.createdAt)}
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleViewStaff(staff)}
                                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                    aria-label={`Xem ${staff.fullName || staff.email}`}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleUnavailableAction}
                                    className="rounded-md p-1.5 text-blue-500 transition hover:bg-blue-50 hover:text-blue-600"
                                    aria-label={`Cập nhật ${staff.fullName || staff.email}`}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleUnavailableAction}
                                    className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-600"
                                    aria-label={`Khóa ${staff.fullName || staff.email}`}
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
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Thêm nhân viên</DialogTitle>
            <DialogDescription>
              Tạo tài khoản nhân viên mới bằng endpoint POST /admin/staffs.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateStaff}>
            <div className="space-y-2">
              <Label htmlFor="staff-full-name">Họ và tên</Label>
              <Input
                id="staff-full-name"
                value={formData.fullName}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, fullName: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                placeholder="Nguyen Van Staff"
                className={fieldErrors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {fieldErrors.fullName && (
                <p className="text-xs text-red-600">{fieldErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-email">Email</Label>
              <Input
                id="staff-email"
                type="email"
                value={formData.email}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, email: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="staff1@gmail.com"
                className={fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-phone">Số điện thoại</Label>
              <Input
                id="staff-phone"
                type="tel"
                value={formData.phone}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, phone: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="09012393659"
                className={fieldErrors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {fieldErrors.phone && <p className="text-xs text-red-600">{fieldErrors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-password">Mật khẩu</Label>
              <Input
                id="staff-password"
                type="password"
                value={formData.password}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, password: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Tối thiểu 6 ký tự"
                className={fieldErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-600">{fieldErrors.password}</p>
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
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-[#f97316] text-white hover:bg-[#ea580c]"
              >
                {creating ? 'Đang tạo...' : 'Tạo tài khoản'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Thông tin nhân viên</DialogTitle>
            <DialogDescription>Thông tin chi tiết từ danh sách staff hiện tại.</DialogDescription>
          </DialogHeader>

          {selectedStaff && (
            <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Họ và tên</span>
                <span className="font-medium text-slate-800">{selectedStaff.fullName || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-800">{selectedStaff.email || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Số điện thoại</span>
                <span className="font-medium text-slate-800">{selectedStaff.phone || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Vai trò</span>
                <span className="font-medium text-slate-800">{mapRoleLabel(selectedStaff.role)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Ngày tạo</span>
                <span className="font-medium text-slate-800">{formatDate(selectedStaff.createdAt)}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
