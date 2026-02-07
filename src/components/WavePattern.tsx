const WavePattern = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 1440 900"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path
      d="M0 600C240 500 480 700 720 600C960 500 1200 700 1440 600V900H0V600Z"
      fill="currentColor"
      fillOpacity="0.03"
    />
    <path
      d="M0 700C240 620 480 780 720 700C960 620 1200 780 1440 700V900H0V700Z"
      fill="currentColor"
      fillOpacity="0.02"
    />
    <path
      d="M0 800C240 750 480 850 720 800C960 750 1200 850 1440 800V900H0V800Z"
      fill="currentColor"
      fillOpacity="0.015"
    />
  </svg>
);

export default WavePattern;
