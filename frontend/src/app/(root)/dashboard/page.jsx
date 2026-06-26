"use client";
import { UserSlicePath } from '@/app/redux/slices/UserSlice';
import Link from 'next/link';
import React from 'react';
import { CiSquareInfo, CiUser } from 'react-icons/ci';
import { FaCircleUser } from 'react-icons/fa6';
import {
  IoAddCircleOutline,
  IoCardOutline,
  IoCheckmarkDoneCircleOutline,
  IoHeartOutline,
  IoLocationOutline,
  IoSparklesOutline,
} from 'react-icons/io5';
import { MdCategory, MdDashboard, MdOutlineExplore } from 'react-icons/md';
import { RxGear } from 'react-icons/rx';
import { useSelector } from 'react-redux';

const roleLabels = {
  user: 'Couple dashboard',
  vendor: 'Vendor dashboard',
  admin: 'Admin dashboard',
};

const formatNumber = (value) => Number(value || 0).toLocaleString();
const formatBdt = (value) => `BDT ${formatNumber(value)}`;

const Dashboard = () => {
  const user = useSelector(UserSlicePath);
  const role = user?.role || 'user';
  const dashboard = user?.dashboard || {};
  const checklistTotal = dashboard.total_checklist_items || 0;
  const checklistDone = dashboard.completed_checklist_items || 0;
  const checklistPercent = checklistTotal ? Math.round((checklistDone / checklistTotal) * 100) : 0;
  const actualBudget = dashboard.actual_budget || 0;
  const estimatedBudget = dashboard.estimated_budget || 0;
  const budgetPercent = estimatedBudget ? Math.min(100, Math.round((actualBudget / estimatedBudget) * 100)) : 0;

  const cards = {
    user: [
      { heading: 'Booking Requests', count: dashboard.total_enquries ?? 0, Icon: CiSquareInfo, helper: 'Requests sent to vendors' },
      { heading: 'Budget Items', count: dashboard.total_budget_items ?? 0, Icon: IoCardOutline, helper: 'Tracked expense categories' },
      { heading: 'Checklist Done', count: `${checklistDone}/${checklistTotal}`, Icon: IoCheckmarkDoneCircleOutline, helper: `${checklistPercent}% completed` },
      { heading: 'AI Matches', count: dashboard.total_matches ?? 0, Icon: IoHeartOutline, helper: 'Saved compatibility runs' },
    ],
    vendor: [
      { heading: 'Total Services', count: dashboard.total_services ?? 0, Icon: RxGear, helper: 'Packages listed by you' },
      { heading: 'Booking Requests', count: dashboard.total_enquries ?? 0, Icon: CiSquareInfo, helper: 'Customer enquiries for your services' },
    ],
    admin: [
      { heading: 'Total Users', count: dashboard.total_users ?? 0, Icon: CiUser, helper: 'All registered accounts' },
      { heading: 'Categories', count: dashboard.total_categories ?? 0, Icon: MdCategory, helper: 'Public service categories' },
      { heading: 'Services', count: dashboard.total_service ?? 0, Icon: RxGear, helper: 'Vendor service listings' },
      { heading: 'Vendors', count: dashboard.total_vendors ?? 0, Icon: FaCircleUser, helper: 'Registered vendor accounts' },
      { heading: 'Enquiries', count: dashboard.total_enquries ?? 0, Icon: CiSquareInfo, helper: 'All booking requests' },
      { heading: 'AI Matches', count: dashboard.total_matches ?? 0, Icon: IoHeartOutline, helper: 'Matchmaker records' },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="bg-white border border-zinc-200 rounded-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <p className="text-sm font-pmedium text-logo uppercase tracking-wider">{roleLabels[role] || 'Dashboard'}</p>
            <h1 className="text-3xl md:text-4xl text-zinc-950 font-psmbold mt-2">
              Welcome, {user?.name || 'WeddingSphere member'}
            </h1>
            <p className="text-zinc-500 mt-2 max-w-2xl">
              Track bookings, vendors, planning tools, and database activity from one clear place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <QuickLink href="/service" label="Book Vendors" Icon={MdOutlineExplore} />
            <QuickLink href="/profile" label="Update Profile" Icon={CiUser} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mt-6">
        {(cards[role] || cards.user).map((cur, i) => (
          <DashboardCard key={i} data={cur} />
        ))}
      </section>

      {role === 'user' && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <ProgressPanel
            title="Budget Progress"
            value={budgetPercent}
            headline={`${formatBdt(actualBudget)} spent`}
            helper={`${formatBdt(estimatedBudget)} estimated across your saved categories`}
          />
          <ProgressPanel
            title="Checklist Progress"
            value={checklistPercent}
            headline={`${checklistDone} of ${checklistTotal} tasks done`}
            helper="Complete venue, decor, catering, photography, and family coordination tasks."
          />
          <ActionPanel
            title="Planning Shortcuts"
            actions={[
              { href: '/budget', label: 'Open Budget Maker', Icon: IoCardOutline },
              { href: '/checklist', label: 'Open Checklist', Icon: IoCheckmarkDoneCircleOutline },
              { href: '/matchmaker', label: 'Run AI Matchmaker', Icon: IoSparklesOutline },
              { href: '/my-enquiries', label: 'View My Bookings', Icon: CiSquareInfo },
            ]}
          />
        </section>
      )}

      {role === 'vendor' && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActionPanel
            title="Vendor Actions"
            actions={[
              { href: '/services/create', label: 'Create Service Package', Icon: IoAddCircleOutline },
              { href: '/services', label: 'Manage Services', Icon: RxGear },
              { href: '/queries', label: 'Attend Booking Requests', Icon: CiSquareInfo },
            ]}
          />
          <InfoPanel
            title="Booking Tip"
            icon={<IoLocationOutline />}
            text="Keep service location, phone number, gallery, price, and package sections complete so couples can book with confidence."
          />
        </section>
      )}

      {role === 'admin' && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActionPanel
            title="Admin Actions"
            actions={[
              { href: '/categories', label: 'Manage Categories', Icon: MdCategory },
              { href: '/admin/users', label: 'Manage Users & Vendors', Icon: CiUser },
              { href: '/admin/services', label: 'Manage Services', Icon: RxGear },
              { href: '/admin/enquiries', label: 'Manage Enquiries', Icon: CiSquareInfo },
            ]}
          />
          <InfoPanel
            title="Database Status"
            icon={<RxGear />}
            text="Dashboard numbers are calculated from MongoDB models: users, vendors, services, categories, enquiries, budgets, checklists, and matchmaker records."
          />
        </section>
      )}
    </div>
  );
};

export default Dashboard;

const DashboardCard = ({ data }) => (
  <div className="p-5 bg-white border border-zinc-200 rounded-md flex items-start justify-between gap-4">
    <div className="w-12 h-12 rounded-md bg-orange-50 text-logo flex items-center justify-center shrink-0">
      <data.Icon className="text-3xl" />
    </div>
    <div className="flex items-end flex-col justify-center gap-y-1 text-right">
      <h2 className="text-base font-psmbold text-zinc-900">{data.heading}</h2>
      <p className="text-2xl font-pmedium text-zinc-950">{typeof data.count === 'number' ? formatNumber(data.count) : data.count}</p>
      <p className="text-xs text-zinc-500">{data.helper}</p>
    </div>
  </div>
);

const QuickLink = ({ href, label, Icon }) => (
  <Link href={href} className="inline-flex items-center gap-x-2 rounded-md border border-zinc-200 px-4 py-2 text-sm font-pmedium text-zinc-800 hover:border-logo hover:text-logo">
    <Icon className="text-lg" />
    <span>{label}</span>
  </Link>
);

const ProgressPanel = ({ title, value, headline, helper }) => (
  <div className="bg-white border border-zinc-200 rounded-md p-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-psmbold text-zinc-950">{title}</h3>
      <span className="text-sm font-pmedium text-logo">{value}%</span>
    </div>
    <div className="mt-4 h-3 bg-zinc-100 rounded-full overflow-hidden">
      <div className="h-full bg-logo rounded-full transition-all" style={{ width: `${value}%` }} />
    </div>
    <p className="mt-4 text-xl font-psmbold text-zinc-950">{headline}</p>
    <p className="mt-2 text-sm text-zinc-500">{helper}</p>
  </div>
);

const ActionPanel = ({ title, actions }) => (
  <div className="bg-white border border-zinc-200 rounded-md p-6">
    <h3 className="text-lg font-psmbold text-zinc-950 mb-4">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {actions.map(({ href, label, Icon }) => (
        <Link key={href} href={href} className="flex items-center gap-x-3 rounded-md border border-zinc-200 px-4 py-3 text-sm font-pmedium text-zinc-800 hover:border-logo hover:text-logo">
          <Icon className="text-xl shrink-0" />
          <span>{label}</span>
        </Link>
      ))}
    </div>
  </div>
);

const InfoPanel = ({ title, text, icon }) => (
  <div className="bg-white border border-zinc-200 rounded-md p-6">
    <div className="w-12 h-12 rounded-md bg-orange-50 text-logo flex items-center justify-center text-2xl mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-psmbold text-zinc-950">{title}</h3>
    <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{text}</p>
  </div>
);
