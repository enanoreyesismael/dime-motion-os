import { getExpenseBaseline } from "./finance";

export const computeEmergencyFund = ({
  goals,
  expenses,
  wallet,
  monthlyIncome
}) => {
  const baseline = getExpenseBaseline(expenses, wallet);

  const goal = goals.find(g => g.type === "emergency");

  const saved = goal?.saved || 0;

  // 🔹 dynamic months
  let months = 6;
  if (saved >= baseline * 6) months = 9;
  if (saved >= baseline * 9) months = 12;
  if (saved >= baseline * 12) months = 18;
  if (saved >= baseline * 18) months = 24;

  const target = baseline * months;

  const percent = target
    ? Math.min((saved / target) * 100, 100)
    : 0;

  const gap = Math.max(target - saved, 0);

  const monthlyContribution = monthlyIncome * 0.2;

  const monthsToGoal = monthlyContribution
    ? Math.ceil(gap / monthlyContribution)
    : 0;

  return {
    goal,
    baseline,
    saved,
    target,
    percent,
    gap,
    months,
    monthlyContribution,
    monthsToGoal
  };
};