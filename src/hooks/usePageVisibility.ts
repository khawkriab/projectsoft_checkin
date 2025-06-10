import { useEffect, useState } from 'react';

const usePageVisibility = (): boolean => {
    const [isVisible, setIsVisible] = useState<boolean>(() => !document.hidden);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return isVisible;
};

export default usePageVisibility;
