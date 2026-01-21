import React, { useEffect, useRef, useState } from 'react';

// Hook personalizado para Intersection Observer
export const useIntersectionObserver = (options = {}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect(); // Solo animar una vez
            }
        }, { threshold: 0.1, ...options });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return { ref, isVisible };
};

// Componente wrapper para animaciones de scroll
interface AnimateOnScrollProps {
    children: React.ReactNode;
    animation?: 'slide-left' | 'slide-right' | 'slide-up' | 'fade-in' | 'scale-in';
    delay?: number;
    className?: string;
}

export const AnimateOnScroll: React.FC<AnimateOnScrollProps> = ({
    children,
    animation = 'slide-up',
    delay = 0,
    className = ''
}) => {
    const { ref, isVisible } = useIntersectionObserver();

    const baseClasses = 'transition-all duration-700 ease-out';

    const animationClasses = {
        'slide-left': isVisible
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 -translate-x-16',
        'slide-right': isVisible
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-16',
        'slide-up': isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-12',
        'fade-in': isVisible
            ? 'opacity-100'
            : 'opacity-0',
        'scale-in': isVisible
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95',
    };

    const delayStyle = delay ? { transitionDelay: `${delay}ms` } : {};

    return (
        <div
            ref={ref}
            className={`${baseClasses} ${animationClasses[animation]} ${className}`}
            style={delayStyle}
        >
            {children}
        </div>
    );
};

// Componente para stagger animations (elementos que se animan en secuencia)
interface StaggerContainerProps {
    children: React.ReactNode[];
    staggerDelay?: number;
    animation?: 'slide-left' | 'slide-right' | 'slide-up' | 'fade-in' | 'scale-in';
    className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
    children,
    staggerDelay = 100,
    animation = 'slide-up',
    className = ''
}) => {
    return (
        <div className={className}>
            {children.map((child, index) => (
                <AnimateOnScroll
                    key={index}
                    animation={animation}
                    delay={index * staggerDelay}
                >
                    {child}
                </AnimateOnScroll>
            ))}
        </div>
    );
};
