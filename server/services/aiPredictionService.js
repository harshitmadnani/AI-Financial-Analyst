export const generatePredictions = async () => {
  return [
    {
      question: "Will NIFTY cross 24,000 this week?",
      options: [
        { label: "Yes", probability: 62 },
        { label: "No", probability: 38 }
      ]
    },
    {
      question: "Will RELIANCE hit ₹1500?",
      options: [
        { label: "Yes", probability: 55 },
        { label: "No", probability: 45 }
      ]
    },
    {
      question: "Will IT sector outperform?",
      options: [
        { label: "Yes", probability: 70 },
        { label: "No", probability: 30 }
      ]
    }
  ];
};