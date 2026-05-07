// src/utils/finance.js

export const getCurrentMonth = () => {
  const now = new Date();
  return {
    month: now.getMonth(),
    year: now.getFullYear()
  };
};

export const sum = (arr = []) =>
  arr.reduce((s, item) => s + (item.amount || 0), 0);

export const filterThisMonth = (items = []) => {
  const { month, year } = getCurrentMonth();

  return items.filter(i => {
    const d = new Date(i.created_at);
    return d.getMonth() === month && d.getFullYear() === year;
  });
};



// 🔹 MONTHLY VALUES
export const getMonthlyIncome = (incomes) =>
  sum(filterThisMonth(incomes));

export const getMonthlyExpenses = (expenses) =>
  sum(filterThisMonth(expenses));



// 🔹 AVAILABLE (YOUR RULE)
export const getAvailable = ({ wallet, incomes, expenses }) => {
  const starting = wallet?.balance || 0;

  const monthlyIncome = getMonthlyIncome(incomes);
  const monthlyExpenses = getMonthlyExpenses(expenses);

  const monthlyAvailable = monthlyIncome * 0.6;

  return {
    starting,
    monthlyIncome,
    monthlyExpenses,
    monthlyAvailable,
    remaining:
      starting + monthlyAvailable - monthlyExpenses
  };
};



// 🔹 EMERGENCY FUND (STABLE)
export const getEmergencyFund = ({ profile, goals }) => {
  const baseline = profile?.monthly_expense || 0;

  const existing = goals.find(g => g.name === "Emergency Fund");

  const saved = existing?.saved || 0;

  const targetMonths = 6;
  const target = baseline * targetMonths;

  const percent = target
    ? Math.min(100, Math.round((saved / target) * 100))
    : 0;

  const monthsCovered = baseline ? saved / baseline : 0;

  return {
    saved,
    target,
    percent,
    monthsCovered
  };
};

export const getExpenseBaseline = (expenses = [], wallet = null) => {
  const monthly = {};

  // 🔹 Group expenses per month
  expenses.forEach(e => {
    if (!e.created_at) return;

    const d = new Date(e.created_at);
    if (isNaN(d)) return;

    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthly[key] = (monthly[key] || 0) + (e.amount || 0);
  });

  const values = Object.values(monthly);

  // 🔹 Compute stats (safe even if empty)
  const highest = values.length ? Math.max(...values) : 0;
  const average = values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0;

  const onboarding = wallet?.expenses || 0;

  // 🔥 FINAL RULE (THIS IS THE FIX)
  return Math.max(highest, average, onboarding);
};