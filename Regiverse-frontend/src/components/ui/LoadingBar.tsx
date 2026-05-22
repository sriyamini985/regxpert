interface LoadingBarProps {
  isLoading: boolean;
}

const LoadingBar = ({ isLoading }: LoadingBarProps) => {
  if (!isLoading) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-[999] h-1 bg-muted overflow-hidden">
      <div className="h-full bg-primary animate-pulse" style={{ width: '30%' }} />
    </div>
  );
};

export default LoadingBar;