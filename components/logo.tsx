'use client';

import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  href?: string;
}

const sizes = {
  sm: { h: 32, w: 130 },
  md: { h: 40, w: 162 },
  lg: { h: 56, w: 228 },
};

export function Logo({ size = 'md', className = '', href = '/' }: LogoProps) {
  const dim = sizes[size];
  return (
    <Link href={href} className={`inline-flex items-center ${className}`}>
      <Image
        src="/images/449DD949-1F0A-44B8-BC5B-6C98FEED14A8.PNG"
        alt="Devis Simple"
        width={dim.w}
        height={dim.h}
        style={{ objectFit: 'contain', height: dim.h, width: 'auto' }}
        priority
      />
    </Link>
  );
}

export function LogoIcon({ size = 'md', className = '' }: Omit<LogoProps, 'showText'>) {
  const dim = sizes[size];
  return (
    <Image
      src="/449DD949-1F0A-44B8-BC5B-6C98FEED14A8.PNG"
      alt="Devis Simple"
      width={dim.w}
      height={dim.h}
      style={{ objectFit: 'contain', height: dim.h, width: 'auto' }}
      className={className}
    />
  );
}
