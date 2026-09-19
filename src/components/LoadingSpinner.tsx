cat << 'EOF' > components/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message = "தூக்கத்தில் இருக்கும் Server விழித்துக்கொள்கிறது, தயவுசெய்து சிறிது நேரம் காத்திருக்கவும்..."
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[200px]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm font-medium text-center max-w-xs animate-pulse">
        {message}
        </p>
        </div>
    );
};
EOF
