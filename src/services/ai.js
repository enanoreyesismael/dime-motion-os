export const getAIInsights = async (data) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer YOUR_OPENAI_API_KEY",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a financial advisor. Give short actionable advice.",
        },
        {
          role: "user",
          content: `Income: ${data.income}, Expenses: ${data.expenses}`,
        },
      ],
    }),
  });

  const result = await response.json();
  return result.choices[0].message.content;
};