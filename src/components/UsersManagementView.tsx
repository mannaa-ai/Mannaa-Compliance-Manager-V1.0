import React, { useState, useEffect } from 'react';
import type { UserAccount, UserRole } from '../types';
import type { Language } from '../utils/i18n';
import { ROLE_LABELS, getStoredUsers, saveStoredUsers, createUserAccount } from '../utils/auth';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  KeyRound, 
  Trash2, 
  RotateCcw, 
  Check, 
  X, 
  AlertCircle,
  Search,
  Lock,
  Mail,
  User
} from 'lucide-react';

interface UsersManagementViewProps {
  currentUser: { name: string; role: string; email: string };
  lang: Language;
  theme: 'dark' | 'light';
}

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({
  currentUser,
  lang,
  theme
}) => {
  const isRtl = lang === 'ar';

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State for new user
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('COMPLIANCE_ASSESSOR');
  const [newPassword, setNewPassword] = useState('AnmatUser2026!');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const list = await getStoredUsers();
    setUsers(list);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    try {
      if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
        throw new Error('Please fill in all mandatory fields.');
      }

      await createUserAccount(newEmail, newName, newRole, newPassword);
      await loadUsers();

      setIsCreateModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('AnmatUser2026!');
      setNewRole('COMPLIANCE_ASSESSOR');

      setNotification({
        type: 'success',
        text: isRtl ? 'تم إنشاء الحساب بنجاح! سيُطلب من المستخدم إعداد التحقق الثنائي MFA عند تسجيل الدخول الأول.' : 'User account created successfully! The user will configure MFA upon first sign-in.'
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err.message || 'Failed to create user.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleUserStatus = (email: string) => {
    if (email.toLowerCase() === currentUser.email.toLowerCase()) {
      alert(isRtl ? 'لا يمكنك تعطيل حسابك الحالي.' : 'You cannot deactivate your own logged-in account.');
      return;
    }

    const updated = users.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    });

    saveStoredUsers(updated);
    setUsers(updated);
  };

  const handleResetMfa = (email: string) => {
    if (!confirm(isRtl ? 'هل أنت متأكد من رغبتك في إعادة تعيين التحقق الثنائي MFA لهذا المستخدم؟' : 'Are you sure you want to reset MFA for this user? They will be prompted to scan a new QR code on next sign-in.')) {
      return;
    }

    const updated = users.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, mfaEnabled: false };
      }
      return u;
    });

    saveStoredUsers(updated);
    setUsers(updated);

    setNotification({
      type: 'success',
      text: isRtl ? 'تمت إعادة تعيين التحقق الثنائي MFA بنجاح.' : 'MFA successfully reset for this user.'
    });
  };

  const handleDeleteUser = (email: string) => {
    if (email.toLowerCase() === currentUser.email.toLowerCase()) {
      alert(isRtl ? 'لا يمكنك حذف حسابك الحالي.' : 'You cannot delete your own logged-in account.');
      return;
    }

    if (!confirm(isRtl ? 'هل أنت متأكد من حذف هذا المستخدم نهائياً؟' : 'Are you sure you want to permanently delete this user account?')) {
      return;
    }

    const updated = users.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    saveStoredUsers(updated);
    setUsers(updated);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="p-6 space-y-6 max-w-7xl mx-auto font-['Cairo'] transition-colors duration-300"
    >
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-wrap items-center justify-between gap-4 ${
        theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black">
              {isRtl ? 'إدارة المستخدمين والصلاحيات' : 'Team & Access Management'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl ? 'إنشاء حسابات المقيّمين والمدققين وإدارة مفاتيح الأمان والتحقق الثنائي MFA' : 'Manage assessor accounts, role permissions, and reset MFA security keys.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isRtl ? 'إضافة مستخدم جديد' : 'Add New Assessor'}</span>
        </button>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500' 
            : 'bg-rose-500/15 border-rose-500/40 text-rose-500'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="cursor-pointer text-slate-400 hover:text-slate-200">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
        theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} />
          <input
            type="text"
            placeholder={isRtl ? 'ابحث بالاسم، البريد الإلكتروني، أو الدور...' : 'Search by name, email, or role...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-xl py-2 text-xs focus:outline-none focus:border-emerald-500 transition border ${
              isRtl ? 'pr-9 pl-3.5' : 'pl-9 pr-3.5'
            } ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />
        </div>
        <div className="text-xs font-bold text-slate-400">
          {isRtl ? `إجمالي المستخدمين: ${users.length}` : `Total Accounts: ${users.length}`}
        </div>
      </div>

      {/* Users Table */}
      <div className={`border rounded-3xl overflow-hidden shadow-sm ${
        theme === 'dark' ? 'bg-[#0d1522] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className={`border-b font-bold uppercase tracking-wider text-[11px] ${
              theme === 'dark' ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <tr>
                <th className="p-4">{isRtl ? 'المستخدم' : 'Assessor & Name'}</th>
                <th className="p-4">{isRtl ? 'الدور والصلاحيات' : 'Assigned Role'}</th>
                <th className="p-4">{isRtl ? 'حالة الأمان والتحقق MFA' : 'MFA Security'}</th>
                <th className="p-4">{isRtl ? 'حالة الحساب' : 'Account Status'}</th>
                <th className="p-4 text-center">{isRtl ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-medium">
              {filteredUsers.map((u) => {
                const roleInfo = ROLE_LABELS[u.role] || { en: u.role, ar: u.role, desc: '' };
                const isCurrent = u.email.toLowerCase() === currentUser.email.toLowerCase();

                return (
                  <tr key={u.email} className={`transition ${
                    theme === 'dark' ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'
                  }`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                {isRtl ? 'أنت' : 'You'}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-[11px]">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div>
                        <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 inline-block">
                          {isRtl ? roleInfo.ar : roleInfo.en}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1 max-w-[200px]">{roleInfo.desc}</div>
                      </div>
                    </td>

                    <td className="p-4">
                      {u.mfaEnabled ? (
                        <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
                          <ShieldCheck className="w-4 h-4" />
                          <span>{isRtl ? 'مفعل (TOTP)' : 'Active (TOTP)'}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                          <KeyRound className="w-4 h-4" />
                          <span>{isRtl ? 'بانتظار الإعداد' : 'Pending First Scan'}</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleUserStatus(u.email)}
                        disabled={isCurrent}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                          u.isActive
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30'
                            : 'bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-emerald-500/10 hover:text-emerald-500'
                        } ${isCurrent ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {u.isActive ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'معطل' : 'Disabled')}
                      </button>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleResetMfa(u.email)}
                          title={isRtl ? 'إعادة تعيين التحقق الثنائي MFA' : 'Reset MFA Key'}
                          className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-400/40 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.email)}
                          disabled={isCurrent}
                          title={isRtl ? 'حذف الحساب' : 'Delete Account'}
                          className={`p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-400/40 transition ${
                            isCurrent ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal: Create New User Account */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 ${
            theme === 'dark' ? 'bg-[#0d1522] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-sm">
                <UserPlus className="w-4 h-4 text-emerald-500" />
                <span>{isRtl ? 'إنشاء حساب مقيّم / مدقق جديد' : 'Create Assessor Account'}</span>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold mb-1">{isRtl ? 'الاسم الكامل' : 'Full Name'}</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sara Ahmed"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-xl py-2 pl-10 pr-3.5 text-xs bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="sara@anmat.sa"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded-xl py-2 pl-10 pr-3.5 text-xs bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">{isRtl ? 'الدور والصلاحيات' : 'Role & Permissions'}</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full rounded-xl py-2.5 px-3 text-xs bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="COMPLIANCE_ASSESSOR">{isRtl ? 'مقيّم امتثال ورقابة (Compliance Assessor)' : 'Compliance Assessor (Evaluate Controls & Findings)'}</option>
                  <option value="LEAD_AUDITOR">{isRtl ? 'كبير المدققين (Lead Auditor)' : 'Lead Auditor (Full Assessment & Reports)'}</option>
                  <option value="EVIDENCE_CONTRIBUTOR">{isRtl ? 'مسؤول جمع الأدلة (Evidence Contributor)' : 'Evidence Contributor (Upload Docs Only)'}</option>
                  <option value="AUDITOR_OBSERVER">{isRtl ? 'مراقب / إدارة عليا (Auditor Observer - Read Only)' : 'Auditor Observer (Read-Only View & Analytics)'}</option>
                  <option value="ADMIN">{isRtl ? 'مدير نظام كامل (System Administrator)' : 'System Administrator (Full Settings & User Mgmt)'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">{isRtl ? 'كلمة المرور الأولية المؤقتة' : 'Initial Password'}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl py-2 pl-10 pr-3.5 text-xs bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isRtl ? 'سيتوجب على المستخدم مسح رمز الاستجابة السريعة (QR) لإعداد التحقق الثنائي MFA عند الدخول.' : 'The user will scan the MFA QR Code in Google Authenticator upon their first sign-in.'}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg cursor-pointer"
                >
                  {isSubmitting ? (isRtl ? 'جاري الإنشاء...' : 'Creating...') : (isRtl ? 'إنشاء الحساب' : 'Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
